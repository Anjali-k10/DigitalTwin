import User from '../models/User.js';

export const getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json(buildSettingsResponse(user));
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { theme, notifications, twinAssistantEnabled, twinAssistantPreferences, notificationPreferences } = req.body;

    if (theme !== undefined) {
      user.preferences.theme = String(theme);
    }

    if (notifications !== undefined) {
      user.preferences.notifications = Boolean(notifications);
    }

    if (twinAssistantEnabled !== undefined) {
      user.preferences.twinAssistantEnabled = Boolean(twinAssistantEnabled);
    }

    if (twinAssistantPreferences && typeof twinAssistantPreferences === 'object') {
      user.preferences.twinAssistantPreferences = {
        ...(user.preferences.twinAssistantPreferences?.toObject?.() || user.preferences.twinAssistantPreferences || {}),
        ...Object.fromEntries(
          Object.entries(twinAssistantPreferences).map(([key, value]) => [key, Boolean(value)]),
        ),
      };
    }

    if (notificationPreferences && typeof notificationPreferences === 'object') {
      user.preferences.notificationPreferences = {
        ...(user.preferences.notificationPreferences?.toObject?.() || user.preferences.notificationPreferences || {}),
        ...Object.fromEntries(
          Object.entries(notificationPreferences).map(([key, value]) => [key, Boolean(value)]),
        ),
      };
    }

    await user.save();

    return res.status(200).json(buildSettingsResponse(user));
  } catch (error) {
    next(error);
  }
};

function buildSettingsResponse(user) {
  return {
    theme: user.preferences?.theme || 'dark',
    notifications: user.preferences?.notifications ?? true,
    twinAssistantEnabled: user.preferences?.twinAssistantEnabled ?? false,
    twinAssistantPreferences: {
      backgroundListening: user.preferences?.twinAssistantPreferences?.backgroundListening ?? true,
      wakeWordDetection: user.preferences?.twinAssistantPreferences?.wakeWordDetection ?? false,
      voiceResponses: user.preferences?.twinAssistantPreferences?.voiceResponses ?? false,
    },
    notificationPreferences: {
      goalNotifications: user.preferences?.notificationPreferences?.goalNotifications ?? true,
      healthAlerts: user.preferences?.notificationPreferences?.healthAlerts ?? true,
      financeAlerts: user.preferences?.notificationPreferences?.financeAlerts ?? true,
      careerAlerts: user.preferences?.notificationPreferences?.careerAlerts ?? true,
      dailyUpdateReminders: user.preferences?.notificationPreferences?.dailyUpdateReminders ?? true,
      aiMotivationalMessages: user.preferences?.notificationPreferences?.aiMotivationalMessages ?? true,
      emailNotifications: user.preferences?.notificationPreferences?.emailNotifications ?? true,
      highPriorityOnly: user.preferences?.notificationPreferences?.highPriorityOnly ?? false,
    },
  };
}
