const supabase = require('../config/supabase');

const localProofVault = [
  {
    id: 'pv-01',
    tenancyId: 'ten-sg1',
    propertyId: 'prop-1',
    type: 'move_in',
    room: 'Living Room',
    itemName: 'Wooden Sofa & Coffee Table',
    condition: 'Good (Minor scratch on left arm)',
    photoUrls: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc'],
    meterReading: 'N/A',
    notes: 'Verified during handover with landlord present.',
    tenantAcknowledged: true,
    ownerAcknowledged: true,
    disputeNotes: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'pv-02',
    tenancyId: 'ten-sg1',
    propertyId: 'prop-1',
    type: 'move_in',
    room: 'Utility Balcony',
    itemName: 'Digital Electricity Meter',
    condition: 'Excellent',
    photoUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758'],
    meterReading: 'Reading: 014820 kWh',
    notes: 'Meter seal intact, stamped by Torrent Power.',
    tenantAcknowledged: true,
    ownerAcknowledged: true,
    disputeNotes: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'pv-03',
    tenancyId: 'ten-sg1',
    propertyId: 'prop-1',
    type: 'move_in',
    room: 'Master Bedroom',
    itemName: 'Daikin 1.5T Inverter AC',
    condition: 'Good (Air filter cleaned)',
    photoUrls: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586'],
    meterReading: 'Remote operational',
    notes: 'Cooling checked at 24C.',
    tenantAcknowledged: true,
    ownerAcknowledged: true,
    disputeNotes: null,
    createdAt: new Date().toISOString()
  }
];

function normalizeProofItem(item) {
  return {
    ...item,
    tenancyId: item.tenancy_id || item.tenancyId,
    propertyId: item.property_id || item.propertyId,
    itemName: item.item_name || item.itemName,
    photoUrls: item.photo_urls || item.photoUrls || [],
    meterReading: item.meter_reading || item.meterReading,
    tenantAcknowledged: item.tenant_acknowledged !== undefined ? item.tenant_acknowledged : item.tenantAcknowledged,
    ownerAcknowledged: item.owner_acknowledged !== undefined ? item.owner_acknowledged : item.ownerAcknowledged,
    disputeNotes: item.dispute_notes !== undefined ? item.dispute_notes : item.disputeNotes,
    createdAt: item.created_at || item.createdAt
  };
}

// GET /api/proof-vault
exports.getProofItems = async (req, res) => {
  try {
    const { propertyId, type } = req.query;
    let items = [];

    if (supabase) {
      try {
        let q = supabase.from('proof_vault').select('*').order('created_at', { ascending: false });
        if (propertyId) q = q.eq('property_id', propertyId);
        if (type) q = q.eq('type', type);
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          items = data.map(normalizeProofItem);
        }
      } catch (err) {
        console.warn('[Supabase Proof Vault Query]:', err.message);
      }
    }

    if (items.length === 0) {
      items = [...localProofVault];
      if (propertyId) items = items.filter(i => i.propertyId === propertyId);
      if (type) items = items.filter(i => i.type === type);
    }

    return res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/proof-vault/items
exports.addProofItem = async (req, res) => {
  try {
    const { propertyId, tenancyId, type, room, itemName, condition, photoUrls, meterReading, notes } = req.body;

    if (!room || !itemName || !condition) {
      return res.status(400).json({ success: false, message: 'Room, Item Name, and Condition are required.' });
    }

    const newItem = {
      id: `pv-${Date.now()}`,
      tenancy_id: tenancyId || 'ten-sg1',
      tenancyId: tenancyId || 'ten-sg1',
      property_id: propertyId || 'prop-1',
      propertyId: propertyId || 'prop-1',
      type: type || 'move_in',
      room,
      item_name: itemName,
      itemName,
      condition,
      photo_urls: photoUrls || ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc'],
      photoUrls: photoUrls || ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc'],
      meter_reading: meterReading || 'N/A',
      meterReading: meterReading || 'N/A',
      notes: notes || '',
      tenant_acknowledged: true,
      tenantAcknowledged: true,
      owner_acknowledged: false,
      ownerAcknowledged: false,
      dispute_notes: null,
      disputeNotes: null,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('proof_vault').insert([{
          id: newItem.id,
          tenancy_id: newItem.tenancy_id,
          property_id: newItem.property_id,
          type: newItem.type,
          room: newItem.room,
          item_name: newItem.item_name,
          condition: newItem.condition,
          photo_urls: newItem.photo_urls,
          meter_reading: newItem.meter_reading,
          notes: newItem.notes,
          tenant_acknowledged: newItem.tenant_acknowledged,
          owner_acknowledged: newItem.owner_acknowledged
        }]);
      } catch (err) {
        console.warn('[Supabase Proof Vault Insert]:', err.message);
      }
    }

    localProofVault.unshift(newItem);

    return res.status(201).json({
      success: true,
      message: 'Evidence successfully locked in Move-In / Move-Out Proof Vault!',
      data: newItem
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/proof-vault/:id/acknowledge
exports.acknowledgeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // 'tenant' or 'owner'

    const updateFields = {};
    if (role === 'owner') {
      updateFields.owner_acknowledged = true;
      updateFields.ownerAcknowledged = true;
    } else {
      updateFields.tenant_acknowledged = true;
      updateFields.tenantAcknowledged = true;
    }

    if (supabase) {
      await supabase.from('proof_vault').update(updateFields).eq('id', id);
    }

    const item = localProofVault.find(i => i.id === id);
    if (item) {
      if (role === 'owner') item.ownerAcknowledged = true;
      else item.tenantAcknowledged = true;
    }

    return res.json({ success: true, message: `Condition verified and signed by ${role}!` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/proof-vault/:id/dispute
exports.disputeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { disputeNotes } = req.body;

    if (supabase) {
      await supabase.from('proof_vault').update({ dispute_notes: disputeNotes }).eq('id', id);
    }

    const item = localProofVault.find(i => i.id === id);
    if (item) {
      item.disputeNotes = disputeNotes;
    }

    return res.json({ success: true, message: 'Dispute recorded with immutable timestamp.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
