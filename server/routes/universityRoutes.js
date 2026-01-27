const express = require('express');
const { 
    addUniversity, 
    getUniversities, 
    applyToUniversity, 
    searchMasterUniversities, 
    importUniversity,
    updateApplicationStatus
} = require('../controllers/universityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Roles allowed to MANAGE universities (Add, Import, Apply)
// Counselors are explicitly included here
const managers = ['consultancy_admin', 'manager', 'counselor'];

// Roles allowed to VIEW (Everyone needs to see the list)
const viewers = ['consultancy_admin', 'manager', 'counselor', 'document_officer', 'receptionist'];

router.route('/')
    .get(authorize(...viewers), getUniversities)
    .post(authorize(...managers), addUniversity);

router.post('/apply', authorize(...managers), applyToUniversity);
router.put('/application/:studentId/:appId', authorize(...managers), updateApplicationStatus);

// Master DB features (For searching global list)
router.get('/master/search', authorize(...managers), searchMasterUniversities);
router.post('/import', authorize(...managers), importUniversity);

module.exports = router;