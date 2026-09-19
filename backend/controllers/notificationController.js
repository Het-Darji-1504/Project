const supabase = require('../config/supabase');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

let localNotifications = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed/data.json'), 'utf-8')).notifications;

function normalizeNotification(n) {
  return {
    ...n,
    actionText: n.action_text || n.actionText,
    actionTarget: n.action_target || n.actionTarget
  };
}

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    let notifs = [];

    if (supabase) {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        notifs = data.map(normalizeNotification);
      }
    }

    if (notifs.length === 0) {
      try {
        notifs = await Notification.find({});
      } catch (err) {
        notifs = localNotifications;
      }
    }

    if (!notifs || notifs.length === 0) {
      notifs = localNotifications;
    }
    const unreadCount = notifs.filter(n => !n.read).length;
    return res.json({ success: true, count: notifs.length, unreadCount, data: notifs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (supabase) {
      try {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
      } catch (sbErr) {
        console.warn('[Supabase Notification Update Error]:', sbErr.message);
      }
    }

    try {
      await Notification.updateOne({ id }, { read: true });
    } catch (err) {
      const target = localNotifications.find(n => n.id === id);
      if (target) target.read = true;
    }
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/notifications/mark-all-read
exports.markAllRead = async (req, res) => {
  try {
    if (supabase) {
      try {
        await supabase.from('notifications').update({ read: true }).neq('id', '');
      } catch (sbErr) {
        console.warn('[Supabase Mark All Read Error]:', sbErr.message);
      }
    }

    try {
      await Notification.updateMany({}, { read: true });
    } catch (err) {
      localNotifications.forEach(n => n.read = true);
    }
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
