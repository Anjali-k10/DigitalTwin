import Notification from '../models/Notification.js';
import { createNotification, getUnreadActiveCount } from '../services/notificationService.js';

export const getNotifications = async (req, res) => {
  const { category = 'all', status = 'active' } = req.query;
  const query = { userId: req.user.userId, archivedAt: null };

  if (category !== 'all') query.category = category;
  if (status === 'unread') query.isRead = false;
  if (status === 'active' || status === 'unread') query.isResolved = false;
  if (status === 'resolved') query.isResolved = true;

  const [notifications, unreadActiveCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).limit(100),
    getUnreadActiveCount(req.user.userId),
  ]);

  res.status(200).json({ success: true, data: notifications, unreadActiveCount });
};

export const updateNotifications = async (req, res) => {
  const { ids = [], isRead, isResolved } = req.body;
  const query = { userId: req.user.userId };

  if (Array.isArray(ids) && ids.length > 0) {
    query._id = { $in: ids };
  }

  const update = {};
  if (isRead !== undefined) update.isRead = Boolean(isRead);
  if (isResolved !== undefined) update.isResolved = Boolean(isResolved);

  await Notification.updateMany(query, { $set: update });
  const [notifications, unreadActiveCount] = await Promise.all([
    Notification.find({ userId: req.user.userId, archivedAt: null }).sort({ createdAt: -1 }).limit(100),
    getUnreadActiveCount(req.user.userId),
  ]);

  res.status(200).json({ success: true, data: notifications, unreadActiveCount });
};

export const getNotificationCount = async (req, res) => {
  const unreadActiveCount = await getUnreadActiveCount(req.user.userId);
  res.status(200).json({ success: true, unreadActiveCount });
};

export const sendTestEmailNotification = async (req, res) => {
  const notification = await createNotification({
    userId: req.user.userId,
    category: 'system',
    subType: 'test-email',
    title: 'Test Email Notification',
    message: 'This is a test alert from your Personal Digital Twin notification system.',
    priority: 'low',
    suggestion: 'If this email arrived, your mail provider is configured correctly.',
    actionLink: '/notifications',
    sendEmail: true,
  });

  res.status(201).json({
    success: true,
    message: notification?.emailStatus === 'sent'
      ? 'Test notification created and email sent.'
      : 'Test notification created, but email was not sent. Check backend logs and mail provider environment variables.',
    data: notification,
    emailSent: notification?.emailStatus === 'sent',
    emailStatus: notification?.emailStatus,
    emailProvider: notification?.emailProvider,
    emailRecipient: notification?.emailRecipient,
    emailError: notification?.emailError,
  });
};
