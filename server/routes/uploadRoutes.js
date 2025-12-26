const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');
const { uploadLimiter } = require('../middleware/securityMiddleware');

const router = express.Router();

// ============================================
// SECURE FILE UPLOAD CONFIGURATION
// ============================================

// Allowed file types (MIME types and extensions)
const ALLOWED_FILE_TYPES = {
  images: {
    mimetypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  documents: {
    mimetypes: ['application/pdf'],
    extensions: ['.pdf']
  }
};

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Malicious file signatures (magic numbers) to block
const MALICIOUS_SIGNATURES = [
  Buffer.from([0x4D, 0x5A]), // .exe
  Buffer.from([0x50, 0x4B, 0x03, 0x04]), // .zip (can contain malware)
  Buffer.from([0x1F, 0x8B]), // .gz
  Buffer.from([0x23, 0x21]), // Script files (#!)
];

/**
 * Sanitize filename to prevent path traversal attacks
 */
const sanitizeFilename = (filename) => {
  // Remove path separators and null bytes
  return filename
    .replace(/[\/\\]/g, '')
    .replace(/\0/g, '')
    .replace(/\.\./g, '')
    .replace(/[<>:"|?*]/g, '') // Remove invalid chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 100); // Limit length
};

/**
 * Check if file contains malicious signatures
 */
const isMaliciousFile = (filepath) => {
  const buffer = Buffer.alloc(4);
  const fd = fs.openSync(filepath, 'r');
  fs.readSync(fd, buffer, 0, 4, 0);
  fs.closeSync(fd);

  for (const signature of MALICIOUS_SIGNATURES) {
    if (buffer.slice(0, signature.length).equals(signature)) {
      return true;
    }
  }
  return false;
};

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate cryptographically secure random filename
    const randomName = crypto.randomBytes(16).toString('hex');
    const sanitizedOriginal = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitizedOriginal).toLowerCase();

    // Format: {timestamp}-{random}-{sanitized-original}
    const uniqueFilename = `${Date.now()}-${randomName}${ext}`;

    cb(null, uniqueFilename);
  }
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype.toLowerCase();

  // Check if file type is allowed (images or PDFs)
  const isImageAllowed =
    ALLOWED_FILE_TYPES.images.mimetypes.includes(mimetype) &&
    ALLOWED_FILE_TYPES.images.extensions.includes(ext);

  const isDocumentAllowed =
    ALLOWED_FILE_TYPES.documents.mimetypes.includes(mimetype) &&
    ALLOWED_FILE_TYPES.documents.extensions.includes(ext);

  if (isImageAllowed || isDocumentAllowed) {
    // Log successful upload attempt
    console.log(`[UPLOAD] Accepting file: ${file.originalname} (${mimetype})`);
    cb(null, true);
  } else {
    // Reject file
    console.warn(`[SECURITY] Rejected file: ${file.originalname} (${mimetype}) - Invalid type`);
    cb(new Error(`File type not allowed. Only images (JPG, PNG, GIF, WebP) and PDFs are accepted.`), false);
  }
};

// Configure Multer with security settings
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // 5MB limit
    files: 1 // Only 1 file per request
  },
  fileFilter: fileFilter
});

// ============================================
// UPLOAD ENDPOINT
// ============================================

/**
 * @desc    Upload a file (images or PDFs)
 * @route   POST /api/upload
 * @access  Private (requires authentication)
 */
router.post('/', protect, uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filepath = path.join(__dirname, '..', req.file.path);

    // Additional security check: Scan for malicious file signatures
    if (isMaliciousFile(filepath)) {
      // Delete the malicious file
      fs.unlinkSync(filepath);

      console.error(`[SECURITY ALERT] Malicious file detected and deleted: ${req.file.filename} from IP: ${req.ip}`);

      return res.status(400).json({
        success: false,
        message: 'File rejected: Security scan failed'
      });
    }

    // Construct file URL
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    // Log successful upload
    console.log(`[UPLOAD SUCCESS] File: ${req.file.filename}, User: ${req.user.id}, IP: ${req.ip}`);

    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

  } catch (error) {
    console.error('[UPLOAD ERROR]', error);

    // Delete file if it was uploaded but processing failed
    if (req.file) {
      const filepath = path.join(__dirname, '..', req.file.path);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    // Handle Multer-specific errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${error.message}`
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
});

module.exports = router;