const express = require('express');
const router = express.Router();
const User = require('../models/user');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const passwordValidator = require('password-validator');
const jwt = require('jsonwebtoken');

const passwordSchema = new passwordValidator();
passwordSchema
  .is().min(6) // Minimum length 8
  .is().max(100) // Maximum length 100
  .has().uppercase() // Must have uppercase letters
  .has().lowercase() // Must have lowercase letters
  .has().digits() // Must have digits
  .has().not().spaces(); // Should not have spaces

// Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Validate password
  const isValidPassword = passwordSchema.validate(password);
  
  if (!isValidPassword) {
    return res.status(400).json({ message: 'Password is invalid - Must have minimum length 6 and must be a combination of uppercase, lowercase, and digits' });
  }

  // Generate OTP
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });


  try {
    // Create a new user
    const user = new User({ name, email, password, otp });
    await user.save();

    // Send verification email
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
      auth: {
        user: 'verifydata7@gmail.com',
        pass: 'wrzrlfopurbjxoaa',
      },
    });

    const mailOptions = {
      from: 'verifyfdata7@gmail.com',
      to: email,
      subject: 'Email Verification',
      html: `<p>Hello ${name},</p><p>Please use the following OTP to verify your email: ${otp}</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to send verification email' });
      } else {
        console.log(`Email sent: ${info.response}`);
        res.status(200).json({ message: 'Verification email sent successfully' });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

// login check
router.post('/login', async (req, res) => {
        const { email, password } = req.body;
        
        // validate email and password
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // generate JWT
        const token = jwt.sign({ userId: user._id }, "secretKey", { expiresIn: '1h' });
        
        res.status(200).json({ token })

  });

  
  router.post('/verify', async (req, res) => {
    const { email, otp } = req.body;
  
  
    try {
      // Find user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      // Check if OTP matches
      if (otp === user.otp) {
        // Update user's email verified status
        user.isEmailVerified = true;
        await user.save();
  
        res.status(200).json({ message: 'Email verified successfully' });
      } else {
        res.status(400).json({ message: 'Invalid OTP' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Failed to verify email' });
    }
  });

module.exports = router;
