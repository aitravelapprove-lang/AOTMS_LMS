const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DoubtSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // We store student details denormalized or populated? 
    // Frontend expects student_name/email on the doubt object usually, but population is better.
    // However, looking at the code, it uses student_name directly sometimes. 
    // Let's rely on population but support fallback if needed.
    
    course_id: { type: Schema.Types.ObjectId, ref: 'Course' }, // Optional linkage to course
    playlist_id: { type: String }, // Can be playlist ID or course ID
    video_id: { type: Schema.Types.ObjectId, ref: 'Video' }, // Optional linkage to specific video
    video_title: { type: String }, // Snapshot title for context
    
    question: { type: String, required: true },
    status: { type: String, enum: ['pending', 'answered', 'solved'], default: 'pending' },
    is_pinned: { type: Boolean, default: false },
    
    // Denormalized for easier listing without heavy joins every time
    student_name: { type: String },
    student_email: { type: String },
    
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Virtual for id
DoubtSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

const DoubtReplySchema = new Schema({
    doubt_id: { type: Schema.Types.ObjectId, ref: 'Doubt', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    answer: { type: String, required: true },
    is_instructor: { type: Boolean, default: false },
    is_pinned: { type: Boolean, default: false },
    
    // Denormalized
    user_name: { type: String },
    user_avatar: { type: String },
    
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

DoubtReplySchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

module.exports = {
    Doubt: mongoose.model('Doubt', DoubtSchema),
    DoubtReply: mongoose.model('DoubtReply', DoubtReplySchema)
};
