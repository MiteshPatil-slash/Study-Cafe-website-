const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const dotenv    = require('dotenv');
const path      = require('path');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const multer    = require('multer');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.originalUrl}`);
  next();
});

// ─── RATE LIMITERS ─────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  message: { message: 'Too many attempts. Please wait 5 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests. Please slow down.' },
});

app.use('/api/', apiLimiter);

// ─── MODELS ────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:      { type: String, required: true },
  role:          { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  avatar:        { type: String, default: '' },
  // ✅ FIX: college stored as ObjectId ref to College model
  college:       { type: mongoose.Schema.Types.ObjectId, ref: 'College', default: null },
  subject:       { type: String, default: '' },
  loginAttempts: { type: Number, default: 0 },
  lockUntil:     { type: Date },
}, { timestamps: true });

UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

const User = mongoose.model('User', UserSchema);

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true }, short: { type: String, required: true },
  city: { type: String, required: true }, students: { type: Number, default: 0 },
  rating: { type: Number, default: 4.0 }, color: { type: String, default: '#6366f1' },
  courses: [{ type: String }], established: { type: Number },
}, { timestamps: true });

const College = mongoose.model('College', CollegeSchema);

const ResourceSchema = new mongoose.Schema({
  type:       { type: String, enum: ['note', 'paper', 'video', 'doubt'], required: true },
  title:      { type: String, required: true, trim: true },
  subject:    { type: String, required: true },
  college:    { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileUrl:    { type: String, default: '' }, ytLink: { type: String, default: '' },
  tags:       [{ type: String }], downloads: { type: Number, default: 0 },
  views:      { type: Number, default: 0 }, pages: { type: Number }, size: { type: String },
  year:       { type: Number }, exam: { type: String }, duration: { type: String },
  thumbnail:  { type: String, default: '🎬' }, date: { type: String }, time: { type: String },
  seats:      { type: Number }, registered: { type: Number, default: 0 },
  status:       { type: String, enum: ['upcoming', 'full', 'completed'], default: 'upcoming' },
  collegeName:  { type: String, default: '' },
  collegeShort: { type: String, default: '' },
}, { timestamps: true });

const Resource = mongoose.model('Resource', ResourceSchema);

// ─── MULTER ────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ─── JWT ───────────────────────────────────────────────────────
const generateAccessToken  = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || 'studycafe_secret_2024', { expiresIn: '15m' });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'studycafe_refresh_2024', { expiresIn: '7d' });

// ─── MIDDLEWARE ────────────────────────────────────────────────
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'studycafe_secret_2024');
    // ✅ populate college so we get the full college object
    req.user = await User.findById(decoded.id)
      .select('-password -loginAttempts -lockUntil')
      .populate('college', '_id name short color city');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
};

const teacherOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) return next();
  res.status(403).json({ message: 'Access denied — Teacher or Admin only' });
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Access denied — Admin only' });
};

// ─── REGISTER ─────────────────────────────────────────────────
app.post('/api/auth/register', authLimiter, async (req, res) => {
  console.log('Register attempt:', req.body.email);

  const { name, email, password, role, college } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
  if (name.trim().length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters' });
  if (name.trim().length > 50) return res.status(400).json({ message: 'Name cannot exceed 50 characters' });
  if (!/^[a-zA-Z ]+$/.test(name.trim())) return res.status(400).json({ message: 'Name must contain only letters and spaces' });
  if (!email || !email.trim()) return res.status(400).json({ message: 'Email is required' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ message: 'Enter a valid email address' });
  if (!password) return res.status(400).json({ message: 'Password is required' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
  if (!/[A-Z]/.test(password)) return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
  if (!/[a-z]/.test(password)) return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
  if (!/[0-9]/.test(password)) return res.status(400).json({ message: 'Password must contain at least one number' });
  if (!/[!@#$%^&*]/.test(password)) return res.status(400).json({ message: 'Password must contain at least one special character (! @ # $ % ^ & *)' });

  try {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ message: 'This email is already registered. Please login instead.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = name.trim().split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'student',
      avatar,
      // ✅ save college ObjectId if provided
      college: college || null,
    });

    const accessToken  = generateAccessToken(newUser._id, newUser.role);
    const refreshToken = generateRefreshToken(newUser._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ populate college before responding
    await newUser.populate('college', '_id name short color city');

    console.log('User created:', newUser.email);
    res.status(201).json({
      token: accessToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        college: newUser.college,
      },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────
app.post('/api/auth/login', authLimiter, async (req, res) => {
  console.log('Login attempt:', req.body.email);

  const { email, password } = req.body;

  if (!email || !email.trim()) return res.status(400).json({ message: 'Email is required' });
  if (!password) return res.status(400).json({ message: 'Password is required' });

  try {
    // ✅ populate college on login so frontend gets the full college object
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .populate('college', '_id name short color city');

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    if (user.isLocked) return res.status(423).json({
      message: 'Account locked due to too many failed attempts. Try again after 1 hour.',
    });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const attempts = (user.loginAttempts || 0) + 1;
      const update   = { loginAttempts: attempts };
      if (attempts >= 10) {
        update.lockUntil     = new Date(Date.now() + 60 * 60 * 1000);
        update.loginAttempts = 0;
      }
      await User.findByIdAndUpdate(user._id, update);
      console.log('Failed login:', email, 'attempt', attempts);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await User.findByIdAndUpdate(user._id, { loginAttempts: 0, lockUntil: null });

    const accessToken  = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log('Login success:', email);
    res.json({
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        // ✅ send full college object so frontend can filter by college._id
        college: user.college,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// REFRESH TOKEN
app.post('/api/auth/refresh', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'studycafe_refresh_2024');
    const user    = await User.findById(decoded.id).select('-password').populate('college', '_id name short color city');
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ token: generateAccessToken(user._id, user.role) });
  } catch {
    res.clearCookie('refreshToken');
    return res.status(403).json({ message: 'Session expired. Please log in again.' });
  }
});

// LOGOUT
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' });
  res.json({ message: 'Logged out successfully' });
});

// GET ME — ✅ returns full college object
app.get('/api/auth/me', protect, (req, res) => res.json(req.user));

// ─── COLLEGES ──────────────────────────────────────────────────
app.get('/api/colleges', async (req, res) => {
  try { res.json(await College.find().sort({ rating: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
app.post('/api/colleges', protect, adminOnly, async (req, res) => {
  try { res.status(201).json(await College.create(req.body)); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
app.put('/api/colleges/:id', protect, adminOnly, async (req, res) => {
  try { res.json(await College.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
app.delete('/api/colleges/:id', protect, adminOnly, async (req, res) => {
  try { await College.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── RESOURCES ─────────────────────────────────────────────────
// ✅ KEY FIX: filter resources by user's college on the backend
app.get('/api/resources', protect, async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'student' || req.user.role === 'teacher') {
      // Students and teachers only see their own college's resources
      if (req.user.college) {
        const collegeId = req.user.college._id || req.user.college;
        filter.college = collegeId;
      }
    }
    // admin sees everything (no college filter)

    if (req.query.type)    filter.type    = req.query.type;
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.search)  filter.title   = { $regex: req.query.search, $options: 'i' };

    res.json(await Resource.find(filter)
      .populate('uploadedBy', 'name avatar')
      .populate('college', 'name short color')
      .sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/resources', protect, teacherOnly, upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Upload resource body:', req.body);

    // ✅ Force teacher's college — teachers can only upload for their own college
    const collegeId = req.user.college?._id || req.user.college || req.body.college;

    const resource = await Resource.create({
      ...req.body,
      college:      collegeId,
      uploadedBy:   req.user._id,
      fileUrl:      req.file ? `/uploads/${req.file.filename}` : '',
      collegeName:  req.body.collegeName  || '',
      collegeShort: req.body.collegeShort || '',
      tags: req.body.tags
        ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim()))
        : [],
    });
    await resource.populate('uploadedBy', 'name avatar');
    await resource.populate('college', 'name short color');
    console.log('✅ Resource created:', resource.title, '| college:', resource.collegeName);
    res.status(201).json(resource);
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/resources/:id/download', async (req, res) => {
  try { res.json(await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
app.put('/api/resources/:id/register', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Session not found' });
    if (resource.registered >= resource.seats) return res.status(400).json({ message: 'Session is full' });
    resource.registered += 1;
    if (resource.registered >= resource.seats) resource.status = 'full';
    await resource.save();
    res.json(resource);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
app.delete('/api/resources/:id', protect, async (req, res) => {
  try { await Resource.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── USERS ─────────────────────────────────────────────────────
app.get('/api/users', protect, adminOnly, async (req, res) => {
  try { res.json(await User.find().select('-password -loginAttempts -lockUntil').populate('college', 'name short').sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
app.delete('/api/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
app.put('/api/users/:id/role', protect, adminOnly, async (req, res) => {
  try { res.json(await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password')); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── CREATE TEACHER — Admin only ───────────────────────────────
app.post('/api/auth/create-teacher', protect, adminOnly, async (req, res) => {
  console.log('👨‍🏫 Create teacher attempt:', req.body.email);
  try {
    const { name, email, password, college } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    if (!/^[a-zA-Z\s]+$/.test(name.trim()))
      return res.status(400).json({ message: 'Name must contain only letters and spaces' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(400).json({ message: 'This email is already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = name.trim().split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

    const teacher = await User.create({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password: hashedPassword,
      role:     'teacher',
      avatar,
      // ✅ store college as ObjectId
      college:  college || null,
      loginAttempts: 0,
    });

    await teacher.populate('college', '_id name short');

    console.log('✅ Teacher created:', teacher.email, '| college:', teacher.college?.name);
    res.status(201).json({
      message: 'Teacher account created successfully',
      user: {
        id:      teacher._id,
        name:    teacher.name,
        email:   teacher.email,
        role:    teacher.role,
        college: teacher.college,
        avatar:  teacher.avatar,
      },
    });
  } catch (err) {
    console.error('❌ Create teacher error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// ─── HEALTH CHECK ──────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: '✅ Study Cafe API is running', version: '2.0.0' }));
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

// ─── START ─────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/studycafe')
  .then(() => {
    console.log('✅ MongoDB Connected successfully');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });