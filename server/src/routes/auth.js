const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function generateToken(userId, role) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = 'RIDER',
      vehicleModel,
      vehicleNumber,
      batteryCapacityKwh,
      businessName,
      bio,
      address,
      city = 'Chennai',
      state = 'Tamil Nadu',
      pincode = '600001',
      payoutUpiId
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = ['RIDER', 'HOST', 'ADMIN'].includes(role.toUpperCase()) ? role.toUpperCase() : 'RIDER';

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || null,
      role: assignedRole,
      vehicleModel: assignedRole === 'RIDER' ? (vehicleModel || 'Electric Two-Wheeler') : null,
      vehicleNumber: assignedRole === 'RIDER' ? (vehicleNumber || null) : null,
      batteryCapacityKwh: assignedRole === 'RIDER' && batteryCapacityKwh ? parseFloat(batteryCapacityKwh) : null,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`
    };

    if (assignedRole === 'HOST') {
      userData.hostProfile = {
        create: {
          businessName: businessName || `${name}'s EV Point`,
          bio: bio || 'Verified ChargeNear Host',
          address: address || 'Chennai Central',
          city: city || 'Chennai',
          state: state || 'Tamil Nadu',
          pincode: pincode || '600001',
          idProofType: 'Aadhaar / Address Proof (Submitted)',
          isVerified: false, // Subject to admin verification
          payoutUpiId: payoutUpiId || `${email.split('@')[0]}@upi`
        }
      };
    }

    const user = await prisma.user.create({
      data: userData,
      include: { hostProfile: true }
    });

    const token = generateToken(user.id, user.role);

    // Return sanitized user
    const { password: _, ...sanitizedUser } = user;

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to ChargeNear.',
      token,
      user: sanitizedUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { hostProfile: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id, user.role);
    const { password: _, ...sanitizedUser } = user;

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: sanitizedUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// POST /api/auth/demo-login - Quick 1-click login for demonstration
router.post('/demo-login', async (req, res) => {
  try {
    const { role = 'RIDER' } = req.body;
    let targetEmail = 'rider@chargenear.com';

    if (role.toUpperCase() === 'HOST') {
      targetEmail = 'host@chargenear.com';
    } else if (role.toUpperCase() === 'ADMIN') {
      targetEmail = 'admin@chargenear.com';
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { hostProfile: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: `Demo user for role ${role} not found. Please run seed.` });
    }

    const token = generateToken(user.id, user.role);
    const { password: _, ...sanitizedUser } = user;

    return res.json({
      success: true,
      message: `Signed in as Demo ${user.role}.`,
      token,
      user: sanitizedUser
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during demo login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const { password: _, ...sanitizedUser } = req.user;
    return res.json({
      success: true,
      user: sanitizedUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, vehicleModel, vehicleNumber, batteryCapacityKwh, businessName, bio, payoutUpiId, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone }),
        ...(vehicleModel !== undefined && { vehicleModel }),
        ...(vehicleNumber !== undefined && { vehicleNumber }),
        ...(batteryCapacityKwh !== undefined && { batteryCapacityKwh: parseFloat(batteryCapacityKwh) || null }),
        ...(avatar && { avatar }),
        ...(req.user.hostProfile && (businessName || bio || payoutUpiId) && {
          hostProfile: {
            update: {
              ...(businessName && { businessName }),
              ...(bio && { bio }),
              ...(payoutUpiId && { payoutUpiId })
            }
          }
        })
      },
      include: { hostProfile: true }
    });

    const { password: _, ...sanitizedUser } = updatedUser;

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: sanitizedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

module.exports = router;

