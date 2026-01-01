const Student = require('../models/Student');
const University = require('../models/University'); // If needed for validation

// @desc    Upload Application Document (Draft/Initial)
// @route   POST /api/students/:id/documents
// @access  Private (Admin, Counselor)
exports.uploadApplicationDocument = async (req, res) => {
    try {
        const { type, universityId, originalUrl, notes } = req.body;

        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Authorization check (Consultancy Match)
        if (student.consultancy.toString() !== req.user.consultancyId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const newDoc = {
            type,
            universityId: universityId || null,
            originalUrl,
            status: 'Draft',
            generatedBy: req.user._id,
            notes
        };

        student.applicationDocuments.push(newDoc);
        await student.save();

        res.status(201).json({ success: true, data: student.applicationDocuments });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update Application Document (Replace File/Edit Info)
// @route   PUT /api/students/:id/documents/:docId
// @access  Private (Admin, Counselor, Staff)
exports.updateApplicationDocument = async (req, res) => {
    try {
        const { universityId, originalUrl, notes } = req.body;

        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Authorization check
        if (student.consultancy.toString() !== req.user.consultancyId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const doc = student.applicationDocuments.id(req.params.docId);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Update fields if provided
        if (universityId) doc.universityId = universityId;
        if (notes) doc.notes = notes;

        // If file is replaced, update URL and reset status if needed
        if (originalUrl) {
            doc.originalUrl = originalUrl;
            // Optionally reset status or keep as Draft? 
            // Usually if replacing draft, it stays draft. If replacing pending, it might need re-verification.
            if (doc.status === 'Rejected') {
                doc.status = 'Pending Verification'; // Re-submit for verification
            }
        }

        doc.updatedAt = Date.now();
        await student.save();

        res.status(200).json({ success: true, data: student.applicationDocuments });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Upload Verified/Signed Document (Receptionist/Admin)
// @route   PUT /api/students/:id/documents/:docId/verify-upload
// @access  Private (Admin, Staff)
exports.uploadVerifiedDocument = async (req, res) => {
    try {
        const { verifiedUrl } = req.body;

        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Find sub-document
        const doc = student.applicationDocuments.id(req.params.docId);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // Update fields
        doc.verifiedUrl = verifiedUrl;
        doc.status = 'Pending Verification'; // Moves to Admin queue
        doc.updatedAt = Date.now();

        await student.save();

        res.status(200).json({ success: true, data: student.applicationDocuments });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Final Verification of Document (Admin only)
// @route   PUT /api/students/:id/documents/:docId/status
// @access  Private (Admin, Manager)
exports.updateDocumentStatus = async (req, res) => {
    try {
        const { status, notes } = req.body; // 'Verified' or 'Rejected'

        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const doc = student.applicationDocuments.id(req.params.docId);
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        doc.status = status;
        if (notes) doc.notes = notes;

        if (status === 'Verified') {
            doc.verifiedBy = req.user._id;
        }

        doc.updatedAt = Date.now();
        await student.save();

        res.status(200).json({ success: true, data: student.applicationDocuments });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get All Pending Documents (For Dashboard)
// @route   GET /api/documents/pending
// @access  Private (Admin, Staff)
exports.getPendingDocuments = async (req, res) => {
    try {
        // Find students who have documents in specific statuses
        const statusFilter = req.query.status
            ? req.query.status.split(',')
            : ['Draft', 'Pending Verification'];

        const students = await Student.find({
            consultancy: req.user.consultancyId,
            'applicationDocuments.status': { $in: statusFilter }
        })
            .select('personalInfo applicationDocuments') // Optimize query
            .populate('applicationDocuments.universityId', 'name')
            .populate('applicationDocuments.generatedBy', 'name');

        // Flatten the list for easier frontend consumption
        let documents = [];
        students.forEach(student => {
            student.applicationDocuments.forEach(doc => {
                if (statusFilter.includes(doc.status)) {
                    documents.push({
                        ...doc.toObject(),
                        studentId: student._id,
                        studentName: `${student.personalInfo.firstName} ${student.personalInfo.lastName}`,
                        studentPhoto: student.personalInfo.photoUrl
                    });
                }
            });
        });

        // Sort by date desc
        documents.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        res.status(200).json({ success: true, count: documents.length, data: documents });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
