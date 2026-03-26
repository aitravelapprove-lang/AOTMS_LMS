const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExamSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    exam_type: { type: String, default: 'mock' },
    course_id: { type: Schema.Types.ObjectId, ref: 'Course' }, 
    duration_minutes: { type: Number, required: true },
    total_marks: { type: Number, required: true },
    passing_marks: { type: Number, required: true },
    negative_marking: { type: Number, default: 0 },
    max_attempts: { type: Number, default: 1 },
    scheduled_date: { type: Date, index: true },
    shuffle_questions: { type: Boolean, default: true },
    show_results: { type: Boolean, default: true },
    proctoring_enabled: { type: Boolean, default: false },
    browser_security: { type: Boolean, default: false },
    assigned_image: { type: String },
    status: { type: String, default: 'scheduled' }, // scheduled, active, completed, cancelled
    approval_status: { type: String, default: 'pending' }, // pending, approved, rejected
    total_questions: { type: Number, default: 0 },
    topics: [String],
    ai_generated: { type: Boolean, default: false },
    source_topic: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now, index: true },
    updated_at: { type: Date }
});


ExamSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

const QuestionBankSchema = new Schema({
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    question_text: { type: String, required: true },
    options: [{ text: String, is_correct: Boolean }], // Array of options
    correct_answer: { type: String }, // Stored answer for T/F, Short, etc.
    type: { 
        type: String, 
        enum: ['multiple_choice', 'true_false', 'subjective', 'short_answer', 'long_answer', 'fill_blank', 'coding'], 
        default: 'multiple_choice' 
    },
    marks: { type: Number, default: 1 },
    course_id: { type: Schema.Types.ObjectId, ref: 'Course' }, // Optional course link
    approval_status: { type: String, default: 'pending' }, // pending, approved, rejected
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now, index: true },
    updated_at: { type: Date }
});
QuestionBankSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

const ExamScheduleSchema = new Schema({
    exam_id: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    status: { type: String, default: 'scheduled' }, // scheduled, ongoing, completed
    created_at: { type: Date, default: Date.now, index: true },
});
ExamScheduleSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

const StudentExamAccessSchema = new Schema({
    student_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    exam_id: { type: Schema.Types.ObjectId, ref: 'Exam' }, // Nullable if mock
    mock_paper_id: { type: Schema.Types.ObjectId, ref: 'MockPaper' }, // Nullable if exam
    question_bank_topic: { type: String }, // Optional access to QB
    access_type: { type: String, default: 'exam' }, // exam, mock, question_bank
    assigned_by: { type: Schema.Types.ObjectId, ref: 'User' }, // Instructor/Manager
    granted_at: { type: Date, default: Date.now, index: true }
});
StudentExamAccessSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

const ExamResultSchema = new Schema({
    student_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    exam_id: { type: Schema.Types.ObjectId, ref: 'Exam' },
    mock_paper_id: { type: Schema.Types.ObjectId, ref: 'MockPaper' },
    score: { type: Number, required: true },
    total_questions: { type: Number },
    percentage: { type: Number },
    answers: { type: Map, of: String }, // Map of questionId -> selectedOptionId
    time_spent: { type: Number }, // seconds
    submitted_at: { type: Date, default: Date.now, index: true }
});
ExamResultSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

const MockPaperSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    questions: [{ type: Schema.Types.ObjectId, ref: 'QuestionBank' }], // References to questions
    created_at: { type: Date, default: Date.now, index: true }
});
MockPaperSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

const ExamRuleSchema = new Schema({
    exam_id: { type: Schema.Types.ObjectId, ref: 'Exam' },
    exam_schedule_id: { type: Schema.Types.ObjectId, ref: 'ExamSchedule' },
    duration_minutes: { type: Number, default: 60 },
    max_attempts: { type: Number, default: 1 },
    negative_marking_value: { type: Number, default: 0 },
    passing_percentage: { type: Number, default: 40 },
    shuffle_questions: { type: Boolean, default: false },
    shuffle_options: { type: Boolean, default: false },
    show_results_immediately: { type: Boolean, default: true },
    allow_review: { type: Boolean, default: true },
    proctoring_enabled: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now, index: true },
    updated_at: { type: Date }
});
ExamRuleSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

const MockTestConfigSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    course_id: { type: Schema.Types.ObjectId, ref: 'Course' },
    topics: [String],
    question_count: { type: Number, default: 0 },
    duration_minutes: { type: Number, default: 60 },
    difficulty_mix: { type: Map, of: Number }, // easy: 30, medium: 40, hard: 30
    is_active: { type: Boolean, default: true },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now, index: true }
});
MockTestConfigSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

module.exports = {
    Exam: mongoose.model('Exam', ExamSchema),
    QuestionBank: mongoose.model('QuestionBank', QuestionBankSchema),
    ExamSchedule: mongoose.model('ExamSchedule', ExamScheduleSchema),
    StudentExamAccess: mongoose.model('StudentExamAccess', StudentExamAccessSchema),
    ExamResult: mongoose.model('ExamResult', ExamResultSchema),
    MockPaper: mongoose.model('MockPaper', MockPaperSchema),
    ExamRule: mongoose.model('ExamRule', ExamRuleSchema),
    MockTestConfig: mongoose.model('MockTestConfig', MockTestConfigSchema)
};
