import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema({
conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
text: { type: String, default: '' },
seen: { type: Boolean, default: false }
}, { timestamps: true });


export default mongoose.model('Message', messageSchema);