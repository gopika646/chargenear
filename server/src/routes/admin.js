const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Guard all admin routes
router.use(authenticate, authorizeRoles('ADMIN'));

// GET /api/admin/metrics - Global platform KPI overview
router.get('/metrics', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalHosts = await prisma.user.count({ where: { role: 'HOST' } });
    const totalRiders = await prisma.user.count({ where: { role: 'RIDER' } });

    const totalChargers = await prisma.chargingLocation.count();
    const approvedChargers = await prisma.chargingLocation.count({ where: { verificationStatus: 'APPROVED' } });
    const pendingChargers = await prisma.chargingLocation.count({ where: { verificationStatus: 'PENDING' } });
    const rejectedChargers = await prisma.chargingLocation.count({ where: { verificationStatus: 'REJECTED' } });

    const totalBookings = await prisma.booking.count();
    const completedBookings = await prisma.booking.count({ where: { status: 'COMPLETED' } });
    const activeBookings = await prisma.booking.count({ where: { status: 'CONFIRMED' } });

    const payments = await prisma.payment.findMany({
      where: { status: 'PAID' }
    });

    const totalGmv = payments.reduce((sum, p) => sum + p.amount, 0);
    const platformCommission = Math.round(totalGmv * 0.05 * 100) / 100;

    const openComplaints = await prisma.complaint.count({ where: { status: 'OPEN' } });

    return res.json({
      success: true,
      metrics: {
        totalUsers,
        totalHosts,
        totalRiders,
        totalChargers,
        approvedChargers,
        pendingChargers,
        rejectedChargers,
        totalBookings,
        completedBookings,
        activeBookings,
        totalGmv,
        platformCommission,
        openComplaints
      }
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin metrics.' });
  }
});

// GET /api/admin/chargers/queue - Verification queue for charging points
router.get('/chargers/queue', async (req, res) => {
  try {
    const { status = 'PENDING' } = req.query;

    const whereClause = status !== 'ALL' ? { verificationStatus: status } : {};

    const queue = await prisma.chargingLocation.findMany({
      where: whereClause,
      include: {
        host: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } }
          }
        },
        equipments: true,
        slots: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = queue.map(loc => {
      let images = [];
      try {
        images = JSON.parse(loc.images);
      } catch (e) {
        images = [loc.images];
      }

      return {
        ...loc,
        images
      };
    });

    return res.json({
      success: true,
      count: formatted.length,
      queue: formatted
    });
  } catch (error) {
    console.error('Admin queue error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch verification queue.' });
  }
});

// PATCH /api/admin/chargers/:id/verify - Approve or reject listing
router.patch('/chargers/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verificationNotes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED.' });
    }

    const isVerified = status === 'APPROVED';

    const updated = await prisma.chargingLocation.update({
      where: { id },
      data: {
        verificationStatus: status,
        isVerified,
        verificationNotes: verificationNotes || (isVerified ? 'Electrical inspection & earth rod verified by Admin.' : 'Declined: Does not meet safety criteria.')
      },
      include: { host: true }
    });

    // Notify host of the decision
    await prisma.notification.create({
      data: {
        userId: updated.host.userId,
        title: isVerified ? 'Listing Approved & Live!' : 'Listing Verification Update',
        message: isVerified
          ? `Congratulations! Your charging point "${updated.title}" has been verified and is now live on the ChargeNear map.`
          : `Your listing "${updated.title}" requires safety revisions: ${verificationNotes || 'Review electrical standards.'}`,
        type: isVerified ? 'VERIFICATION_APPROVED' : 'SYSTEM',
        link: '/host/listings'
      }
    });

    return res.json({
      success: true,
      message: `Charging point has been marked as ${status}.`,
      charger: updated
    });
  } catch (error) {
    console.error('Verify charger error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update verification status.' });
  }
});

// GET /api/admin/users - User management
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const whereClause = role && role !== 'ALL' ? { role } : {};

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        vehicleModel: true,
        vehicleNumber: true,
        createdAt: true,
        hostProfile: {
          select: {
            id: true,
            businessName: true,
            isVerified: true,
            rating: true,
            _count: { select: { locations: true } }
          }
        },
        _count: { select: { bookings: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// GET /api/admin/bookings - Platform-wide bookings monitor
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        rider: { select: { name: true, email: true, phone: true } },
        location: { select: { title: true, address: true, city: true } },
        payment: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Admin bookings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch platform bookings.' });
  }
});

// GET /api/admin/complaints - Support & complaints management
router.get('/complaints', async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
        booking: { select: { bookingNumber: true, totalAmount: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('Admin complaints error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch complaints.' });
  }
});

// PATCH /api/admin/complaints/:id - Resolve or update complaint
router.patch('/complaints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, resolution } = req.body;

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminNotes && { adminNotes }),
        ...(resolution && { resolution })
      }
    });

    return res.json({
      success: true,
      message: 'Complaint updated successfully.',
      complaint: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update complaint.' });
  }
});

module.exports = router;

