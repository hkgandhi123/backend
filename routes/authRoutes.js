import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const router = Router();


router.post('/register', async (req, res) => {
try {
const { username, email, password, name } = req.body;
if(!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
const exist = await User.findOne({ $or: [{username},{email}] });
if(exist) return res.status(409).json({ message: 'User already exists' });
const hash = await bcrypt.hash(password, 10);
const user = await User.create({ username, email, password: hash, name });
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
res.json({ token, user: { id: user._id, username: user.username, name: user.name, avatarUrl: user.avatarUrl } });
} catch (e) { res.status(500).json({ message: 'Register failed' }); }
});


router.post('/login', async (req, res) => {
try {
const { usernameOrEmail, password } = req.body;
const user = await User.findOne({ $or: [{ username: usernameOrEmail?.toLowerCase() }, { email: usernameOrEmail }] });
if(!user) return res.status(404).json({ message: 'User not found' });
const ok = await bcrypt.compare(password, user.password);
if(!ok) return res.status(401).json({ message: 'Invalid credentials' });
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
res.json({ token, user: { id: user._id, username: user.username, name: user.name, avatarUrl: user.avatarUrl } });
} catch (e) { res.status(500).json({ message: 'Login failed' }); }
});


router.get('/me', async (req, res) => {
// optional: implement with requireAuth if needed
});


export default router;