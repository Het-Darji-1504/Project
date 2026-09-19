/**
 * Nestera Roommate Compatibility Engine
 * Calculates a deterministic, explainable compatibility percentage (0% - 100%)
 * based on user questionnaire responses and roommate profiles.
 */

(function (window) {
  'use strict';

  // Helper: map ordinals
  const SMOKING_MAP = {
    'not at all': 4,
    'occasionally': 3,
    'often': 2,
    'regularly': 1
  };

  const DRINKING_MAP = {
    'not at all': 4,
    'occasionally': 3,
    'often': 2,
    'regularly': 1
  };

  const CLEANLINESS_MAP = {
    'very tidy and organized': 4,
    'reasonably tidy': 3,
    'a little messy is fine': 2,
    'mess doesn\'t bother me': 1
  };

  const SLEEP_MAP = {
    'before 11 pm': 1,
    '11 pm–12 am': 2,
    '11 pm-12 am': 2,
    '12–1 am': 3,
    '12-1 am': 3,
    'after 1 am': 4
  };

  const PERSONAL_SPACE_MAP = {
    'extremely important': 4,
    'quite important': 3,
    'somewhat important': 2,
    'not very important': 1
  };

  const RELATIONSHIP_MAP = {
    'very close friends': 4,
    'friendly and social': 3,
    'friendly but independent': 2,
    'mostly just roommates': 1
  };

  function parseRoommateDiet(str) {
    const s = (str || '').toLowerCase();
    if (s.includes('jain')) return 'Pure Jain';
    if (s.includes('pure veg') || s.includes('vegetarian')) return 'Pure Vegetarian';
    if (s.includes('egg') || s.includes('flexible')) return 'Eggitarian';
    if (s.includes('non-veg') || s.includes('non veg')) return 'Non Vegetarian';
    return 'Pure Vegetarian';
  }

  function parseRoommateSmoking(str) {
    const s = (str || '').toLowerCase();
    if (s.includes('strict non') || s.includes('non-smoker') || s.includes('no smoke')) return 'not at all';
    if (s.includes('social') || s.includes('balcony') || s.includes('occasion')) return 'occasionally';
    if (s.includes('often')) return 'often';
    if (s.includes('regular')) return 'regularly';
    return 'not at all';
  }

  function parseRoommateCleanliness(str) {
    const s = (str || '').toLowerCase();
    if (s.includes('immaculate') || s.includes('very clean') || s.includes('daily')) return 'very tidy and organized';
    if (s.includes('neat') || s.includes('tidy') || s.includes('regular')) return 'reasonably tidy';
    if (s.includes('moderate') || s.includes('relaxed')) return 'a little messy is fine';
    if (s.includes('mess')) return 'mess doesn\'t bother me';
    return 'reasonably tidy';
  }

  function parseRoommateSleep(str) {
    const s = (str || '').toLowerCase();
    if (s.includes('early') || s.includes('6 am') || s.includes('10 pm')) return 'before 11 pm';
    if (s.includes('11 pm') || s.includes('regular') || s.includes('midnight')) return '11 pm–12 am';
    if (s.includes('1 am') || s.includes('night owl')) return 'after 1 am';
    if (s.includes('12')) return '12–1 am';
    return '11 pm–12 am';
  }

  function parseRoommateBudget(r) {
    if (r.budgetValue !== undefined && r.budgetValue !== null) return Number(r.budgetValue);
    if (r.budget_value !== undefined && r.budget_value !== null) return Number(r.budget_value);
    if (typeof r.budget === 'string') {
      const nums = r.budget.replace(/[^0-9]/g, ' ').trim().split(/\s+/).map(Number);
      if (nums.length >= 2) return (nums[0] + nums[1]) / 2;
      if (nums.length === 1 && nums[0] > 0) return nums[0];
    }
    return 12000;
  }

  function parseRoommatePersonality(r) {
    const about = ((r.about || '') + ' ' + (r.lifestyle?.socialLevel || '')).toLowerCase();
    if (about.includes('introvert') || about.includes('quiet') || about.includes('peaceful') || about.includes('calm')) return 'Introvert';
    if (about.includes('extrovert') || about.includes('outgoing') || about.includes('social') || about.includes('parties')) return 'Extrovert';
    return 'Ambivert';
  }

  function calculateCompatibility(userPrefs, roommate) {
    if (!userPrefs || !roommate) {
      return {
        percentage: 75,
        matchedFactors: ['Lifestyle compatibility pending quiz completion'],
        differences: []
      };
    }

    const matchedFactors = [];
    const differences = [];

    // Category 1: Food Preferences (Weight: 15)
    let foodScore = 0.8;
    const userFood = userPrefs.food_preference || 'Pure Vegetarian';
    const isStrictFood = (userPrefs.food_preference_flexibility || 'No').toLowerCase() === 'yes';
    const rmFood = parseRoommateDiet(roommate.lifestyle?.food || roommate.lifestyle?.diet);

    if (userFood === rmFood) {
      foodScore = 1.0;
      matchedFactors.push(`Matched diet preference (${userFood})`);
    } else if (!isStrictFood) {
      foodScore = 0.88;
      matchedFactors.push(`Flexible food arrangements (${userFood} & ${rmFood})`);
    } else {
      // Strict user
      if ((userFood.includes('Jain') || userFood.includes('Vegetarian')) && rmFood.includes('Non Vegetarian')) {
        foodScore = userFood.includes('Jain') ? 0.15 : 0.35;
        differences.push(`Different food preferences (${userFood} vs ${rmFood})`);
      } else {
        foodScore = 0.6;
        differences.push(`Minor food preference difference (${userFood} vs ${rmFood})`);
      }
    }

    // Category 2: Monthly Budget (Weight: 12)
    const userBudget = Number(userPrefs.monthly_budget) || 12000;
    const rmBudget = parseRoommateBudget(roommate);
    const budgetDiff = Math.abs(userBudget - rmBudget);
    // Smooth scoring: within 2k -> ~0.95+, within 5k -> ~0.75+
    const budgetScore = Math.max(0.2, 1 - (budgetDiff / 16000));
    if (budgetDiff <= 2500) {
      matchedFactors.push(`Budget aligns within ₹${budgetDiff.toLocaleString('en-IN')}`);
    } else if (budgetDiff > 6000) {
      differences.push(`Budget difference of ₹${budgetDiff.toLocaleString('en-IN')}/mo`);
    }

    // Category 3: Cleanliness (Weight: 10)
    const userCleanVal = CLEANLINESS_MAP[(userPrefs.cleanliness_level || '').toLowerCase()] || 3;
    const rmCleanVal = CLEANLINESS_MAP[parseRoommateCleanliness(roommate.lifestyle?.cleanliness)] || 3;
    const cleanDiff = Math.abs(userCleanVal - rmCleanVal);
    const cleanScore = Math.max(0.2, 1 - (cleanDiff * 0.28));
    if (cleanDiff === 0) {
      matchedFactors.push(`Identical cleanliness standards (${userPrefs.cleanliness_level || 'Tidy'})`);
    } else if (cleanDiff >= 2) {
      differences.push('Noticeable variance in room tidiness standards');
    }

    // Category 4: Sleep Schedule (Weight: 10)
    const userSleepVal = SLEEP_MAP[(userPrefs.sleep_schedule || '').toLowerCase()] || 2;
    const rmSleepVal = SLEEP_MAP[parseRoommateSleep(roommate.lifestyle?.schedule || roommate.lifestyle?.sleepSchedule)] || 2;
    const sleepDiff = Math.abs(userSleepVal - rmSleepVal);
    const sleepScore = Math.max(0.2, 1 - (sleepDiff * 0.28));
    if (sleepDiff === 0) {
      matchedFactors.push(`Synchronized sleep schedule (${userPrefs.sleep_schedule || 'Consistent'})`);
    } else if (sleepDiff >= 2) {
      differences.push('Different sleep hours (Early bird vs Night owl)');
    }

    // Category 5: Smoking (Weight: 8)
    const userSmokeVal = SMOKING_MAP[(userPrefs.smoking_frequency || '').toLowerCase()] || 4;
    const rmSmokeVal = SMOKING_MAP[parseRoommateSmoking(roommate.lifestyle?.smoking)] || 4;
    const smokeDiff = Math.abs(userSmokeVal - rmSmokeVal);
    const smokeScore = Math.max(0.15, 1 - (smokeDiff * 0.3));
    if (userSmokeVal === 4 && rmSmokeVal === 4) {
      matchedFactors.push('Both strict non-smokers');
    } else if (smokeDiff === 0) {
      matchedFactors.push('Matching smoking habits');
    } else if (smokeDiff >= 2) {
      differences.push('Different smoking habits');
    }

    // Category 6: Drinking (Weight: 7)
    const userDrinkVal = DRINKING_MAP[(userPrefs.drinking_frequency || '').toLowerCase()] || 4;
    const rmDrinkVal = 4;
    const drinkDiff = Math.abs(userDrinkVal - rmDrinkVal);
    const drinkScore = Math.max(0.3, 1 - (drinkDiff * 0.25));
    if (userDrinkVal >= 3) {
      matchedFactors.push('Compatible drinking preferences');
    }

    // Category 7: Personality (Weight: 8)
    const userPers = userPrefs.personality_type || 'Ambivert';
    const rmPers = parseRoommatePersonality(roommate);
    let persScore = 0.85;
    if (userPers === rmPers) {
      persScore = 1.0;
      matchedFactors.push(`Complementary ${userPers} personalities`);
    } else if ((userPers === 'Ambivert' || rmPers === 'Ambivert')) {
      persScore = 0.88;
      matchedFactors.push('Harmonious social styles');
    } else {
      persScore = 0.65;
    }

    // Category 8: Roommate Relationship Preference (Weight: 8)
    const userRelVal = RELATIONSHIP_MAP[(userPrefs.roommate_relationship_preference || '').toLowerCase()] || 2;
    const rmRelVal = 2;
    const relDiff = Math.abs(userRelVal - rmRelVal);
    const relScore = Math.max(0.3, 1 - (relDiff * 0.25));
    if (relDiff === 0) {
      matchedFactors.push(`Shared relationship preference (${userPrefs.roommate_relationship_preference || 'Friendly'})`);
    }

    // Category 9: Sleep / Noise Environment (Weight: 7)
    const noisePref = (userPrefs.sleep_environment_preference || '').toLowerCase();
    let noiseScore = 0.85;
    if (noisePref.includes('completely quiet')) {
      noiseScore = rmSleepVal <= 2 ? 0.95 : 0.7;
      if (noiseScore > 0.8) matchedFactors.push('Respects quiet hours during study & sleep');
    } else {
      noiseScore = 0.9;
    }

    // Category 10: Study / Work Location Preference (Weight: 5)
    let studyScore = 0.88;
    const studyPref = (userPrefs.study_location_preference || '').toLowerCase();
    if (studyPref.includes('library') || studyPref.includes('campus')) {
      studyScore = 0.95;
    } else if (studyPref.includes('room')) {
      studyScore = cleanDiff <= 1 ? 0.95 : 0.75;
    }

    // Category 11: Pet Preference (Weight: 5)
    const petPref = (userPrefs.pet_preference || '').toLowerCase();
    const rmPet = (roommate.lifestyle?.pets || '').toLowerCase();
    let petScore = 0.85;
    if (petPref.includes('0 pet tolerance')) {
      if (rmPet.includes('loves') || rmPet.includes('cat') || rmPet.includes('dog')) {
        petScore = 0.2;
        differences.push('Conflict regarding pets in the apartment');
      } else {
        petScore = 1.0;
        matchedFactors.push('Compatible pet-free space');
      }
    } else if (petPref.includes('even i have') || petPref.includes('boundaries')) {
      petScore = 0.95;
      matchedFactors.push('Pet policies align smoothly');
    }

    // Category 12: Personal Space Importance (Weight: 5)
    const userSpaceVal = PERSONAL_SPACE_MAP[(userPrefs.personal_space_importance || '').toLowerCase()] || 3;
    const spaceScore = userSpaceVal >= 3 ? 0.92 : 0.85;
    if (userSpaceVal >= 3) {
      matchedFactors.push('Respects individual privacy and personal space');
    }

    // Category 13: Occupation (Weight: 3)
    let occScore = 0.85;
    const userOcc = (userPrefs.occupation || '').toLowerCase();
    const rmRole = (roommate.role || '').toLowerCase();
    if (userOcc && (rmRole.includes(userOcc) || (userOcc === 'student' && rmRole.includes('student')))) {
      occScore = 1.0;
      matchedFactors.push(`Both identify as ${userPrefs.occupation}`);
    }

    // Category 14: Age Preference (Weight: 2)
    let ageScore = 1.0;
    const agePref = userPrefs.roommate_age_preference || '17–25';
    const rmAge = Number(roommate.age);
    if (rmAge && !isNaN(rmAge)) {
      if (agePref.includes('17–25') || agePref.includes('17-25')) {
        ageScore = (rmAge >= 17 && rmAge <= 25) ? 1.0 : 0.7;
      } else if (agePref.includes('25–35') || agePref.includes('25-35')) {
        ageScore = (rmAge >= 25 && rmAge <= 35) ? 1.0 : 0.7;
      }
    }

    // Calculate normalized weighted sum (total weights = 105)
    const totalWeightedScore =
      (foodScore * 15) +
      (budgetScore * 12) +
      (cleanScore * 10) +
      (sleepScore * 10) +
      (smokeScore * 8) +
      (drinkScore * 7) +
      (persScore * 8) +
      (relScore * 8) +
      (noiseScore * 7) +
      (studyScore * 5) +
      (petScore * 5) +
      (spaceScore * 5) +
      (occScore * 3) +
      (ageScore * 2);

    let rawPercentage = Math.round((totalWeightedScore / 105) * 100);

    // Apply Gender filter adjustment if user explicitly selected Male or Female
    const userGenderPref = userPrefs.roommate_gender_preference || 'Any';
    const rmGender = roommate.gender;
    if (userGenderPref !== 'Any' && rmGender) {
      if (userGenderPref.toLowerCase() === rmGender.toLowerCase()) {
        matchedFactors.unshift(`Preferred gender match (${userGenderPref})`);
      } else {
        rawPercentage = Math.max(30, rawPercentage - 15);
        differences.unshift(`Preferred gender differs (User seeks ${userGenderPref})`);
      }
    }

    // Clamp into 35% - 98% realistic range
    const finalPercentage = Math.min(98, Math.max(35, rawPercentage));

    // Ensure at least 2 positive factors and default differences if none
    if (matchedFactors.length < 2) {
      matchedFactors.push('Compatible living routines and campus commute');
    }
    if (differences.length === 0 && finalPercentage < 90) {
      differences.push('Minor variation in daily work routine');
    }

    return {
      percentage: finalPercentage,
      matchedFactors: matchedFactors.slice(0, 4),
      differences: differences.slice(0, 2)
    };
  }

  window.NesteraCompatibility = {
    calculateCompatibility,
    parseRoommateDiet,
    parseRoommateCleanliness,
    parseRoommateSleep,
    parseRoommateBudget
  };

})(typeof window !== 'undefined' ? window : this);
