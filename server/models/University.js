const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
    // Link to the Consultancy that "owns" this partner record
    consultancyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultancy',
        required: true
    },
    // Optional link back to the Master DB (if imported)
    masterUniversityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterUniversity'
    },
    name: { 
        type: String, 
        required: [true, 'University Name is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    type: {
        type: String,
        enum: ['Language School', 'University', 'Vocational College'],
        default: 'Language School'
    },
    
    // Consultancy Specific Business Data
    commissionPercentage: { 
        type: Number, 
        default: 0 
    }, 
    notes: String, // Private notes for the consultancy staff
    intakes: [String], // e.g. ['April', 'October']
    
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('University', universitySchema);