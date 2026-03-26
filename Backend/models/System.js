const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SystemLogSchema = new Schema({
    log_type: { type: String, required: true }, // audit, error, info
    module: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: Object }, // Flexible JSON
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now }
});
SystemLogSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

const SecurityEventSchema = new Schema({
    event_type: { type: String, required: true }, // login_failed, ip_blocked
    ip_address: { type: String },
    details: { type: Object },
    created_at: { type: Date, default: Date.now }
});
SecurityEventSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

const LeaderboardStatSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    total_score: { type: Number, default: 0, index: true },
    rank: { type: Number },
    badges: [String],
    updated_at: { type: Date, default: Date.now, index: true }
});
LeaderboardStatSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { ret.id = ret._id; delete ret._id; } });

module.exports = {
    SystemLog: mongoose.model('SystemLog', SystemLogSchema),
    SecurityEvent: mongoose.model('SecurityEvent', SecurityEventSchema),
    LeaderboardStat: mongoose.model('LeaderboardStat', LeaderboardStatSchema)
};
