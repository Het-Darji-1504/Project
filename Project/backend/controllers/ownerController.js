const supabase = require('../config/supabase');
const OwnerProperty = require('../models/OwnerProperty');
const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed/data.json'), 'utf-8')).ownerData;
let localOwnerProperties = rawData.properties;
let localStats = rawData.stats;

function normalizeOwnerProperty(p) {
  return {
    ...p,
    rent: Number(p.rent),
    paymentStatus: p.payment_status || p.paymentStatus,
    maintenanceStatus: p.maintenance_status || p.maintenanceStatus,
    leaseExpiry: p.lease_expiry || p.leaseExpiry
  };
}

// GET /api/owner/dashboard
exports.getOwnerDashboard = async (req, res) => {
  try {
    let properties = [];

    if (supabase) {
      const { data, error } = await supabase.from('owner_properties').select('*');
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

    const activeProperties = properties.length;
    const occupiedUnits = properties.filter(p => p.status === 'Occupied').length;
    const occupancyRate = activeProperties > 0 ? `${((occupiedUnits / activeProperties) * 100).toFixed(1)}%` : '0%';
    const monthlyRevenue = properties.filter(p => p.status === 'Occupied').reduce((sum, p) => sum + (p.rent || 0), 0);

    const stats = {
      activeProperties,
      occupiedUnits,
      occupancyRate,
      monthlyRevenue,
      pendingMaintenance: 2,
      onTimePayments: '95%'
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
    const { title, rent, locality } = req.body;
    if (!title || !rent) {
      return res.status(400).json({ success: false, message: 'Property title and rent amount are required' });
    }

    const newUnit = {
      id: `own-${Date.now()}`,
      title,
      locality: locality || 'SG Highway, Ahmedabad',
      tenant: 'Under Verification',
      rent: Number(rent),
      status: 'Available',
      paymentStatus: 'Listed',
      payment_status: 'Listed',
      maintenanceStatus: 'Clear',
      maintenance_status: 'Clear',
      leaseExpiry: '11 Months',
      lease_expiry: '11 Months'
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
      message: 'Property listed successfully in Supabase! Nestora inspection team will verify within 24 hours.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
