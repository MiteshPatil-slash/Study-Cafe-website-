// createAdmin.js
// Run this file: node createAdmin.js
// This will create admin user directly in MongoDB

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── Connect to MongoDB ──
mongoose.connect('mongodb://localhost:27017/studycafe')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => { console.error('❌ Connection failed:', err.message); process.exit(1); });

// ── User Schema ──
const UserSchema = new mongoose.Schema({
  name:          String,
  email:         { type: String, unique: true },
  password:      String,
  role:          String,
  avatar:        String,
  loginAttempts: { type: Number, default: 0 },
  lockUntil:     Date,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// ── Create Admin ──
async function createAdmin() {
  try {
    // Delete old admin if exists
    await User.deleteOne({ email: 'admin@studycafe.com' });
    console.log('🗑️  Old admin deleted (if existed)');

    // Hash password
    const password      = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔐 Password hashed successfully');
    console.log('🔑 Hash:', hashedPassword);

    // Verify hash works before saving
    const test = await bcrypt.compare(password, hashedPassword);
    console.log('✅ Hash verification test:', test ? 'PASSED' : 'FAILED');

    if (!test) {
      console.error('❌ Hash verification failed! Something is wrong with bcryptjs');
      process.exit(1);
    }

    // Create admin user
    const admin = await User.create({
      name:     'Admin',
      email:    'admin@studycafe.com',
      password: hashedPassword,
      role:     'admin',
      avatar:   'AD',
      loginAttempts: 0,
    });

    console.log('\n🎉 Admin created successfully!');
    console.log('─────────────────────────────');
    console.log('📧 Email:   ', admin.email);
    console.log('🔑 Password: Admin@123');
    console.log('👤 Role:    ', admin.role);
    console.log('─────────────────────────────');
    console.log('✅ You can now login with these credentials');

  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
  } finally {
    mongoose.disconnect();
    console.log('🔌 MongoDB Disconnected');
  }
}

createAdmin();