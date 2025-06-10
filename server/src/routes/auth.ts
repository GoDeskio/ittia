import express, { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { validateRequest } from '../middleware/validation';
import { body } from 'express-validator';
import passport from 'passport';
import { User } from '../models/user';
import { authConfig } from '../config/auth.config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const authService = new AuthService();

// Email & Password Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PIN Code Login
router.post(
  '/pin',
  [
    body('email').isEmail().normalizeEmail(),
    body('pinCode').isString().isLength({ min: 4, max: 4 }),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { email, pinCode } = req.body;
      const result = await authService.loginWithPinCode(email, pinCode);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: 'Invalid PIN code' });
    }
  }
);

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', { session: false }), 
  async (req, res) => {
    try {
      const result = await authService.loginWithGoogle(req.user as any);
      res.redirect(`/auth-callback?token=${result.token}`);
    } catch (error) {
      res.redirect('/auth-callback?error=google_auth_failed');
    }
  }
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email', 'public_profile']
}));

router.get('/facebook/callback', passport.authenticate('facebook', { session: false }),
  async (req, res) => {
    try {
      const result = await authService.loginWithFacebook(req.user as any);
      res.redirect(`/auth-callback?token=${result.token}`);
    } catch (error) {
      res.redirect('/auth-callback?error=facebook_auth_failed');
    }
  }
);

// LinkedIn OAuth
router.get('/linkedin', passport.authenticate('linkedin', {
  scope: ['r_emailaddress', 'r_liteprofile']
}));

router.get('/linkedin/callback', passport.authenticate('linkedin', { session: false }),
  async (req, res) => {
    try {
      const result = await authService.loginWithLinkedIn(req.user as any);
      res.redirect(`/auth-callback?token=${result.token}`);
    } catch (error) {
      res.redirect('/auth-callback?error=linkedin_auth_failed');
    }
  }
);

// Instagram OAuth
router.get('/instagram', passport.authenticate('instagram', {
  scope: ['basic']
}));

router.get('/instagram/callback', passport.authenticate('instagram', { session: false }),
  async (req, res) => {
    try {
      const result = await authService.loginWithInstagram(req.user as any);
      res.redirect(`/auth-callback?token=${result.token}`);
    } catch (error) {
      res.redirect('/auth-callback?error=instagram_auth_failed');
    }
  }
);

// Fingerprint verification
router.post(
  '/fingerprint',
  [
    body('userId').isString().notEmpty(),
    body('fingerprintHash').isString().notEmpty(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { userId, fingerprintHash } = req.body;
      const isValid = await authService.verifyFingerprint(userId, fingerprintHash);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid fingerprint' });
      }
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const token = await authService.generateToken(user);
      res.json({ token, user });
    } catch (error) {
      res.status(500).json({ message: 'Fingerprint verification failed' });
    }
  }
);

// Get current user
router.get('/me', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById((req.user as any)._id).select('-password -pinCode -fingerPrintHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

// Logout
router.post('/logout', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // In a real application, you might want to invalidate the token here
  res.json({ message: 'Logged out successfully' });
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 