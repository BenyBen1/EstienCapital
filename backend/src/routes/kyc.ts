import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendEmail } from '../utils/email';
import { requireAuth } from '../middleware/auth';

const router = Router();

let sendAdminEmail = sendEmail;
if (process.env.NODE_ENV !== 'production') {
  sendAdminEmail = async (opts: any) => {
    console.log('[MOCK EMAIL] Would send email to:', opts.to, '\nSubject:', opts.subject, '\nText:', opts.text);
    // Return a dummy object to satisfy the type checker
    return Promise.resolve({
      accepted: [opts.to],
      rejected: [],
      envelopeTime: 0,
      messageTime: 0,
      messageSize: 0,
      response: '250 OK: Message queued',
      envelope: { from: opts.from || '', to: [opts.to] },
      messageId: '<mocked>',
      pending: []
    });
  };
}

// Submit KYC information
router.post('/submit', requireAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  try {
    const userId = req.user.id;
    const {
      firstName,
      middleName,
      lastName,
      gender,
      phoneNumber,
      dateOfBirth,
      idType,
      idNumber,
      idDocument, // { base64: string, fileName: string }
      kraPin,
      passportPhoto, // { base64: string, fileName: string }
      occupation,
      sourceOfWealth,
      physicalAddress,
      postalAddress,
      postalCode,
      city,
      country,
      countryOfResidency,
      nextOfKinFirstName,
      nextOfKinLastName,
      nextOfKinRelationship,
      nextOfKinPhone,
      nextOfKinEmail,
    } = req.body;

    // Validate file objects
    if (!idDocument || !idDocument.base64 || !idDocument.fileName) {
      return res.status(400).json({ error: 'Missing or invalid idDocument' });
    }
    if (!passportPhoto || !passportPhoto.base64 || !passportPhoto.fileName) {
      return res.status(400).json({ error: 'Missing or invalid passportPhoto' });
    }

    // Helper to decode base64 data URL
    function decodeBase64File(dataUrl: string) {
      // data:[mime];base64,[data]
      const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
      if (!matches) throw new Error('Invalid base64 file format');
      return {
        contentType: matches[1],
        buffer: Buffer.from(matches[2], 'base64'),
      };
    }

    // Decode and upload ID Document
    const idDocDecoded = decodeBase64File(idDocument.base64);
    const idDocumentPath = `kyc/${userId}/id_document_${Date.now()}_${idDocument.fileName}`;
    const { error: idDocError } = await supabaseAdmin.storage
      .from('documents')
      .upload(idDocumentPath, idDocDecoded.buffer, {
        contentType: idDocDecoded.contentType,
        upsert: true,
      });

    // Decode and upload Passport Photo
    const passportPhotoDecoded = decodeBase64File(passportPhoto.base64);
    const passportPhotoPath = `kyc/${userId}/passport_photo_${Date.now()}_${passportPhoto.fileName}`;
    const { error: photoError } = await supabaseAdmin.storage
      .from('documents')
      .upload(passportPhotoPath, passportPhotoDecoded.buffer, {
        contentType: passportPhotoDecoded.contentType,
        upsert: true,
      });

    if (idDocError || photoError) {
      console.error('ID Doc Upload Error:', idDocError);
      console.error('Passport Photo Upload Error:', photoError);
      throw new Error('Failed to upload documents');
    }

    // Store KYC information
    const { error: kycError } = await supabaseAdmin.from('kyc_submissions').insert([
      {
        user_id: userId,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        gender,
        phone_number: phoneNumber,
        date_of_birth: dateOfBirth,
        id_type: idType,
        id_number: idNumber,
        id_document_path: idDocumentPath,
        kra_pin: kraPin,
        passport_photo_path: passportPhotoPath,
        occupation,
        source_of_wealth: sourceOfWealth,
        physical_address: physicalAddress,
        postal_address: postalAddress,
        postal_code: postalCode,
        city,
        country: country || countryOfResidency,
        next_of_kin_first_name: nextOfKinFirstName,
        next_of_kin_last_name: nextOfKinLastName,
        next_of_kin_relationship: nextOfKinRelationship,
        next_of_kin_phone: nextOfKinPhone,
        next_of_kin_email: nextOfKinEmail,
        status: 'pending',
      },
    ]);

    if (kycError) throw kycError;

    // Update user profile KYC status
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ kyc_status: 'pending' })
      .eq('id', userId);

    if (profileError) throw profileError;

    // Notify admin
    await sendAdminEmail({
      to: process.env.ADMIN_EMAIL || '',
      subject: 'New KYC Submission',
      text: `A new KYC submission has been received from user ${userId}. Please review the submission.`,
    });

    res.status(201).json({ message: 'KYC submission received' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get KYC status
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('kyc_submissions')
      .select('status, rejection_reason')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update KYC status (admin only)
router.put('/update-status/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, rejectionReason } = req.body;

    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('kyc_submissions')
      .update({
        status,
        rejection_reason: rejectionReason,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
      .select('user_id')
      .single();

    if (submissionError) throw submissionError;

    // Update user profile KYC status
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ kyc_status: status })
      .eq('id', submission.user_id);

    if (profileError) throw profileError;

    // Notify user
    const { data: user } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', submission.user_id)
      .single();

    if (user) {
      await sendEmail({
        to: user.email,
        subject: 'KYC Status Update',
        text: `Your KYC submission has been ${status}. ${
          status === 'rejected' ? `Reason: ${rejectionReason}` : ''
        }`,
      });
    }

    res.json({ message: 'KYC status updated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 