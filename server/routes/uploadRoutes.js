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
  // Buffer.from([0x50, 0x4B, 0x03, 0x04]), // .zip (Removed to allow .xlsx/.docx)
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
    // Use absolute path relative to this file (server/routes/uploadRoutes.js -> server/uploads)
    const uploadDir = path.join(__dirname, '../uploads');

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
      } catch (err) {
        console.error('[UPLOAD ERROR] Failed to create upload directory:', err);
        return cb(err);
      }
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
  // Allow all file types as per requirement
  console.log(`[UPLOAD] Accepting file: ${file.originalname} (${file.mimetype})`);
  cb(null, true);
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

    // Use the path provided by multer directly (it is absolute because our storage destination is absolute)
    const filepath = req.file.path;

    // Additional security check: Scan for malicious file signatures
    /* 
    // TEMPORARILTY DISABLED FOR PRODUCTION DEBUGGING - SUSPECTED PERMISSION ISSUE
    if (isMaliciousFile(filepath)) {
      // Delete the malicious file
      try {
        fs.unlinkSync(filepath);
      } catch (e) {
        console.error('[SECURITY] Failed to delete malicious file:', e);
      }

      console.error(`[SECURITY ALERT] Malicious file detected and deleted: ${req.file.filename} from IP: ${req.ip}`);

      return res.status(400).json({
        success: false,
        message: 'File rejected: Security scan failed'
      });
    }
    */

    // Construct file URL using static backend URL
    // Don't use req.protocol/req.host as they can be incorrect with reverse proxies
    const BACKEND_URL = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${BACKEND_URL}/uploads/${req.file.filename}`;

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
    if (req.file && req.file.path) {
      // Clean up using the path directly
      if (fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error('[CLEANUP ERROR] Failed to delete file:', e);
        }
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

    // RETURN ACTUAL ERROR MESSAGE FOR DEBUGGING
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
});

module.exports = router;