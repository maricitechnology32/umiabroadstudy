const University = require('../models/University');
const MasterUniversity = require('../models/MasterUniversity');
const Student = require('../models/Student');

// @desc    Add a new University to the Consultancy's Database (Manual Add)
// @route   POST /api/universities
// @access  Private (Admin, Manager, Counselor)
exports.addUniversity = async (req, res) => {
    try {
        const { name, location, type, intakes, commissionPercentage } = req.body;
        
        if (!name || !location) {
            return res.status(400).json({ success: false, message: 'University Name and Location are required' });
        }

        const university = await University.create({
            consultancyId: req.user.consultancyId,
            name,
            location,
            type,
            intakes,
            commissionPercentage
        });

        res.status(201).json({ success: true, data: university });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all universities for this consultancy
// @route   GET /api/universities
// @access  Private (Staff)
exports.getUniversities = async (req, res) => {
    try {
        const universities = await University.find({ consultancyId: req.user.consultancyId })
            .sort('-createdAt');
        res.status(200).json({ success: true, count: universities.length, data: universities });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Apply Student to University (Add to applications array)
// @route   POST /api/universities/apply
// @access  Private (Admin, Counselor)
exports.applyToUniversity = async (req, res) => {
    try {
        const { studentId, universityId, course, intake, status, notes } = req.body;

        const student = await Student.findById(studentId);
        const university = await University.findById(universityId);

        if (!student || !university) {
            return res.status(404).json({ success: false, message: 'Student or University not found' });
        }

        // Authorization Check: Ensure student belongs to the same consultancy
        if (student.consultancy.toString() !== req.user.consultancyId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to manage this student' });
        }

        // Add application
        student.applications.push({
            universityId: university._id,
            universityName: university.name,
            course: course || 'Japanese Language Course',
            intake: intake || 'April 2025',
            status: status || 'Shortlisted',
            notes
        });

        await student.save();

        res.status(200).json({ success: true, data: student.applications });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update Application Status
// @route   PUT /api/universities/application/:studentId/:appId
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const student = await Student.findById(req.params.studentId);

        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        // Ensure authorization
        if (student.consultancy.toString() !== req.user.consultancyId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const appIndex = student.applications.findIndex(app => app._id.toString() === req.params.appId);
        if (appIndex === -1) return res.status(404).json({ success: false, message: 'Application not found' });

        // Update fields
        if (status) student.applications[appIndex].status = status;
        if (notes) student.applications[appIndex].notes = notes;

        await student.save();
        res.status(200).json({ success: true, data: student.applications });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};


// @desc    Search Master Database (Super Admin's List)
// @route   GET /api/universities/master/search
exports.searchMasterUniversities = async (req, res) => {
    try {
        const keyword = req.query.q 
            ? { name: { $regex: req.query.q, $options: 'i' } } 
            : {};
        const universities = await MasterUniversity.find(keyword).limit(20);
        res.status(200).json({ success: true, data: universities });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Import from Master DB to Consultancy List
// @route   POST /api/universities/import
exports.importUniversity = async (req, res) => {
    try {
        const { masterId, commission } = req.body;
        const masterData = await MasterUniversity.findById(masterId);
        
        if (!masterData) return res.status(404).json({ success: false, message: 'University not found in Master DB' });

        // Check duplicate in local list
        const exists = await University.findOne({ 
            consultancyId: req.user.consultancyId, 
            masterUniversityId: masterId 
        });
        if (exists) return res.status(400).json({ success: false, message: 'Already in your partner list' });

        const newUni = await University.create({
            consultancyId: req.user.consultancyId,
            masterUniversityId: masterId,
            name: masterData.name,
            location: masterData.location,
            type: masterData.type,
            intakes: masterData.intakes,
            commissionPercentage: commission || 0
        });

        res.status(201).json({ success: true, data: newUni });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};