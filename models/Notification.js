import mongoose from 'mongoose';


const notificationSchema = new mongoose.Schema({
to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
type: { type: String, enum: ['like','comment','follow','message'], required: true },
post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
read: { type: Boolean, default: false }
}, { timestamps: true });


export default mongoose.model('Notification', notificationSchema);