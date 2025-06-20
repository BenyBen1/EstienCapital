import { Router } from 'express';
import { supabase } from '../index';
import { sendEmail } from '../utils/email';

const router = Router();

// Submit KYC information
router.post('/submit', async (req, res) => {
  try {
    const {
      userId,
      firstName,
      middleName,
      lastName,
      gender,
      phoneNumber,
      dateOfBirth,
      idType,
      idNumber,
      idDocument,
      kraPin,
      passportPhoto,
      occupation,
      sourceOfWealth,
      physicalAddress,
      postalAddress,
      postalCode,
      city,
      country,
      nextOfKinFirstName,
      nextOfKinLastName,
      nextOfKinRelationship,
      nextOfKinPhone,
      nextOfKinEmail,
    } = req.body;

    // Upload documents to Supabase Storage
    const idDocumentPath = `kyc/${userId}/id_document.${idDocument.split('.').pop()}`;
    const passportPhotoPath = `kyc/${userId}/passport_photo.${passportPhoto.split('.').pop()}`;

    const { error: idDocError } = await supabase.storage
      .from('documents')
      .upload(idDocumentPath, idDocument);

    const { error: photoError } = await supabase.storage
      .from('documents')
      .upload(passportPhotoPath, passportPhoto);

    if (idDocError || photoError) {
      throw new Error('Failed to upload documents');
    }

    // Store KYC information
    const { error: kycError } = await supabase.from('kyc_submissions').insert([
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
        country,
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
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ kyc_status: 'pending' })
      .eq('id', userId);

    if (profileError) throw profileError;

    // Notify admin
    await sendEmail({
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

    const { data, error } = await supabase
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

    const { data: submission, error: submissionError } = await supabase
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
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ kyc_status: status })
      .eq('id', submission.user_id);

    if (profileError) throw profileError;

    // Notify user
    const { data: user } = await supabase
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