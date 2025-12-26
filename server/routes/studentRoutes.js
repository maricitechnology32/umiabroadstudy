// // // const express = require('express');
// // // const { inviteStudent, getStudents, getMyProfile, updateStudentProfile } = require('../controllers/studentController');
// // // const { protect, authorize } = require('../middleware/authMiddleware');

// // // const router = express.Router();

// // // router.use(protect);

// // // // Student routes
// // // router.get('/me', authorize('student'), getMyProfile);

// // // // Consultancy Admin routes
// // // router.post('/invite', authorize('consultancy_admin'), inviteStudent);
// // // router.get('/', authorize('consultancy_admin'), getStudents);

// // // // Shared routes (Update profile)
// // // router.put('/:id', authorize('student', 'consultancy_admin'), updateStudentProfile);

// // // module.exports = router;

// // const express = require('express');
// // const { 
// //     inviteStudent, 
// //     getStudents, 
// //     getMyProfile, 
// //     updateStudentProfile,
// //     getStudentById 
// // } = require('../controllers/studentController');
// // const { protect, authorize } = require('../middleware/authMiddleware');

// // const router = express.Router();

// // // 1. Apply auth middleware to all routes
// // router.use(protect);

// // // 2. Student specific route (Must be before /:id)
// // router.get('/me', authorize('student'), getMyProfile);

// // // 3. Consultancy Admin routes
// // router.post('/invite', authorize('consultancy_admin'), inviteStudent);
// // router.get('/', authorize('consultancy_admin'), getStudents);

// // // 4. Admin View Specific Student (This is the one likely causing issues if getStudentById is undefined)
// // router.get('/:id', authorize('consultancy_admin'), getStudentById);

// // // 5. Update Profile (Shared)
// // router.put('/:id', authorize('student', 'consultancy_admin'), updateStudentProfile);

// // module.exports = router;

// const express = require('express');
// const { 
//     inviteStudent, 
//     getStudents, 
//     getMyProfile, 
//     updateStudentProfile,
//     getStudentById 
// } = require('../controllers/studentController');
// const { protect, authorize } = require('../middleware/authMiddleware');

// const router = express.Router();

// // 1. Apply auth middleware to all routes
// router.use(protect);

// // 2. Student specific route (Only Students)
// router.get('/me', authorize('student'), getMyProfile);

// // 3. Consultancy Routes (Admins + Staff)
// // allow 'consultancy_staff' sub-roles to access these:
// const staffRoles = ['consultancy_admin', 'document_officer', 'receptionist'];

// router.post('/invite', authorize(...staffRoles), inviteStudent);
// router.get('/', authorize(...staffRoles), getStudents);
// router.get('/:id', authorize(...staffRoles), getStudentById);

// // 4. Update Profile (Shared)
// // Students update themselves, Staff updates students
// router.put('/:id', authorize('student', ...staffRoles), updateStudentProfile);

// module.exports = router;

const express = require('express');
const {
    inviteStudent,
    getStudents,
    getMyProfile,
    updateStudentProfile,
    getStudentById
} = require('../controllers/studentController');
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

module.exports = router;