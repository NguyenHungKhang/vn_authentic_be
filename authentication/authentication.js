const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  address: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Hàm hash password giống frontend
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}

// POST /api/register
router.post('/register', async (req, res) => {
  const { name, email, address, password } = req.body;

  if (!name || !email || !address || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin' });
  }

  try {
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: 'Email này đã được đăng ký.' });
    }

    const newUser = new User({
      name,
      email,
      address,
      password: hashPassword(password),
    });

    await newUser.save();
    res.json({ message: 'Đăng ký thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin' });

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    res.json({
      message: 'Đăng nhập thành công',
      user: { name: user.name, email: user.email, address: user.address },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/reset-password
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Vui lòng nhập email' });

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại.' });
    }

    // Mô phỏng gửi mail reset mật khẩu
    res.json({ message: 'Yêu cầu đặt lại mật khẩu đã được gửi! (Mô phỏng)' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
