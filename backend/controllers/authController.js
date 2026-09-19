const supabase = require('../config/supabase');

function getDefaultAvatar(gender) {
  const g = (gender || '').toString().toLowerCase().trim();
  if (g === 'female') return '/avatars/avatar-female.png';
  if (g === 'male') return '/avatar.png';
  return '/avatars/avatar-neutral.svg';
}

function isCustomAvatar(avatar) {
  if (!avatar || typeof avatar !== 'string') return false;
  const a = avatar.toLowerCase().trim();
  if (!a) return false;
  const defaultPlaceholders = [
    'pngtree',
    'avatar-male',
    'avatar-female',
    'avatar-neutral',
    '/avatar.png',
    'avatar.png',
    'photo-1507003211169-0a1dd7228f2d',
    'photo-1534528741775-53994a69daeb'
  ];
  return !defaultPlaceholders.some(keyword => a.includes(keyword));
}

function getProfileAvatar(profile) {
  if (!profile) return getDefaultAvatar(null);
  const custom = profile.avatar_url || profile.avatarUrl || profile.avatar;
  if (isCustomAvatar(custom)) {
    return custom;
  }
  return getDefaultAvatar(profile.gender);
}

// Dynamic in-memory user registry for fast fallback
const localProfiles = [
  {
    id: 'usr-owner-1',
    fullName: 'Rajesh Patel',
    email: 'rajesh.patel@nestora.in',
    phone: '+91 94260 54321',
    role: 'owner',
    gender: 'Male',
    avatarUrl: '/avatar.png',
    emailVerified: true
  }
];

// Helper to derive a clean display name from email if needed
function deriveNameFromEmail(email) {
  if (!email) return 'User';
  const localPart = email.split('@')[0];
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ') || 'Nestera User';
}

// POST /api/auth/register
// Role is chosen BEFORE signup and is strictly permanent
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, gender, date_of_birth, dateOfBirth, avatarUrl, avatar_url } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields including permanent role are required.' });
    }

    if (!['tenant', 'owner'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be either tenant or owner.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = fullName.trim();
    const cleanGender = gender || null;
    const cleanDob = date_of_birth || dateOfBirth || null;
    const customAvatar = avatarUrl || avatar_url;
    const avatar = isCustomAvatar(customAvatar) ? customAvatar : getDefaultAvatar(cleanGender);

    let userId = `usr-${Date.now()}`;

    // 1. Create or update profile in Supabase
    if (supabase) {
      try {
        // Check if profile exists
        const { data: existing } = await supabase.from('profiles').select('*').eq('email', cleanEmail).maybeSingle();
        if (existing) {
          userId = existing.id;
          await supabase.from('profiles').update({
            full_name: cleanName,
            phone: phone || existing.phone,
            role: existing.role || role, // permanent role preserved
            avatar_url: isCustomAvatar(existing.avatar_url) ? existing.avatar_url : (isCustomAvatar(customAvatar) ? customAvatar : null),
            gender: cleanGender !== null ? cleanGender : existing.gender,
            date_of_birth: cleanDob !== null ? cleanDob : existing.date_of_birth
          }).eq('id', userId);
        } else {
          await supabase.from('profiles').insert([{
            id: userId,
            full_name: cleanName,
            email: cleanEmail,
            phone: phone || '',
            role: role, // permanent
            avatar_url: isCustomAvatar(customAvatar) ? customAvatar : null,
            gender: cleanGender,
            date_of_birth: cleanDob,
            email_verified: true
          }]);
        }
      } catch (err) {
        console.warn('[Supabase Profile Register]:', err.message);
      }
    }

    const newProfile = {
      id: userId,
      fullName: cleanName,
      email: cleanEmail,
      phone: phone || '',
      role: role,
      gender: cleanGender,
      date_of_birth: cleanDob,
      dateOfBirth: cleanDob,
      avatarUrl: avatar,
      emailVerified: true,
      created_at: new Date().toISOString()
    };

    const existingLocalIdx = localProfiles.findIndex(p => p.email.toLowerCase() === cleanEmail);
    if (existingLocalIdx >= 0) {
      localProfiles[existingLocalIdx] = newProfile;
    } else {
      localProfiles.push(newProfile);
    }

    return res.status(201).json({
      success: true,
      message: `Account created successfully with permanent role: ${role.toUpperCase()}!`,
      user: newProfile,
      token: `nestora-token-${newProfile.id}`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = null;

    // 1. Query Supabase profiles table
    if (supabase) {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('email', cleanEmail).maybeSingle();
        if (data) {
          user = {
            id: data.id,
            fullName: data.full_name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            gender: data.gender || null,
            date_of_birth: data.date_of_birth || null,
            dateOfBirth: data.date_of_birth || null,
            avatarUrl: getProfileAvatar(data),
            emailVerified: data.email_verified
          };
        }
      } catch (e) {
        console.warn('[Supabase Login Query]:', e.message);
      }
    }

    // 2. Query in-memory registry
    if (!user) {
      user = localProfiles.find(u => u.email.toLowerCase() === cleanEmail);
      if (user) {
        user.avatarUrl = getProfileAvatar(user);
      }
    }

    // 3. If user is signing in for the first time with custom credentials, dynamically create their profile
    if (!user) {
      const derivedName = deriveNameFromEmail(cleanEmail);
      user = {
        id: `usr-${Date.now()}`,
        fullName: derivedName,
        email: cleanEmail,
        phone: '+91 98765 00000',
        role: 'tenant', // permanent default
        gender: null,
        date_of_birth: null,
        dateOfBirth: null,
        avatarUrl: getDefaultAvatar(null),
        emailVerified: true
      };

      if (supabase) {
        try {
          await supabase.from('profiles').insert([{
            id: user.id,
            full_name: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            gender: null,
            date_of_birth: null,
            avatar_url: user.avatarUrl,
            email_verified: true
          }]);
        } catch (err) {
          console.warn('[Supabase Auto-Profile Insert]:', err.message);
        }
      }
      localProfiles.push(user);
    }

    return res.json({
      success: true,
      message: 'Signed in successfully!',
      user,
      token: `nestora-token-${user.id}`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    const userEmail = req.headers['x-user-email'] || req.query.email;

    let profile = null;

    if (supabase) {
      try {
        let query = supabase.from('profiles').select('*');
        if (userId) {
          query = query.eq('id', userId);
        } else if (userEmail) {
          query = query.eq('email', userEmail.toLowerCase().trim());
        } else {
          return res.status(401).json({ success: false, message: 'Unauthenticated' });
        }
        const { data } = await query.maybeSingle();
        if (data) {
          profile = {
            id: data.id,
            fullName: data.full_name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            gender: data.gender || null,
            date_of_birth: data.date_of_birth || null,
            dateOfBirth: data.date_of_birth || null,
            avatarUrl: getProfileAvatar(data),
            emailVerified: data.email_verified
          };
        }
      } catch (err) {
        console.warn('[Supabase getMe Query]:', err.message);
      }
    }

    if (!profile && userId) {
      profile = localProfiles.find(p => p.id === userId);
    }
    if (!profile && userEmail) {
      profile = localProfiles.find(p => p.email.toLowerCase() === userEmail.toLowerCase());
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    profile.avatarUrl = getProfileAvatar(profile);
    return res.json({ success: true, user: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/auth/profile
// Used for post-login profile completion or updating Gender / DOB
exports.updateProfile = async (req, res) => {
  try {
    const { userId, email, gender, date_of_birth, dateOfBirth, fullName, phone, avatarUrl, avatar_url } = req.body;
    const cleanDob = date_of_birth || dateOfBirth;
    const customAvatar = avatarUrl || avatar_url;

    const updates = {};
    if (gender !== undefined) updates.gender = gender;
    if (cleanDob !== undefined) updates.date_of_birth = cleanDob;
    if (fullName !== undefined) updates.full_name = fullName;
    if (phone !== undefined) updates.phone = phone;
    if (customAvatar !== undefined) {
      updates.avatar_url = isCustomAvatar(customAvatar) ? customAvatar : null;
    }

    let updatedUser = null;

    if (supabase) {
      try {
        let query = supabase.from('profiles').update(updates);
        if (userId) {
          query = query.eq('id', userId);
        } else if (email) {
          query = query.eq('email', email.toLowerCase().trim());
        } else {
          return res.status(400).json({ success: false, message: 'User ID or Email is required.' });
        }
        const { data, error } = await query.select().maybeSingle();
        if (!error && data) {
          updatedUser = {
            id: data.id,
            fullName: data.full_name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            gender: data.gender || null,
            date_of_birth: data.date_of_birth || null,
            dateOfBirth: data.date_of_birth || null,
            avatarUrl: getProfileAvatar(data),
            emailVerified: data.email_verified
          };
        }
      } catch (err) {
        console.warn('[Supabase Profile Update]:', err.message);
      }
    }

    // Update in-memory fallback if needed
    const targetEmail = (email || (updatedUser && updatedUser.email) || '').toLowerCase();
    const localIdx = localProfiles.findIndex(p => (userId && p.id === userId) || (targetEmail && p.email.toLowerCase() === targetEmail));
    if (localIdx >= 0) {
      if (gender !== undefined) localProfiles[localIdx].gender = gender;
      if (cleanDob !== undefined) {
        localProfiles[localIdx].date_of_birth = cleanDob;
        localProfiles[localIdx].dateOfBirth = cleanDob;
      }
      if (fullName !== undefined) localProfiles[localIdx].fullName = fullName;
      if (phone !== undefined) localProfiles[localIdx].phone = phone;
      if (customAvatar !== undefined) {
        localProfiles[localIdx].avatar_url = isCustomAvatar(customAvatar) ? customAvatar : null;
      }
      localProfiles[localIdx].avatarUrl = getProfileAvatar(localProfiles[localIdx]);
      if (!updatedUser) updatedUser = localProfiles[localIdx];
    }

    if (updatedUser) {
      updatedUser.avatarUrl = getProfileAvatar(updatedUser);
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser || { gender, date_of_birth: cleanDob, dateOfBirth: cleanDob }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
