import jwt from 'jsonwebtoken';
import User from '../models/User.js';


export async function requireAuth(req, res, next){
try {
const header = req.headers.authorization || '';
const token = header.startsWith('Bearer ') ? header.slice(7) : null;
if(!token) return res.status(401).json({ message: 'No token' });
const payload = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(payload.id);
if(!user) return res.status(401).json({ message: 'Invalid token' });
req.user = user;
next();
} catch (e) {
return res.status(401).json({ message: 'Unauthorized' });
}
}