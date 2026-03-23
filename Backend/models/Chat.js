const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    last_message: { type: Schema.Types.ObjectId, ref: 'Message' },
    unread_counts: { type: Map, of: Number, default: {} }, // userId -> count
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const MessageSchema = new Schema({
    conversation_id: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: { type: String, default: 'text' }, // text, image, file
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    created_at: { type: Date, default: Date.now }
});

module.exports = {
    Conversation: mongoose.model('Conversation', ConversationSchema),
    Message: mongoose.model('Message', MessageSchema)
};
