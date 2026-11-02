import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure storage directories exist
const uploadBaseDir = path.join(__dirname, '../../uploads');
const documentsDir = path.join(uploadBaseDir, 'documents');
const mediaDir = path.join(uploadBaseDir, 'media');

[uploadBaseDir, documentsDir, mediaDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Allowed file types
const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

// Storage engine for sensitive documents (strictly restricted)
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `doc_${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

// Storage engine for public store media & catalog pictures
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mediaDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `media_${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

// File filter for legal documents
const docFileFilter = (req, file, cb) => {
  if (ALLOWED_DOC_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid document format. Only PDF, JPG, JPEG, and PNG files are accepted.'), false);
  }
};

// File filter for general images
const mediaFileFilter = (req, file, cb) => {
  if (ALLOWED_MEDIA_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Only JPG, PNG, and WebP images are accepted.'), false);
  }
};

export const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: docFileFilter,
});

export const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: mediaFileFilter,
});

export { documentsDir, mediaDir };
