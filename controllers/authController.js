const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const { isMongoConnected, FileStorage } = require('../config/database');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Configure email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Admin login
const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const loginField = email || username;

    // Validation
    if (!loginField || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username and password'
      });
    }

    let admin;
    let isPasswordValid = false;

    if (isMongoConnected()) {
      // MongoDB implementation
      admin = await Admin.findOne({
        $or: [
          { email: loginField },
          { username: loginField }
        ]
      });
      
      if (admin) {
        isPasswordValid = await admin.comparePassword(password);
        if (isPasswordValid) {
          admin.lastLogin = new Date();
          await admin.save();
        }
      }
    } else {
      // File storage implementation
      const adminStorage = new FileStorage('admins.json');
      const admins = adminStorage.find();
      
      admin = admins.find(a => 
        a.email === loginField || 
        a.username === loginField
      );
      
      if (admin) {
        isPasswordValid = await bcrypt.compare(password, admin.password);
        if (isPasswordValid) {
          admin.lastLogin = new Date();
          adminStorage.update(admin._id, { lastLogin: admin.lastLogin });
        }
      }
    }
    
    if (!admin || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.username,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No admin found with this email address'
      });
    }

    // Generate reset token
    const resetToken = admin.generateResetToken();
    await admin.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: admin.email,
      subject: 'Password Reset Request - Golden Bean Admin',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #2C3E50;">Password Reset Request</h2>
          <p>Hello ${admin.username},</p>
          <p>You requested a password reset for your Golden Bean admin account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #D4AC0D; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">The Golden Bean Admin Panel</p>
        </div>
      `
    };

    // Send email
    const transporter = createEmailTransporter();
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending password reset email'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and new password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find admin with valid reset token
    const admin = await Admin.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    admin.password = password;
    admin.resetPasswordToken = null;
    admin.resetPasswordExpires = null;
    await admin.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
};

// Get current admin profile
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        email: req.admin.email,
        role: req.admin.role,
        lastLogin: req.admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  getProfile
};
