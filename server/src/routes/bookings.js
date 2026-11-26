const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Helper to convert HH:MM string to total minutes from midnight
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// POST /api/bookings/estimate - Calculate transparent estimated cost
router.post('/estimate', async (req, res) => {
  try {
    const { locationId, durationHours = 2, batteryCapacityKwh, currentChargePercent = 20, targetChargePercent = 80 } = req.body;

    const location = await prisma.chargingLocation.findUnique({
      where: { id: locationId },
      include: { slots: true, equipments: true }
    });

    if (!location) {
      return res.status(404).json({ success: false, message: 'Charging location not found.' });
    }

    const ratePerHour = location.slots.length > 0 ? location.slots[0].pricePerHour : 35.0;
    const hours = parseFloat(durationHours) || 2;
    const subtotal = Math.round(ratePerHour * hours * 100) / 100;
    const platformFee = Math.round(subtotal * 0.05 * 100) / 100; // 5% platform fee
    const gstOnPlatformFee = Math.round(platformFee * 0.18 * 100) / 100; // 18% GST on platform fee
    const totalAmount = Math.round((subtotal + platformFee + gstOnPlatformFee) * 100) / 100;

    // Optional estimation if battery capacity is provided
    let energyEstimate = null;
    if (batteryCapacityKwh) {
      const battery = parseFloat(batteryCapacityKwh);
      const neededPercent = Math.max(0, targetChargePercent - currentChargePercent);
      const neededKwh = (battery * neededPercent) / 100;
      const primaryPowerKw = location.equipments[0]?.powerKw || 3.3;
      const estimatedChargingHours = Math.round((neededKwh / primaryPowerKw) * 10) / 10;

      energyEstimate = {
        neededKwh: Math.round(neededKwh * 10) / 10,
        estimatedHoursForTarget: estimatedChargingHours,
        disclaimer: 'Charging time is an estimate based on host power rating. Actual vehicle onboard charger limits and battery temperature apply.'
      };
    }

    return res.json({
      success: true,
      breakdown: {
        ratePerHour,
        durationHours: hours,
        subtotal,
        platformFee,
        gstOnPlatformFee,
        totalAmount,
        currency: 'INR'
      },
      energyEstimate
    });
  } catch (error) {
    console.error('Cost estimate error:', error);
    return res.status(500).json({ success: false, message: 'Failed to estimate charging cost.' });
  }
});

// POST /api/bookings/check-availability - Check slot conflict
router.post('/check-availability', async (req, res) => {
  try {
    const { locationId, equipmentId, bookingDate, startTime, endTime } = req.body;

    if (!locationId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Missing parameters for availability check.' });
    }

    const reqStartMin = timeToMinutes(startTime);
    const reqEndMin = timeToMinutes(endTime);

    if (reqEndMin <= reqStartMin) {
      return res.status(400).json({ success: false, message: 'End time must be after start time.' });
    }

    // Find overlapping existing active bookings for this location/equipment
    const existingBookings = await prisma.booking.findMany({
      where: {
        locationId,
        ...(equipmentId ? { equipmentId } : {}),
        bookingDate,
        status: { in: ['CONFIRMED', 'PENDING'] }
      }
    });

    const hasConflict = existingBookings.some(b => {
      const bStartMin = timeToMinutes(b.startTime);
      const bEndMin = timeToMinutes(b.endTime);
      // Overlap condition: reqStart < bEnd AND reqEnd > bStart
      return reqStartMin < bEndMin && reqEndMin > bStartMin;
    });

    return res.json({
      success: true,
      isAvailable: !hasConflict,
      conflictsCount: hasConflict ? 1 : 0
    });
  } catch (error) {
    console.error('Availability check error:', error);
    return res.status(500).json({ success: false, message: 'Failed to check slot availability.' });
  }
});

// POST /api/bookings - Create new booking
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      locationId,
      equipmentId,
      bookingDate,
      startTime,
      endTime,
      durationHours = 2,
      vehicleModel,
      notes
    } = req.body;

    if (!locationId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'All booking fields are required.' });
    }

    const location = await prisma.chargingLocation.findUnique({
      where: { id: locationId },
      include: {
        host: {
          include: { user: true }
        },
        slots: true,
        equipments: true
      }
    });

    if (!location) {
      return res.status(404).json({ success: false, message: 'Charging location not found.' });
    }

    // Backend conflict prevention check
    const reqStartMin = timeToMinutes(startTime);
    const reqEndMin = timeToMinutes(endTime);

    const conflictingBookings = await prisma.booking.findMany({
      where: {
        locationId,
        ...(equipmentId ? { equipmentId } : {}),
        bookingDate,
        status: { in: ['CONFIRMED', 'PENDING'] }
      }
    });

    const hasConflict = conflictingBookings.some(b => {
      const bStartMin = timeToMinutes(b.startTime);
      const bEndMin = timeToMinutes(b.endTime);
      return reqStartMin < bEndMin && reqEndMin > bStartMin;
    });

    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different time or date.'
      });
    }

    const ratePerHour = location.slots.length > 0 ? location.slots[0].pricePerHour : 35.0;
    const hours = parseFloat(durationHours) || 2;
    const subtotal = Math.round(ratePerHour * hours * 100) / 100;
    const platformFee = Math.round(subtotal * 0.05 * 100) / 100;
    const totalAmount = subtotal + platformFee;
    const hostEarnings = subtotal;

    const bookingNumber = `CN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const selectedEquipment = equipmentId || location.equipments[0]?.id || null;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        riderId: req.user.id,
        locationId,
        equipmentId: selectedEquipment,
        bookingDate,
        startTime,
        endTime,
        durationHours: hours,
        ratePerHour,
        subtotal,
        platformFee,
        totalAmount,
        hostEarnings,
        status: 'PENDING', // Will transition to CONFIRMED on payment
        vehicleModel: vehicleModel || req.user.vehicleModel || 'Electric Two-Wheeler',
        notes: notes || null
      },
      include: {
        location: true,
        equipment: true
      }
    });

    // Notify Host
    await prisma.notification.create({
      data: {
        userId: location.host.userId,
        title: 'New Booking Request',
        message: `${req.user.name} booked a ${hours}h slot on ${bookingDate} (${startTime} - ${endTime}).`,
        type: 'BOOKING_CREATED',
        link: '/host/dashboard'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Booking slot reserved! Please complete payment.',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create booking.' });
  }
});

// POST /api/bookings/:id/pay - Process test or simulated payment
router.post('/:id/pay', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'RAZORPAY_TEST', paymentId, orderId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        location: {
          include: { host: true }
        },
        rider: true,
        payment: true
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.payment && booking.payment.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Booking has already been paid.' });
    }

    const transactionId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const mockOrderId = orderId || `order_sim_${Math.random().toString(36).substring(2, 9)}`;
    const mockPayId = paymentId || `pay_sim_${Math.random().toString(36).substring(2, 9)}`;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        transactionId,
        razorpayOrderId: mockOrderId,
        razorpayPaymentId: mockPayId,
        amount: booking.totalAmount,
        currency: 'INR',
        status: 'PAID',
        paymentMethod,
        isSimulated: true
      }
    });

    // Update booking status to CONFIRMED
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED'
      },
      include: {
        location: true,
        equipment: true,
        payment: true
      }
    });

    // Notify Rider
    await prisma.notification.create({
      data: {
        userId: booking.riderId,
        title: 'Payment Successful & Booking Confirmed',
        message: `Your booking #${booking.bookingNumber} at ${booking.location.title} is confirmed for ${booking.bookingDate} at ${booking.startTime}.`,
        type: 'BOOKING_CONFIRMED',
        link: '/rider/bookings'
      }
    });

    // Notify Host
    await prisma.notification.create({
      data: {
        userId: booking.location.host.userId,
        title: 'Payment Received for Booking',
        message: `Rider ${booking.rider.name} completed payment of ₹${booking.totalAmount}. Booking #${booking.bookingNumber} is confirmed!`,
        type: 'PAYMENT_RECEIVED',
        link: '/host/dashboard'
      }
    });

    return res.json({
      success: true,
      message: 'Payment verified and booking confirmed successfully!',
      booking: updatedBooking,
      payment,
      note: 'Simulated payment completed under Razorpay Test Mode.'
    });
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ success: false, message: 'Payment processing failed.' });
  }
});

// GET /api/bookings/my-bookings - Rider's booking history
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = {
      riderId: req.user.id
    };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        location: {
          include: {
            host: {
              include: {
                user: { select: { name: true, phone: true, avatar: true } }
              }
            }
          }
        },
        equipment: true,
        payment: true,
        review: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse images for location
    const formatted = bookings.map(b => {
      let images = [];
      try {
        images = JSON.parse(b.location.images);
      } catch (e) {
        images = [b.location.images];
      }

      return {
        ...b,
        location: {
          ...b.location,
          images
        }
      };
    });

    return res.json({
      success: true,
      count: formatted.length,
      bookings: formatted
    });
  } catch (error) {
    console.error('Fetch rider bookings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
});

// GET /api/bookings/host-bookings - Bookings for a host's locations
router.get('/host-bookings', authenticate, authorizeRoles('HOST', 'ADMIN'), async (req, res) => {
  try {
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!hostProfile && req.user.role !== 'ADMIN') {
      return res.status(404).json({ success: false, message: 'Host profile not found.' });
    }

    const whereClause = req.user.role === 'ADMIN' && req.query.hostId
      ? { location: { hostId: req.query.hostId } }
      : { location: { hostId: hostProfile.id } };

    if (req.query.status && req.query.status !== 'ALL') {
      whereClause.status = req.query.status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            vehicleModel: true,
            vehicleNumber: true
          }
        },
        location: true,
        equipment: true,
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Fetch host bookings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch host bookings.' });
  }
});

// PATCH /api/bookings/:id/status - Update booking status (Accept / Reject / Complete / Cancel)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status.' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        location: {
          include: { host: true }
        },
        rider: true
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Role check: Rider can cancel their own pending/confirmed booking. Host can accept, reject, complete. Admin can do any.
    const isOwnerHost = booking.location.host.userId === req.user.id;
    const isOwnerRider = booking.riderId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwnerHost && !isOwnerRider && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this booking.' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(cancellationReason && { cancellationReason })
      },
      include: {
        location: true,
        rider: true,
        payment: true
      }
    });

    // Notify Rider if host updated status
    if (isOwnerHost || isAdmin) {
      await prisma.notification.create({
        data: {
          userId: booking.riderId,
          title: `Booking #${booking.bookingNumber} Status Updated`,
          message: `Your booking at ${booking.location.title} is now ${status}.`,
          type: status === 'CONFIRMED' ? 'BOOKING_CONFIRMED' : 'SYSTEM',
          link: '/rider/bookings'
        }
      });
    }

    return res.json({
      success: true,
      message: `Booking #${booking.bookingNumber} has been updated to ${status}.`,
      booking: updated
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
});

module.exports = router;

