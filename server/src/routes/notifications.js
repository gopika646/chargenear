const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    return res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return res.json({ success: true, notification: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to mark notifications as read.' });
  }
});

module.exports = router;

