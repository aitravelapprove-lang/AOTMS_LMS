const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssignmentSchema = new Schema({
    course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String },
    due_date: { type: Date },
    max_score: { type: Number, default: 100 },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date }
});
AssignmentSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

const SubmissionSchema = new Schema({
    assignment_id: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    file_url: { type: String },
    content: { type: String },
    score: { type: Number },
    feedback: { type: String },
    submitted_at: { type: Date, default: Date.now }
});
SubmissionSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

const PlaylistSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    videos: [{
        title: String,
        url: String,
        duration: Number
    }],
    is_public: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now }
});
PlaylistSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

const LiveClassSchema = new Schema({
    course_id: { type: Schema.Types.ObjectId, ref: 'Course' },
    title: { type: String, required: true },
    description: { type: String },
    instructor_id: { type: Schema.Types.ObjectId, ref: 'User' },
    meeting_id: { type: String }, // For SDK/Zoom
    meeting_url: { type: String }, // Join URL
    start_url: { type: String }, // Start URL (for instructor)
    meeting_password: { type: String },
    scheduled_at: { type: Date, required: true },
    duration_minutes: { type: Number, default: 60 },
    poster_url: { type: String },
    status: { type: String, default: 'scheduled' }, // scheduled, live, ended
    created_at: { type: Date, default: Date.now }
});
LiveClassSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

module.exports = {
    Assignment: mongoose.model('Assignment', AssignmentSchema),
    Submission: mongoose.model('Submission', SubmissionSchema),
    Playlist: mongoose.model('Playlist', PlaylistSchema),
    LiveClass: mongoose.model('LiveClass', LiveClassSchema)
};
