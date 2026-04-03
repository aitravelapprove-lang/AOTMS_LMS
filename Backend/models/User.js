const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    full_name: { type: String },
    avatar_url: { type: String },
    phone: { type: String },
    created_at: { type: Date, default: Date.now }
});

// Transform _id to id
UserSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id; delete ret.password_hash; }
});

const ProfileSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // Changed to ObjectId reference
    email: { type: String },
    full_name: { type: String },
    avatar_url: { type: String },
    mobile_number: { type: String },
    github_url: { type: String },
    resume_url: { type: String },
    ats_credits: { type: Number, default: 3 }, // Added for resume scans
    approval_status: { type: String, default: 'pending' }, // pending, approved, suspended
    suspended_until: { type: Date }, // For account suspension timers
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date }
});
ProfileSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret.user_id; delete ret._id; } });

const ResumeScanSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, required: true },
    analysis: { type: Object, required: true },
    resume_url: { type: String },
    file_name: { type: String },
    created_at: { type: Date, default: Date.now, index: true }
});
ResumeScanSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });


const UserRoleSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    role: { type: String, default: 'student' }, // student, instructor, manager, admin
    updated_at: { type: Date, default: Date.now }
});
UserRoleSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret.user_id; delete ret._id; } });

const OTPSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // acts as ID
    otp: { type: String, required: true },
    full_name: { type: String },
    expires_at: { type: Date, required: true },
    created_at: { type: Date, default: Date.now }
});

const VerifiedEmailSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    verified: { type: Boolean, default: false },
    verified_at: { type: Date }
});

const InstructorApplicationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    full_name: { type: String },
    email: { type: String },
    area_of_expertise: { type: String },
    custom_expertise: { type: String },
    experience: { type: String },
    resume_url: { type: String },
    status: { type: String, default: 'pending' },
    created_at: { type: Date, default: Date.now }
});
InstructorApplicationSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret.user_id; delete ret._id; } });

const GuestCredentialSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    display_name: { type: String },
    email: { type: String },
    access_level: { type: String, default: 'guest' },
    allowed_courses: [{ type: String }],
    expires_at: { type: Date, required: true },
    max_sessions: { type: Number, default: 1 },
    is_active: { type: Boolean, default: true },
    last_login_at: { type: Date },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now, index: true }
});
GuestCredentialSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

module.exports = {
    User: mongoose.model('User', UserSchema),
    Profile: mongoose.model('Profile', ProfileSchema, 'profiles'),
    UserRole: mongoose.model('UserRole', UserRoleSchema, 'user_roles'),
    OTP: mongoose.model('OTP', OTPSchema),
    VerifiedEmail: mongoose.model('VerifiedEmail', VerifiedEmailSchema),
    InstructorApplication: mongoose.model('InstructorApplication', InstructorApplicationSchema),
    GuestCredential: mongoose.model('GuestCredential', GuestCredentialSchema),
    ResumeScan: mongoose.model('ResumeScan', ResumeScanSchema)
};
