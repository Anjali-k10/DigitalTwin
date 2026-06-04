import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      enum: ['health', 'finance', 'career', 'goal', 'daily-update', 'system'],
      default: 'system',
      index: true,
    },
    subType: { type: String, default: 'general', trim: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },
    suggestion: { type: String, default: '', trim: true },
    motivation: { type: String, default: '', trim: true },
    actionLink: { type: String, default: '', trim: true },
    type: { type: String, default: 'system', trim: true },
    isRead: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date, default: null },
    emailedAt: { type: Date, default: null },
    emailStatus: {
      type: String,
      enum: ['pending', 'sent', 'skipped', 'failed'],
      default: 'pending',
    },
    emailProvider: { type: String, default: '', trim: true },
    emailRecipient: { type: String, default: '', trim: true },
    emailError: { type: String, default: '', trim: true },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, isResolved: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
