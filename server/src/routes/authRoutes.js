import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import {
  sendOtp,
  register,
  login,
  resetPassword,
  changePassword,
  checkAvailability,
  quickLogin,
  getMe,
  updateProfile,
  addAddress,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadDocument, uploadMedia, documentsDir, mediaDir } from '../services/documentStorageService.js';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.get('/check-availability', checkAvailability);
router.post('/send-otp', sendOtp);
router.post('/quick-login', quickLogin);

// Protected user profile & settings endpoints
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/address', authenticate, addAddress);

// Secure document upload endpoint (PDF, JPG, PNG up to 5MB)
router.post('/upload-document', authenticate, uploadDocument.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document file provided.' });
    }

    const fileUrl = `/api/v1/auth/documents/${req.file.filename}`;

    return res.json({
      success: true,
      message: 'Document uploaded securely.',
      file: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileUrl,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
  }
});

// Media upload endpoint for store banners, dish photos, posts
router.post('/upload-media', authenticate, uploadMedia.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No media file provided.' });
    }

    const fileUrl = `/api/v1/auth/media/${req.file.filename}`;

    return res.json({
      success: true,
      message: 'Media uploaded successfully.',
      fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
  }
});

// Secure Document Retrieval Endpoint (Guarded by Authentication)
router.get('/documents/:filename', authenticate, (req, res) => {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);
  const filePath = path.join(documentsDir, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Requested document not found.' });
  }

  // Set security headers to prevent public execution
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.sendFile(filePath);
});

// Media Retrieval Endpoint
router.get('/media/:filename', (req, res) => {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);
  const filePath = path.join(mediaDir, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Media not found.' });
  }

  return res.sendFile(filePath);
});

export default router;
