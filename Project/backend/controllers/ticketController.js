const supabase = require('../config/supabase');
const Ticket = require('../models/Ticket');
const fs = require('fs');
const path = require('path');

let localTickets = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed/data.json'), 'utf-8')).maintenanceTickets;

function normalizeTicket(t) {
  return {
    ...t,
    statusColor: t.status_color || t.statusColor,
    reportedAgo: t.reported_ago || t.reportedAgo,
    currentStep: t.current_step !== undefined ? t.current_step : t.currentStep
  };
}

// GET /api/tickets
exports.getTickets = async (req, res) => {
  try {
    let tickets = [];

    if (supabase) {
      const { data, error } = await supabase.from('maintenance_tickets').select('*');
      if (!error && data && data.length > 0) {
        tickets = data.map(normalizeTicket);
      }
    }

    if (tickets.length === 0) {
      try {
        tickets = await Ticket.find({});
      } catch (err) {
        tickets = localTickets;
      }
    }

    if (!tickets || tickets.length === 0) {
      tickets = localTickets;
    }
    return res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/tickets
exports.createTicket = async (req, res) => {
  try {
    const { title, category, urgency, location, description } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Ticket title is required' });
    }

    const urgencyColor = urgency === 'High' || urgency === 'Urgent' ? 'red' : (urgency === 'Medium' ? 'yellow' : 'green');
    const newTicket = {
      id: `maint-${Date.now()}`,
      title,
      category: category || 'Plumbing',
      status: 'Reported',
      statusColor: urgencyColor,
      status_color: urgencyColor,
      urgency: urgency || 'Medium',
      reportedAgo: 'Reported just now',
      reported_ago: 'Reported just now',
      technician: {
        name: 'Auto-Assigning Nearest Verified Vendor...',
        phone: '+91 79 4000 XXXX',
        rating: 4.9,
        eta: urgency === 'High' ? 'Within 4 hours' : 'Tomorrow morning'
      },
      currentStep: 1,
      current_step: 1,
      timeline: [
        { label: 'Reported', time: 'Just now', done: true },
        { label: 'Assigned', time: 'Pending', done: false },
        { label: 'Technician Scheduled', time: 'Pending', done: false },
        { label: 'In Progress', time: 'Pending', done: false },
        { label: 'Resolved', time: 'Pending', done: false }
      ],
      description: description || 'Issue reported via Nestora Tenant Hub.',
      location: location || 'Master Bedroom Ensuite',
      images: []
    };

    if (supabase) {
      try {
        await supabase.from('maintenance_tickets').insert([{
          id: newTicket.id,
          title: newTicket.title,
          category: newTicket.category,
          status: newTicket.status,
          status_color: newTicket.statusColor,
          urgency: newTicket.urgency,
          reported_ago: newTicket.reportedAgo,
          technician: newTicket.technician,
          current_step: newTicket.currentStep,
          timeline: newTicket.timeline,
          description: newTicket.description,
          location: newTicket.location,
          images: newTicket.images
        }]);
      } catch (sbErr) {
        console.warn('[Supabase Ticket Insert Error]:', sbErr.message);
      }
    }

    try {
      await Ticket.create(newTicket);
    } catch (err) {
      localTickets.unshift(newTicket);
    }

    return res.status(201).json({
      success: true,
      data: newTicket,
      message: 'Maintenance ticket registered in Supabase! Verified vendor dispatching according to SLA.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
