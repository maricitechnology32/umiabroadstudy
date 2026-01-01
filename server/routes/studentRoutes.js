const express = require('express');
const {
    inviteStudent,
    getStudents,
    getMyProfile,
    updateStudentProfile,
    getStudentById
} = require('../controllers/studentController');
const {
    uploadApplicationDocument,
    uploadVerifiedDocument,
    updateDocumentStatus,
    getPendingDocuments,
    updateApplicationDocument
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    studentInviteValidation,
    handleValidationErrors
} = require('../middleware/securityMiddleware');

const router = express.Router();

router.use(protect);

// --- Role Definitions ---
// Who can VIEW and INVITE students?
const VIEW_ACCESS = ['consultancy_admin', 'manager', 'document_officer', 'receptionist', 'counselor'];

// Who can EDIT profiles?
const EDIT_ACCESS = ['consultancy_admin', 'manager', 'document_officer', 'receptionist', 'counselor'];

// --- Routes ---

// 1. Student Self-Access
router.get('/me', authorize('student'), getMyProfile);

// 2. Consultancy Actions (with input validation on invite)
router.post('/invite', authorize(...VIEW_ACCESS), studentInviteValidation, handleValidationErrors, inviteStudent);
router.get('/', authorize(...VIEW_ACCESS), getStudents);
router.get('/:id', authorize(...VIEW_ACCESS), getStudentById);

// 3. Update Profile (Shared)
router.put('/:id', authorize('student', ...EDIT_ACCESS), updateStudentProfile);

// 4. Document Verification Workflow
router.post('/:id/documents', authorize(...EDIT_ACCESS), uploadApplicationDocument);
router.put('/:id/documents/:docId', authorize(...EDIT_ACCESS), updateApplicationDocument);
router.put('/:id/documents/:docId/verify-upload', authorize(...VIEW_ACCESS), uploadVerifiedDocument);
router.put('/:id/documents/:docId/status', authorize('consultancy_admin', 'manager'), updateDocumentStatus);

// 5. Dashboard Helper
router.get('/documents/pending', authorize(...VIEW_ACCESS), getPendingDocuments);

module.exports = router;