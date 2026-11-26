const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/reviews - Add review for a completed booking
router.post('/', authenticate, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Booking ID, rating (1-5), and comment are required.' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true, location: true }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.riderId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only review your own bookings.' });
    }

    if (booking.status !== 'COMPLETED' && booking.status !== 'CONFIRMED') {
      return res.status(400).json({ success: false, message: 'Reviews can only be submitted for completed or confirmed bookings.' });
    }

    if (booking.review) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking.' });
    }

    const numericRating = Math.max(1, Math.min(5, parseInt(rating)));

    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        riderId: req.user.id,
        locationId: booking.locationId,
        rating: numericRating,
        comment: comment.trim()
      },
      include: {
        rider: { select: { name: true, avatar: true } }
      }
    });

    // Recalculate average rating for the location
    const allLocationReviews = await prisma.review.findMany({
      where: { locationId: booking.locationId }
    });

    const avgRating = allLocationReviews.reduce((sum, r) => sum + r.rating, 0) / allLocationReviews.length;
    const roundedRating = Math.round(avgRating * 100) / 100;

    await prisma.chargingLocation.update({
      where: { id: booking.locationId },
      data: {
        rating: roundedRating,
        totalReviews: allLocationReviews.length
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// POST /api/reviews/:id/reply - Host replies to a review
router.post('/:id/reply', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { hostReply } = req.body;

    if (!hostReply) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty.' });
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        location: {
          include: { host: true }
        }
      }
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.location.host.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only the host can reply to this review.' });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { hostReply: hostReply.trim() }
    });

    return res.json({
      success: true,
      message: 'Reply posted successfully.',
      review: updated
    });
  } catch (error) {
    console.error('Host reply error:', error);
    return res.status(500).json({ success: false, message: 'Failed to post reply.' });
  }
});

// GET /api/reviews - Admin: List all platform reviews
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized. Admin only.' });
    }

    const reviews = await prisma.review.findMany({
      include: {
        rider: { select: { id: true, name: true, email: true, avatar: true } },
        location: { select: { id: true, title: true, address: true, city: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// DELETE /api/reviews/:id - Admin: Delete inappropriate review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized. Admin only.' });
    }

    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    await prisma.review.delete({ where: { id } });

    // Recalculate average rating for the location
    const remaining = await prisma.review.findMany({
      where: { locationId: review.locationId }
    });

    const newAvg = remaining.length > 0
      ? Math.round((remaining.reduce((sum, r) => sum + r.rating, 0) / remaining.length) * 100) / 100
      : 5.0;

    await prisma.chargingLocation.update({
      where: { id: review.locationId },
      data: {
        rating: newAvg,
        totalReviews: remaining.length
      }
    });

    return res.json({
      success: true,
      message: 'Review deleted and location rating updated successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});

module.exports = router;

