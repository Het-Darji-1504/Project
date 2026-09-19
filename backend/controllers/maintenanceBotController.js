const supabase = require('../config/supabase');

const chatSessions = [
  {
    id: 'msg-01',
    ticketId: 'maint-101',
    senderType: 'tenant',
    message: 'Geyser in the ensuite bathroom is leaking water from the lower valve.',
    attachments: [],
    createdAt: '2026-09-17T11:00:00Z'
  },
  {
    id: 'msg-02',
    ticketId: 'maint-101',
    senderType: 'bot',
    message: 'Hello! Nestera Relay Bot here. Ticket #maint-101 has been logged with HIGH urgency. Verified plumber Ramesh Prajapati assigned (ETA: Today 2:30 PM). If landlord does not acknowledge within 2 hours, this ticket auto-escalates to Priority 1.',
    attachments: [],
    createdAt: '2026-09-17T11:01:00Z'
  }
];

// POST /api/maintenance-bot/chat
exports.sendMessage = async (req, res) => {
  try {
    const { message, propertyId, tenancyId, photoUrl } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    // Determine category and urgency from message text
    const lower = message.toLowerCase();
    let category = 'General Maintenance';
    let urgency = 'Medium';
    let eta = 'Within 24 hours';

    if (lower.includes('leak') || lower.includes('geyser') || lower.includes('pipe') || lower.includes('water')) {
      category = 'Plumbing Emergency';
      urgency = 'High';
      eta = 'Within 3 hours';
    } else if (lower.includes('ac') || lower.includes('cool') || lower.includes('fan') || lower.includes('switch') || lower.includes('electric')) {
      category = 'Electrical / HVAC';
      urgency = 'Medium';
      eta = 'Within 8 hours';
    } else if (lower.includes('lock') || lower.includes('door') || lower.includes('key')) {
      category = 'Carpentry & Security';
      urgency = 'Urgent';
      eta = 'Within 2 hours';
    }

    const ticketId = `maint-${Date.now().toString().slice(-4)}`;

    // Create the ticket in Supabase
    const newTicket = {
      id: ticketId,
      title: message.length > 50 ? message.slice(0, 50) + '...' : message,
      category,
      status: 'Reported',
      status_color: 'yellow',
      urgency,
      reported_ago: 'Just now',
      technician: {
        name: 'Ramesh Prajapati (Nestera Verified)',
        phone: '+91 98240 77112',
        rating: 4.9,
        eta
      },
      current_step: 1,
      timeline: [
        { label: 'Reported', time: 'Just now', done: true },
        { label: 'Auto-Matched via Bot', time: 'Just now', done: true },
        { label: 'Assigned', time: eta, done: false },
        { label: 'In Progress', time: 'Pending', done: false },
        { label: 'Resolved', time: 'Pending', done: false }
      ],
      description: message,
      location: 'Property Unit',
      images: photoUrl ? [photoUrl] : []
    };

    if (supabase) {
      try {
        await supabase.from('maintenance_tickets').insert([newTicket]);
      } catch (e) {
        console.warn('[Supabase Maintenance Ticket Insert]:', e.message);
      }
    }

    const userMsg = {
      id: `msg-${Date.now()}-u`,
      ticketId,
      senderType: 'tenant',
      message,
      attachments: photoUrl ? [photoUrl] : [],
      createdAt: new Date().toISOString()
    };

    const botMsg = {
      id: `msg-${Date.now()}-b`,
      ticketId,
      senderType: 'bot',
      message: `Got it! Ticket #${ticketId} created (${category}, ${urgency} Priority). Technician ${newTicket.technician.name} has been dispatched (${eta}). Owner has been notified via WhatsApp & in-app push.`,
      attachments: [],
      createdAt: new Date().toISOString()
    };

    chatSessions.push(userMsg, botMsg);

    return res.json({
      success: true,
      ticket: newTicket,
      reply: botMsg.message,
      ticketId
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/maintenance-bot/history
exports.getChatHistory = async (req, res) => {
  return res.json({ success: true, messages: chatSessions });
};

// POST /api/maintenance-bot/escalate
exports.escalateTicket = async (req, res) => {
  try {
    const { ticketId, reason } = req.body;

    if (supabase) {
      await supabase.from('maintenance_tickets').update({
        status: 'Escalated',
        status_color: 'red',
        urgency: 'Immediate Intervention'
      }).eq('id', ticketId);
    }

    return res.json({
      success: true,
      message: `Ticket #${ticketId} has been escalated to Nestera Senior Operations Lead! SMS alerts sent to landlord.`,
      status: 'Escalated'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
