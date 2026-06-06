import mongoose from 'mongoose';

const ValidationLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  milestoneKey: { type: String, required: true }, // e.g. "step_master-userId-2026-06-06", "code_warrior-userId-2026-06-06", "goal_crusher-userId-goalId"
  xpAwarded: { type: Number, default: 0 },
  badgeId: { type: String, default: null }
}, { timestamps: true });

// Ensure unique index per user and milestoneKey
ValidationLogSchema.index({ userId: 1, milestoneKey: 1 }, { unique: true });

export default mongoose.model('ValidationLog', ValidationLogSchema);
