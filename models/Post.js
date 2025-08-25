import mongoose from 'mongoose';


const postSchema = new mongoose.Schema({
author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
caption: { type: String, default: '' },
imageUrl: { type: String, required: true },
likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
commentsCount: { type: Number, default: 0 },
}, { timestamps: true });


export default mongoose.model('Post', postSchema);