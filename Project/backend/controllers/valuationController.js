// POST /api/valuation/calculate
exports.calculateValuation = async (req, res) => {
  try {
    const { locality, bhk, area, furnishing, amenitiesCount = 4 } = req.body;

    const baseRates = {
      'sg-highway': 15,
      'bodakdev': 22,
      'prahlad-nagar': 20,
      'navrangpura': 18,
      'gift-city': 16,
      'gota': 11,
      'default': 15
    };

    const locKey = (locality || '').toLowerCase().replace(/\s+/g, '-');
    const ratePerSqft = baseRates[locKey] || baseRates['default'];

    const carpetArea = Number(area) || (Number(bhk) === 1 ? 550 : Number(bhk) === 2 ? 1100 : 1600);

    let baseRent = carpetArea * ratePerSqft;

    // Furnishing adjustment
    if (furnishing === 'Furnished') {
      baseRent *= 1.25;
    } else if (furnishing === 'Semi-Furnished') {
      baseRent *= 1.10;
    }

    // Amenities addition
    baseRent += (Number(amenitiesCount) * 400);

    const fairRent = Math.round(baseRent / 100) * 100;
    const minRange = Math.round((fairRent * 0.92) / 100) * 100;
    const maxRange = Math.round((fairRent * 1.08) / 100) * 100;
    const estimatedSecurityDeposit = fairRent * 2;

    return res.json({
      success: true,
      data: {
        fairRent,
        minRange,
        maxRange,
        deposit: estimatedSecurityDeposit,
        fairnessScore: 94,
        marketRentAverage: Math.round(fairRent * 1.12),
        savingsPerYear: Math.round((fairRent * 1.12 - fairRent) * 12),
        metrics: {
          ratePerSqft,
          carpetArea,
          furnishingScore: furnishing === 'Furnished' ? 'High (+25%)' : 'Standard',
          amenityValueAdded: Number(amenitiesCount) * 400
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
