import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
username: { type: String, required: true, unique: true, lowercase: true, trim: true },
email: { type: String, required: true, unique: true },
password: { type: String, required: true },
name: { type: String, default: '' },
bio: { type: String, default: '' },
avatarUrl:{ type: String, default: '' },
followers:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
following:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });


export default mongoose.model('User', userSchema);