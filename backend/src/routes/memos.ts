import { Router } from 'express';
import { supabase } from '../index';
import { supabaseAdmin } from '../config/supabase';
import { sendEmail } from '../utils/email';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/memos - Get published memos for users
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query = supabase
      .from('memos')
      .select('id, title, summary, author, category, published_at, created_at', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: memos, error, count } = await query
      .range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

    if (error) throw error;

    res.json({
      memos: memos || [],
      total: count || 0,
      page: pageNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });
  } catch (error: any) {
    console.error('Error fetching memos:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/memos/:id - Get a single memo by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: memo, error } = await supabase
      .from('memos')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error || !memo) {
      return res.status(404).json({ error: 'Memo not found' });
    }

    // Format for mobile app compatibility
    const formattedMemo = {
      ...memo,
      timestamp: new Date(memo.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    };

    res.json(formattedMemo);
  } catch (error: any) {
    console.error('Error fetching memo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ADMIN ROUTES

// GET /api/memos/admin/all - Get all memos for admin
router.get('/admin/all', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    let query = supabaseAdmin
      .from('memos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: memos, error, count } = await query
      .range((pageNum - 1) * limitNum, pageNum * limitNum - 1);

    if (error) throw error;

    res.json({
      memos: memos || [],
      total: count || 0,
      page: pageNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });
  } catch (error: any) {
    console.error('Error fetching admin memos:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/memos/admin/create - Create a new memo
router.post('/admin/create', async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      category,
      author = 'Estien Capital CIO',
      sendEmail: shouldSendEmail = true,
      sendAppNotification = true,
      publishImmediately = true,
      scheduledPublishAt
    } = req.body;

    const memoData = {
      title,
      summary,
      content,
      category,
      author,
      send_email: shouldSendEmail,
      send_app_notification: sendAppNotification,
      publish_immediately: publishImmediately,
      scheduled_publish_at: scheduledPublishAt,
      created_by: req.user?.id || null, // Make optional for testing
      admin_name: author,
      status: publishImmediately ? 'published' : 'draft',
      published_at: publishImmediately ? new Date().toISOString() : null
    };

    const { data: memo, error } = await supabaseAdmin
      .from('memos')
      .insert([memoData])
      .select()
      .single();

    if (error) throw error;

    // If publishing immediately, trigger delivery
    if (publishImmediately) {
      await triggerMemoDelivery(memo.id, shouldSendEmail, sendAppNotification);
    }

    res.status(201).json(memo);
  } catch (error: any) {
    console.error('Error creating memo:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/memos/admin/:id - Update memo
router.put('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: memo, error } = await supabaseAdmin
      .from('memos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(memo);
  } catch (error: any) {
    console.error('Error updating memo:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/memos/admin/:id/publish - Publish a draft memo
router.post('/admin/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { sendEmail: shouldSendEmail = true, sendAppNotification = true } = req.body;

    const { data: memo, error } = await supabaseAdmin
      .from('memos')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        send_email: shouldSendEmail,
        send_app_notification: sendAppNotification
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Trigger delivery
    await triggerMemoDelivery(id, shouldSendEmail, sendAppNotification);

    res.json({ message: 'Memo published successfully', memo });
  } catch (error: any) {
    console.error('Error publishing memo:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/memos/admin/:id/analytics - Get memo delivery analytics
router.get('/admin/:id/analytics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: deliveries, error } = await supabaseAdmin
      .from('memo_deliveries')
      .select('*')
      .eq('memo_id', id);

    if (error) throw error;

    const analytics = {
      totalUsers: deliveries?.length || 0,
      emailsSent: deliveries?.filter(d => d.email_sent).length || 0,
      emailsOpened: deliveries?.filter(d => d.email_opened).length || 0,
      appNotificationsSent: deliveries?.filter(d => d.app_notification_sent).length || 0,
      readInApp: deliveries?.filter(d => d.read_in_app).length || 0,
      emailOpenRate: deliveries?.length ? ((deliveries.filter(d => d.email_opened).length / deliveries.filter(d => d.email_sent).length) * 100).toFixed(1) : '0',
      appReadRate: deliveries?.length ? ((deliveries.filter(d => d.read_in_app).length / deliveries.length) * 100).toFixed(1) : '0'
    };

    res.json(analytics);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to trigger memo delivery to all users
async function triggerMemoDelivery(memoId: string, shouldSendEmail: boolean, shouldSendAppNotification: boolean) {
  try {
    // Get all users (both individual and group accounts)
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name, last_name')
      .in('account_type', ['individual', 'group']);

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      console.log('No users found for memo delivery');
      return;
    }

    // Get memo details
    const { data: memo, error: memoError } = await supabaseAdmin
      .from('memos')
      .select('*')
      .eq('id', memoId)
      .single();

    if (memoError) throw memoError;

    console.log(`Delivering memo "${memo.title}" to ${users.length} users`);

    // Create delivery records
    const deliveryRecords = users.map(user => ({
      memo_id: memoId,
      user_id: user.id,
      app_notification_sent: shouldSendAppNotification,
      app_notification_sent_at: shouldSendAppNotification ? new Date().toISOString() : null
    }));

    const { error: deliveryError } = await supabaseAdmin
      .from('memo_deliveries')
      .insert(deliveryRecords);

    if (deliveryError) throw deliveryError;

    // Send emails if enabled
    if (shouldSendEmail) {
      console.log(`Sending emails for memo "${memo.title}"`);
      
      for (const user of users) {
        try {
          await sendEmail({
            to: user.email,
            subject: `New CIO Memo: ${memo.title}`,
            text: `New Memo from Estien Capital CIO: ${memo.title}\n\n${memo.summary || ''}\n\n${memo.content}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1a73e8;">New Memo from Estien Capital CIO</h2>
                <h3>${memo.title}</h3>
                ${memo.summary ? `<p style="font-style: italic; color: #666;">${memo.summary}</p>` : ''}
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="white-space: pre-line; line-height: 1.6;">${memo.content}</p>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  <strong>Author:</strong> ${memo.author}<br>
                  <strong>Category:</strong> ${memo.category}<br>
                  <strong>Date:</strong> ${new Date(memo.published_at).toLocaleDateString()}
                </p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">
                  You received this memo because you are a valued client of Estien Capital. 
                  This memo is also available in your mobile app.
                </p>
              </div>
            `
          });

          // Update delivery record
          await supabaseAdmin
            .from('memo_deliveries')
            .update({
              email_sent: true,
              email_sent_at: new Date().toISOString()
            })
            .eq('memo_id', memoId)
            .eq('user_id', user.id);

        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
        }
      }
    }

    console.log(`Memo delivery completed for "${memo.title}"`);
  } catch (error) {
    console.error('Error in triggerMemoDelivery:', error);
    throw error;
  }
}

export default router; 