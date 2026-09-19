const supabase = require('../config/supabase');

const localContracts = [
  {
    id: 'ct-01',
    propertyId: 'prop-1',
    propertyName: 'Sunrise Harmony Heights (Flat 402)',
    roommates: ['Lead Resident', 'Aarav Sharma'],
    rentSplit: { 'Lead Resident': 8250, 'Aarav Sharma': 8250 },
    utilities: 'Equal 50/50 split via Nestera Tenant Hub',
    choresSchedule: 'Alternating weekly cleaning of kitchen & common balcony',
    quietHours: '11:00 PM – 7:00 AM on weekdays; 12:30 AM on weekends',
    guestPolicy: 'Overnight guests permitted with 24-hr advance WhatsApp notice',
    signatures: [
      { name: 'Lead Resident', signed: true, timestamp: '2026-09-01T14:30:00Z' },
      { name: 'Aarav Sharma', signed: true, timestamp: '2026-09-01T15:45:00Z' }
    ],
    status: 'active',
    createdAt: '2026-09-01T12:00:00Z'
  }
];

function normalizeContract(c) {
  return {
    ...c,
    propertyId: c.property_id || c.propertyId,
    propertyName: c.property_name || c.propertyName,
    rentSplit: c.rent_split || c.rentSplit,
    choresSchedule: c.chores_schedule || c.choresSchedule,
    quietHours: c.quiet_hours || c.quietHours,
    guestPolicy: c.guest_policy || c.guestPolicy,
    createdAt: c.created_at || c.createdAt
  };
}

// GET /api/contracts
exports.getContracts = async (req, res) => {
  try {
    let list = [];
    if (supabase) {
      try {
        const { data, error } = await supabase.from('roommate_contracts').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          list = data.map(normalizeContract);
        }
      } catch (e) {
        console.warn('[Supabase Contracts Query]:', e.message);
      }
    }
    if (list.length === 0) list = [...localContracts];
    return res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/contracts/generate
exports.generateContract = async (req, res) => {
  try {
    const { propertyId, propertyName, roommates, rentSplit, utilities, choresSchedule, quietHours, guestPolicy } = req.body;

    const contractId = `ct-${Date.now()}`;
    const creatorName = req.body.creatorName || req.headers['x-user-name'] || 'Lead Resident';
    const newContract = {
      id: contractId,
      property_id: propertyId || 'prop-1',
      propertyId: propertyId || 'prop-1',
      property_name: propertyName || 'Nestera Shared Flat',
      propertyName: propertyName || 'Nestera Shared Flat',
      roommates: roommates || [creatorName, 'Flatmate'],
      rent_split: rentSplit || { [creatorName]: '50%', 'Flatmate': '50%' },
      rentSplit: rentSplit || { [creatorName]: '50%', 'Flatmate': '50%' },
      utilities: utilities || 'Equal 50/50 split for Torrent Power electricity, piped gas, and 200Mbps Wi-Fi.',
      chores_schedule: choresSchedule || 'Alternating weekly cleaning schedule for kitchen & common washroom.',
      choresSchedule: choresSchedule || 'Alternating weekly cleaning schedule for kitchen & common washroom.',
      quiet_hours: quietHours || '11:00 PM to 7:00 AM on weekdays.',
      quietHours: quietHours || '11:00 PM to 7:00 AM on weekdays.',
      guest_policy: guestPolicy || 'Overnight guests allowed with 24 hours prior mutual consent.',
      guestPolicy: guestPolicy || 'Overnight guests allowed with 24 hours prior mutual consent.',
      signatures: [{ name: `${creatorName} (Creator)`, signed: true, timestamp: new Date().toISOString() }],
      status: 'pending_signatures',
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('roommate_contracts').insert([{
          id: newContract.id,
          property_id: newContract.property_id,
          property_name: newContract.property_name,
          roommates: newContract.roommates,
          rent_split: newContract.rent_split,
          utilities: newContract.utilities,
          chores_schedule: newContract.chores_schedule,
          quiet_hours: newContract.quiet_hours,
          guest_policy: newContract.guest_policy,
          signatures: newContract.signatures,
          status: 'pending_signatures'
        }]);
      } catch (err) {
        console.warn('[Supabase Contract Insert]:', err.message);
      }
    }

    localContracts.unshift(newContract);

    return res.status(201).json({
      success: true,
      message: 'Roommate House Constitution created! Ready for mutual digital signatures.',
      contract: newContract
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/contracts/:id/sign
exports.signContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { signerName } = req.body;

    const signature = { name: signerName || 'Roommate', signed: true, timestamp: new Date().toISOString() };

    if (supabase) {
      const { data } = await supabase.from('roommate_contracts').select('signatures').eq('id', id).single();
      const current = data?.signatures || [];
      current.push(signature);
      await supabase.from('roommate_contracts').update({ signatures: current, status: 'active' }).eq('id', id);
    }

    const c = localContracts.find(item => item.id === id);
    if (c) {
      c.signatures.push(signature);
      c.status = 'active';
    }

    return res.json({
      success: true,
      message: `House Constitution legally countersigned by ${signerName}! Status: ACTIVE.`,
      signatures: c ? c.signatures : [signature]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
