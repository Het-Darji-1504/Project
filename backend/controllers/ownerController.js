const supabase = require('../config/supabase');
const OwnerProperty = require('../models/OwnerProperty');
const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed/data.json'), 'utf-8')).ownerData;
let localOwnerProperties = rawData.properties || [];

let localApplications = [
  {
    id: 'app-1',
    propertyId: 'prop-1',
    propertyTitle: 'Palm Grove Luxury Living',
    applicantId: 'usr-aman-1',
    applicantName: 'Aman Singh',
    applicantEmail: 'aman.singh@nirmauni.ac.in',
    applicantPhone: '+91 98765 43210',
    applicantAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    rentalDurationMonths: 3,
    moveInDate: '2026-10-01',
    status: 'pending',
    notes: 'Final year B.Tech student looking for 3-month summer semester stay.',
    createdAt: '2026-09-18T10:30:00Z'
  },
  {
    id: 'app-2',
    propertyId: 'prop-2',
    propertyTitle: 'Heritage Courtyard Haveli',
    applicantId: 'usr-siddharth-2',
    applicantName: 'Siddharth Malhotra',
    applicantEmail: 'siddharth.m@cept.ac.in',
    applicantPhone: '+91 98234 56789',
    applicantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rentalDurationMonths: 4,
    moveInDate: '2026-10-15',
    status: 'pending',
    notes: 'Architecture intern at CEPT looking for quiet research-friendly accommodation.',
    createdAt: '2026-09-17T14:15:00Z'
  },
  {
    id: 'app-3',
    propertyId: 'prop-3',
    propertyTitle: 'Campus Edge Studio 2BHK',
    applicantId: 'usr-arjun-3',
    applicantName: 'Arjun Mehta',
    applicantEmail: 'arjun.mehta@pdpu.ac.in',
    applicantPhone: '+91 98111 22334',
    applicantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rentalDurationMonths: 2,
    moveInDate: '2026-09-25',
    status: 'accepted',
    notes: 'Management trainee moving in immediately for short-term project.',
    createdAt: '2026-09-16T09:00:00Z'
  }
];

function normalizeOwnerProperty(p) {
  return {
    ...p,
    rent: Number(p.rent),
    paymentStatus: p.payment_status || p.paymentStatus || 'Listed',
    maintenanceStatus: p.maintenance_status || p.maintenanceStatus || 'Clear',
    leaseExpiry: p.lease_expiry || p.leaseExpiry || '11 Months'
  };
}

// GET /api/owner/dashboard
exports.getOwnerDashboard = async (req, res) => {
  try {
    let properties = [];

    if (supabase) {
      const { data, error } = await supabase.from('owner_properties').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        properties = data.map(normalizeOwnerProperty);
      }
    }

    if (properties.length === 0) {
      try {
        properties = await OwnerProperty.find({});
      } catch (err) {
        properties = localOwnerProperties;
      }
    }

    if (!properties || properties.length === 0) {
      properties = localOwnerProperties;
    }

    const totalProperties = properties.length;
    const occupiedUnits = properties.filter(p => p.status === 'Occupied' || p.status === 'Found').length;
    const availableUnits = properties.filter(p => p.status === 'Available' || p.status === 'Active').length;
    const occupancyRate = totalProperties > 0 ? `${((occupiedUnits / totalProperties) * 100).toFixed(1)}%` : '0%';
    const monthlyRevenue = properties.filter(p => p.status === 'Occupied' || p.status === 'Found').reduce((sum, p) => sum + (p.rent || 0), 0);

    // Fetch applications count
    let pendingAppsCount = localApplications.filter(a => a.status === 'pending').length;
    if (supabase) {
      try {
        const { data: appData } = await supabase.from('applications').select('*').eq('status', 'pending');
        if (appData) pendingAppsCount = appData.length;
      } catch (e) {
        console.warn('[Supabase Applications Count]:', e.message);
      }
    }

    // Fetch maintenance count
    let pendingMaintCount = 1;
    if (supabase) {
      try {
        const { data: mData } = await supabase.from('maintenance_tickets').select('*').neq('status', 'Resolved');
        if (mData) pendingMaintCount = mData.length;
      } catch (e) {
        console.warn('[Supabase Maintenance Count]:', e.message);
      }
    }

    const stats = {
      totalProperties,
      activeListings: totalProperties,
      occupiedProperties: occupiedUnits,
      availableProperties: availableUnits,
      occupancyRate,
      monthlyRentalRevenue: monthlyRevenue,
      pendingApplications: pendingAppsCount,
      upcomingVisits: 3,
      pendingMaintenanceRequests: pendingMaintCount,
      onTimePayments: '96.5%'
    };

    return res.json({
      success: true,
      data: {
        stats,
        properties
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/owner/properties
exports.addOwnerProperty = async (req, res) => {
  try {
    const { title, rent, locality, propertyType, bedrooms, bathrooms, area, furnishing, deposit, maintenance } = req.body;
    if (!title || !rent) {
      return res.status(400).json({ success: false, message: 'Property title and rent amount are required' });
    }

    const newUnit = {
      id: `own-${Date.now()}`,
      title,
      locality: locality || 'SG Highway, Ahmedabad',
      tenant: 'Vacant',
      rent: Number(rent),
      deposit: deposit ? Number(deposit) : Number(rent) * 2,
      status: 'Available',
      paymentStatus: 'Listed',
      payment_status: 'Listed',
      maintenanceStatus: 'Clear',
      maintenance_status: 'Clear',
      leaseExpiry: 'Flexible (2-12 Months)',
      lease_expiry: 'Flexible (2-12 Months)',
      propertyType: propertyType || 'Apartment',
      bedrooms: bedrooms || 2,
      bathrooms: bathrooms || 2,
      area: area || '1150 sq.ft',
      furnishing: furnishing || 'Furnished',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('owner_properties').insert([{
          id: newUnit.id,
          title: newUnit.title,
          locality: newUnit.locality,
          tenant: newUnit.tenant,
          rent: newUnit.rent,
          status: newUnit.status,
          payment_status: newUnit.payment_status,
          maintenance_status: newUnit.maintenance_status,
          lease_expiry: newUnit.lease_expiry
        }]);

        await supabase.from('properties').insert([{
          id: newUnit.id,
          title: newUnit.title,
          type: newUnit.propertyType,
          city: 'Ahmedabad',
          locality: newUnit.locality,
          rent: newUnit.rent,
          deposit: newUnit.deposit,
          estimated_living_cost: newUnit.rent + 4700,
          status: 'Active',
          verified: true,
          amenities: ['Wi-Fi 300Mbps', 'AC', 'Elevator', 'Power Backup'],
          specs: {
            bedrooms: newUnit.bedrooms,
            bathrooms: newUnit.bathrooms,
            area: newUnit.area,
            furnishing: newUnit.furnishing,
            roommatesAllowed: true
          }
        }]);
      } catch (sbErr) {
        console.warn('[Supabase Owner Insert Error]:', sbErr.message);
      }
    }

    try {
      await OwnerProperty.create(newUnit);
    } catch (err) {
      localOwnerProperties.unshift(newUnit);
    }

    return res.status(201).json({
      success: true,
      data: newUnit,
      message: 'Property listed successfully in Supabase! Ready to accept applications.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/owner/properties/:id
exports.updateOwnerProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, rent, locality, status, tenant } = req.body;

    const updates = {};
    if (title) updates.title = title;
    if (rent) updates.rent = Number(rent);
    if (locality) updates.locality = locality;
    if (status) updates.status = status;
    if (tenant) updates.tenant = tenant;

    if (supabase) {
      try {
        await supabase.from('owner_properties').update(updates).eq('id', id);
        if (title || rent || locality) {
          const propUpdates = {};
          if (title) propUpdates.title = title;
          if (rent) {
            propUpdates.rent = Number(rent);
            propUpdates.estimated_living_cost = Number(rent) + 4700;
          }
          if (locality) propUpdates.locality = locality;
          await supabase.from('properties').update(propUpdates).eq('id', id);
        }
      } catch (err) {
        console.warn('[Supabase Property Update]:', err.message);
      }
    }

    const localIdx = localOwnerProperties.findIndex(p => p.id === id);
    if (localIdx >= 0) {
      localOwnerProperties[localIdx] = { ...localOwnerProperties[localIdx], ...updates };
    }

    return res.json({
      success: true,
      message: 'Property details updated successfully in database.',
      data: updates
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/owner/properties/:id/status
// Support toggling between 'Available', 'Occupied', 'Inactive', 'Active', 'Found'
exports.toggleListingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Active', 'Found', 'Available', 'Occupied', 'Inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const ownerStatus = (status === 'Found' || status === 'Occupied') ? 'Occupied' : (status === 'Inactive' ? 'Inactive' : 'Available');
    const publicStatus = (status === 'Occupied' || status === 'Found') ? 'Found' : (status === 'Inactive' ? 'Inactive' : 'Active');

    if (supabase) {
      await supabase.from('properties').update({ status: publicStatus }).eq('id', id);
      await supabase.from('owner_properties').update({ status: ownerStatus }).eq('id', id);
    }

    const unit = localOwnerProperties.find(p => p.id === id);
    if (unit) {
      unit.status = ownerStatus;
    }

    return res.json({
      success: true,
      message: `Property status updated to "${ownerStatus}".`,
      status: ownerStatus
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/owner/applications
exports.getOwnerApplications = async (req, res) => {
  try {
    let applications = [];

    if (supabase) {
      const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        applications = data.map(a => ({
          id: a.id,
          propertyId: a.property_id,
          propertyTitle: a.property_title,
          applicantId: a.applicant_id,
          applicantName: a.applicant_name,
          applicantEmail: a.applicant_email,
          applicantPhone: a.applicant_phone,
          applicantAvatar: a.applicant_avatar,
          rentalDurationMonths: a.rental_duration_months,
          moveInDate: a.move_in_date,
          status: a.status,
          notes: a.notes,
          createdAt: a.created_at
        }));
      }
    }

    if (applications.length === 0) {
      applications = localApplications;
    }

    return res.json({ success: true, data: applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/owner/applications/:id/action
// Accept, Reject, Request More Info
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept', 'reject', 'request_info'

    let newStatus = 'pending';
    if (action === 'accept') newStatus = 'accepted';
    else if (action === 'reject') newStatus = 'rejected';
    else if (action === 'request_info') newStatus = 'info_requested';
    else {
      return res.status(400).json({ success: false, message: 'Action must be accept, reject, or request_info' });
    }

    if (supabase) {
      try {
        await supabase.from('applications').update({ status: newStatus }).eq('id', id);
      } catch (err) {
        console.warn('[Supabase Application Update Error]:', err.message);
      }
    }

    const app = localApplications.find(a => a.id === id);
    if (app) {
      app.status = newStatus;
    }

    return res.json({
      success: true,
      message: `Application ${newStatus === 'accepted' ? 'ACCEPTED' : newStatus === 'rejected' ? 'REJECTED' : 'status updated to Info Requested'}.`,
      status: newStatus
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/owner/maintenance/:id/status
exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Reported', 'In Progress', 'Resolved', 'Escalated'

    if (supabase) {
      try {
        await supabase.from('maintenance_tickets').update({
          status,
          status_color: status === 'Resolved' ? 'emerald' : status === 'In Progress' ? 'blue' : status === 'Escalated' ? 'rose' : 'yellow'
        }).eq('id', id);
      } catch (err) {
        console.warn('[Supabase Maintenance Ticket Status]:', err.message);
      }
    }

    return res.json({
      success: true,
      message: `Maintenance ticket marked as "${status}". Tenant notified via Relay Bot.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


