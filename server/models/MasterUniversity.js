const mongoose = require('mongoose');

const masterUniversitySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'University Name is required'], 
        unique: true,
        trim: true
    },
    location: { 
        type: String, 
        required: [true, 'Location is required'], // e.g., "Tokyo, Japan"
        trim: true
    }, 
    type: { 
        type: String, 
        enum: ['Language School', 'University', 'Vocational College'], 
        default: 'Language School' 
    },
    website: String,
    
    // Enterprise features
    ranking: Number,
    intakes: [String], // e.g. ['April', 'July', 'October', 'January']
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MasterUniversity', masterUniversitySchema);