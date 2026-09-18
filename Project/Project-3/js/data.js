// Nestora PropTech - Realistic Indian Market Demo Dataset
// Cities: Ahmedabad, Gandhinagar, Vadodara, Surat, Mumbai, Bengaluru, Pune, Delhi

const NESTORA_DATA = {
  currentUser: {
    name: "Het Darji",
    email: "het.darji@example.com",
    phone: "+91 98765 43210",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    role: "Tenant", // Tenant or Owner
    verified: {
      phone: true,
      email: true,
      identity: true,
      aadhaar: "XXXX-XXXX-4892"
    },
    currentLease: {
      propertyName: "Palm Grove Luxury Living - Flat 402",
      locality: "Near Nirma University, SG Highway, Ahmedabad",
      monthlyRent: 18000,
      deposit: 36000,
      utilities: 3200,
      sharedExpenses: 1450,
      nextDueDate: "Oct 5, 2026",
      daysLeft: 5,
      roommates: ["Rahul Verma", "Aditya Joshi"]
    }
  },

  cities: [
    "Ahmedabad",
    "Gandhinagar",
    "Vadodara",
    "Surat",
    "Mumbai",
    "Bengaluru",
    "Pune",
    "Delhi"
  ],

  propertyTypes: [
    "All Types",
    "Apartment",
    "PG",
    "Shared Apartment",
    "Studio",
    "Co-working",
    "Office",
    "Commercial Space"
  ],

  properties: [
    {
      id: "prop-1",
      title: "Modern 2BHK near Nirma University",
      type: "Apartment",
      city: "Ahmedabad",
      locality: "SG Highway, Chharodi",
      distance: "0.8 km from Nirma Univ • 3 km from SG Highway Hub",
      coordinates: { x: 38, y: 32 }, // percentage for custom interactive map
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
      ],
      rent: 18000,
      deposit: 36000,
      estimatedLivingCost: 22500,
      rating: 4.88,
      reviewsCount: 24,
      verified: true,
      transparencyScore: 92,
      transparencyBreakdown: {
        pricing: 95,
        agreement: 90,
        owner: 96,
        maintenance: 88,
        physical: 92
      },
      specs: {
        bedrooms: 2,
        bathrooms: 2,
        area: "1,150 sq.ft",
        furnishing: "Furnished",
        facing: "North-East",
        floor: "4th of 11",
        moveInDate: "Immediate",
        roommatesAllowed: true
      },
      amenities: [
        "High-Speed Wi-Fi",
        "Reserved Parking",
        "24/7 Security",
        "100% Power Backup",
        "Modular Kitchen",
        "Gym Access",
        "RO Water Purifier",
        "Inverter AC"
      ],
      costBreakdown: {
        rent: 18000,
        electricity: 1500,
        internet: 700,
        maintenance: 1000,
        water: 300,
        other: 1000
      },
      owner: {
        name: "Vikrambhai Patel",
        verified: true,
        phone: "+91 94280 XXXXX",
        responseRate: "98%",
        responseTime: "< 15 mins",
        experience: "4 years hosting on Nestora"
      },
      simplifiedAgreement: {
        rentAmount: "₹18,000 / month due on 5th",
        depositRefund: "100% refundable within 7 business days of checkout",
        noticePeriod: "2 Months notice required by either party",
        lockInPeriod: "6 Months lock-in period",
        maintenanceRule: "Structural & Society repairs borne by Owner; consumable bulbs/taps by Tenant",
        guestPolicy: "Overnight guests permitted with roommate consensus"
      },
      description: "Sunlit modern 2BHK crafted specifically for students and young tech professionals. Features an ergonomic study desk, high-speed fiber broadband, smart modular kitchen, and scenic campus views. Transparent rental lease with zero hidden brokerage."
    },
    {
      id: "prop-2",
      title: "Minimalist Executive Studio in Bodakdev",
      type: "Studio",
      city: "Ahmedabad",
      locality: "Bodakdev, Judges Bungalow Rd",
      distance: "1.2 km from Sindhu Bhavan Rd • 2.5 km from AlphaOne",
      coordinates: { x: 52, y: 48 },
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=800&q=80"
      ],
      rent: 14500,
      deposit: 29000,
      estimatedLivingCost: 17800,
      rating: 4.92,
      reviewsCount: 19,
      verified: true,
      transparencyScore: 96,
      transparencyBreakdown: {
        pricing: 98,
        agreement: 94,
        owner: 97,
        maintenance: 95,
        physical: 96
      },
      specs: {
        bedrooms: 1,
        bathrooms: 1,
        area: "540 sq.ft",
        furnishing: "Furnished",
        facing: "East",
        floor: "2nd of 6",
        moveInDate: "Oct 1, 2026",
        roommatesAllowed: false
      },
      amenities: [
        "High-Speed Wi-Fi",
        "Smart TV",
        "Power Backup",
        "RO Water",
        "Air Conditioner",
        "Elevator",
        "CCTV Surveillance"
      ],
      costBreakdown: {
        rent: 14500,
        electricity: 1200,
        internet: 600,
        maintenance: 800,
        water: 200,
        other: 500
      },
      owner: {
        name: "Ananya Mehta",
        verified: true,
        phone: "+91 98980 XXXXX",
        responseRate: "100%",
        responseTime: "< 10 mins",
        experience: "Top Rated SuperHost"
      },
      simplifiedAgreement: {
        rentAmount: "₹14,500 / month due on 1st",
        depositRefund: "Direct bank transfer within 5 days of inspection",
        noticePeriod: "1 Month notice period",
        lockInPeriod: "3 Months minimum",
        maintenanceRule: "Owner covers all appliance repairs under warranty",
        guestPolicy: "Friends allowed with prior digital log"
      },
      description: "Scandinavian-inspired studio apartment offering quiet productivity. Walkable distance to premium cafes and workspace hubs along Sindhu Bhavan Road."
    },
    {
      id: "prop-3",
      title: "Co-Living Shared 3BHK near GIFT City",
      type: "Shared Apartment",
      city: "Gandhinagar",
      locality: "Koba Circle / GIFT City Access",
      distance: "4 km from GIFT City SEZ • 10 mins from PDPU",
      coordinates: { x: 68, y: 22 },
      images: [
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
      ],
      rent: 11000,
      deposit: 22000,
      estimatedLivingCost: 14200,
      rating: 4.76,
      reviewsCount: 31,
      verified: true,
      transparencyScore: 89,
      transparencyBreakdown: {
        pricing: 91,
        agreement: 88,
        owner: 92,
        maintenance: 85,
        physical: 90
      },
      specs: {
        bedrooms: 3,
        bathrooms: 3,
        area: "1,600 sq.ft (Private Ensuite)",
        furnishing: "Furnished",
        facing: "North",
        floor: "7th of 14",
        moveInDate: "Immediate",
        roommatesAllowed: true
      },
      amenities: [
        "Private Bathroom",
        "Housekeeping 3x/week",
        "Biometric Entry",
        "Gym & Pool",
        "Power Backup",
        "EV Charging"
      ],
      costBreakdown: {
        rent: 11000,
        electricity: 1100,
        internet: 500,
        maintenance: 900,
        water: 200,
        other: 500
      },
      owner: {
        name: "GIFT Living Co.",
        verified: true,
        phone: "+91 79 2321 XXXX",
        responseRate: "95%",
        responseTime: "< 30 mins",
        experience: "Verified Living Partner"
      },
      simplifiedAgreement: {
        rentAmount: "₹11,000 per room due on 7th",
        depositRefund: "Digital escrow release within 7 days",
        noticePeriod: "1 Month notice",
        lockInPeriod: "No lock-in after 3 months",
        maintenanceRule: "Full management handled by facility team",
        guestPolicy: "Daytime visitors permitted"
      },
      description: "Designed for young analysts and tech engineers commuting to GIFT City. Enjoy private ensuite bathrooms, community dining, high-speed Wi-Fi, and regular housekeeping."
    },
    {
      id: "prop-4",
      title: "Spacious 3BHK Family/Shared Penthouse",
      type: "Apartment",
      city: "Ahmedabad",
      locality: "Prahlad Nagar, Anandnagar Rd",
      distance: "0.5 km from Prahladnagar Garden • 500m to Metro",
      coordinates: { x: 45, y: 64 },
      images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
      ],
      rent: 28000,
      deposit: 56000,
      estimatedLivingCost: 34500,
      rating: 4.95,
      reviewsCount: 15,
      verified: true,
      transparencyScore: 94,
      transparencyBreakdown: {
        pricing: 96,
        agreement: 95,
        owner: 94,
        maintenance: 92,
        physical: 95
      },
      specs: {
        bedrooms: 3,
        bathrooms: 3,
        area: "1,950 sq.ft",
        furnishing: "Furnished",
        facing: "North-West",
        floor: "11th of 12",
        moveInDate: "Oct 15, 2026",
        roommatesAllowed: true
      },
      amenities: [
        "Private Balcony Terrace",
        "2 Reserved Car Parks",
        "Clubhouse & Squash",
        "Solar Water Heating",
        "Gas Pipeline",
        "Smart Digital Lock"
      ],
      costBreakdown: {
        rent: 28000,
        electricity: 2400,
        internet: 800,
        maintenance: 1800,
        water: 500,
        other: 1000
      },
      owner: {
        name: "Rajesh & Sunita Shah",
        verified: true,
        phone: "+91 97270 XXXXX",
        responseRate: "99%",
        responseTime: "< 15 mins",
        experience: "3 years on Nestora"
      },
      simplifiedAgreement: {
        rentAmount: "₹28,000 / month due on 5th",
        depositRefund: "Full refund within 7 days",
        noticePeriod: "2 Months notice",
        lockInPeriod: "11 Months lease",
        maintenanceRule: "Major repairs covered by Owner",
        guestPolicy: "Open family & guest policy"
      },
      description: "Expansive penthouse apartment in the prime neighborhood of Prahlad Nagar. Features a panoramic balcony, modular kitchen with PNG, and ultra-fast optical fiber."
    },
    {
      id: "prop-5",
      title: "Smart Urban Co-Working & Private Studio",
      type: "Co-working",
      city: "Ahmedabad",
      locality: "Navrangpura, Near CEPT & Gujarat Univ",
      distance: "300m from CEPT University • 1 km from Law Garden",
      coordinates: { x: 58, y: 40 },
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80"
      ],
      rent: 8500,
      deposit: 15000,
      estimatedLivingCost: 8500,
      rating: 4.82,
      reviewsCount: 42,
      verified: true,
      transparencyScore: 95,
      transparencyBreakdown: {
        pricing: 99,
        agreement: 93,
        owner: 98,
        maintenance: 91,
        physical: 96
      },
      specs: {
        bedrooms: 1,
        bathrooms: 2,
        area: "Dedicated Desk + Meeting Rooms",
        furnishing: "Furnished",
        facing: "East",
        floor: "3rd floor",
        moveInDate: "Immediate",
        roommatesAllowed: false
      },
      amenities: [
        "1 Gbps Dedicated Fiber",
        "Ergonomic Herman Miller Chairs",
        "Artisanal Coffee & Tea",
        "Podcast Studio Access",
        "24/7 Biometric Access"
      ],
      costBreakdown: {
        rent: 8500,
        electricity: 0,
        internet: 0,
        maintenance: 0,
        water: 0,
        other: 0
      },
      owner: {
        name: "Nestora Workspaces",
        verified: true,
        phone: "+91 79 4000 XXXX",
        responseRate: "100%",
        responseTime: "< 5 mins",
        experience: "Direct Managed Hub"
      },
      simplifiedAgreement: {
        rentAmount: "₹8,500 all-inclusive monthly membership",
        depositRefund: "No lock-in, refundable on 15-day notice",
        noticePeriod: "15 Days notice",
        lockInPeriod: "Zero lock-in",
        maintenanceRule: "100% managed by Nestora Hub",
        guestPolicy: "Meeting room guest credits included"
      },
      description: "Designed for freelance designers, tech founders, and remote employees. Includes high-speed connectivity, unlimited pour-over coffee, quiet phone booths, and networking mixers."
    },
    {
      id: "prop-6",
      title: "Vibrant Youth PG & Co-Living Pods",
      type: "PG",
      city: "Ahmedabad",
      locality: "Gota, Chandlodiya",
      distance: "1.5 km to Silver Oak College • Quick Ring Rd connection",
      coordinates: { x: 30, y: 25 },
      images: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"
      ],
      rent: 9500,
      deposit: 15000,
      estimatedLivingCost: 12500,
      rating: 4.65,
      reviewsCount: 38,
      verified: true,
      transparencyScore: 91,
      transparencyBreakdown: {
        pricing: 93,
        agreement: 89,
        owner: 90,
        maintenance: 92,
        physical: 91
      },
      specs: {
        bedrooms: 2,
        bathrooms: 2,
        area: "Twin Sharing Pod",
        furnishing: "Furnished",
        facing: "North",
        floor: "1st floor",
        moveInDate: "Immediate",
        roommatesAllowed: true
      },
      amenities: [
        "3 Meals Daily Included",
        "High-Speed Wi-Fi",
        "Laundry Service",
        "Gaming Lounge (PS5)",
        "Biometric Security"
      ],
      costBreakdown: {
        rent: 9500,
        electricity: 800,
        internet: 0,
        maintenance: 500,
        water: 0,
        other: 1700
      },
      owner: {
        name: "Shailesh Joshi",
        verified: true,
        phone: "+91 99090 XXXXX",
        responseRate: "96%",
        responseTime: "< 20 mins",
        experience: "Youth Living Specialist"
      },
      simplifiedAgreement: {
        rentAmount: "₹9,500 includes food & housekeeping",
        depositRefund: "Refunded on checkout day via UPI",
        noticePeriod: "30 Days notice",
        lockInPeriod: "1 Month minimum",
        maintenanceRule: "All routine repairs handled within 24 hours",
        guestPolicy: "Parents stay allowed in guest room"
      },
      description: "Hassle-free youth living with healthy home-style Kathiyawadi and North Indian meals. Includes automated laundry, gaming zones, and power backup for late-night study sessions."
    }
  ],

  roommates: [
    {
      id: "roommate-1",
      name: "Rohan Patel",
      age: 21,
      role: "Student",
      institution: "CS at Nirma University (3rd Year)",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
      budget: "₹10,000 – ₹14,000",
      budgetValue: 12000,
      preferredLocations: ["SG Highway", "Chharodi", "Gota", "Vaishno Devi Circle"],
      moveInDate: "Within 2 weeks",
      verified: true,
      compatibility: 87,
      compatibilityBreakdown: {
        lifestyle: 92,
        budget: 85,
        location: 90,
        moveInDate: 80
      },
      lifestyle: {
        schedule: "Early riser",
        workStyle: "Quiet study & project builds",
        socialLevel: "Balanced / Moderate",
        cleanliness: "Very Clean & Organized",
        smoking: "Non-smoker",
        pets: "Pet-friendly (doesn't own one)",
        food: "Vegetarian",
        cooking: "Enjoys light cooking & chai"
      },
      about: "Hey! I'm a pre-final year computer science student at Nirma. When I'm not coding hackathon projects, I enjoy badminton on weekends and exploring rooftop cafes. Looking for a respectful, chilled-out roommate to split a modern 2BHK near campus.",
      lookingFor: [
        "Private bedroom in a 2BHK or 3BHK",
        "High-speed fiber connectivity",
        "Walking or short cycle distance to Nirma Univ",
        "Target rent: ₹10k–₹14k/month"
      ],
      whyCompatible: [
        "Both study/work along the SG Highway corridor",
        "Shared preference for quiet hours post 11 PM",
        "Matching budget window (₹12,000/person for a 2BHK)",
        "Both non-smokers and prioritize tidy shared living spaces"
      ]
    },
    {
      id: "roommate-2",
      name: "Aanya Sharma",
      age: 23,
      role: "Working Professional",
      institution: "Product Designer at Fintech Labs (GIFT City)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      budget: "₹14,000 – ₹18,000",
      budgetValue: 16000,
      preferredLocations: ["Bodakdev", "Prahlad Nagar", "Sindhu Bhavan Rd"],
      moveInDate: "Oct 1, 2026",
      verified: true,
      compatibility: 93,
      compatibilityBreakdown: {
        lifestyle: 95,
        budget: 90,
        location: 94,
        moveInDate: 92
      },
      lifestyle: {
        schedule: "Night owl / Flexible",
        workStyle: "Hybrid (3 days WFH, 2 days office)",
        socialLevel: "Friendly & Social",
        cleanliness: "Neat freak (cleans kitchen daily)",
        smoking: "Non-smoker",
        pets: "Loves cats & dogs",
        food: "Flexible / Eggetarian",
        cooking: "Loves baking and Sunday brunches"
      },
      about: "UX designer passionate about typography, indoor plants, and specialty coffee. Work hybrid for a fintech firm. Looking for a friendly flatmate who appreciates a clean, aesthetically pleasing home vibe.",
      lookingFor: [
        "Sunlit private bedroom with large window",
        "Semi/Fully furnished apartment",
        "Gym & running track in society",
        "Budget ₹15k–₹18k"
      ],
      whyCompatible: [
        "Very high aesthetic standard and hygiene priority",
        "Non-smoker, friendly communication",
        "Complementary hybrid routines during weekdays"
      ]
    },
    {
      id: "roommate-3",
      name: "Kabir Mehta",
      age: 24,
      role: "Working Professional",
      institution: "Associate at Khaitan & Co / Law Professional",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      budget: "₹16,000 – ₹20,000",
      budgetValue: 18000,
      preferredLocations: ["Navrangpura", "Ambawadi", "Bodakdev"],
      moveInDate: "Immediate",
      verified: true,
      compatibility: 82,
      compatibilityBreakdown: {
        lifestyle: 80,
        budget: 88,
        location: 84,
        moveInDate: 85
      },
      lifestyle: {
        schedule: "Early riser",
        workStyle: "Long office hours, quiet evenings",
        socialLevel: "Calm & Introverted",
        cleanliness: "Organized",
        smoking: "Non-smoker",
        pets: "No pets",
        food: "Vegetarian",
        cooking: "Prefers tiffin service"
      },
      about: "Corporate lawyer practicing in Ahmedabad courts and corporate advisory. Workdays are intense, so I value a quiet, drama-free sanctuary to read and recharge.",
      lookingFor: [
        "Gated society with 24/7 security",
        "Covered car parking slot",
        "Close to High Court / Ashram Road",
        "Budget ₹16k–₹20k"
      ],
      whyCompatible: [
        "Extremely quiet, dependable, and timely rent payer",
        "Non-smoker, strictly vegetarian household preference"
      ]
    },
    {
      id: "roommate-4",
      name: "Priya Verma",
      age: 22,
      role: "Student / Intern",
      institution: "M.Des at CEPT University",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      budget: "₹11,000 – ₹15,000",
      budgetValue: 13000,
      preferredLocations: ["Navrangpura", "University Area", "Vastrapur"],
      moveInDate: "Within 3 weeks",
      verified: true,
      compatibility: 89,
      compatibilityBreakdown: {
        lifestyle: 91,
        budget: 86,
        location: 93,
        moveInDate: 85
      },
      lifestyle: {
        schedule: "Night owl (architecture studios)",
        workStyle: "Creative studio work",
        socialLevel: "Warm & Open",
        cleanliness: "Tidy",
        smoking: "Non-smoker",
        pets: "Animal lover",
        food: "Eggetarian",
        cooking: "Quick meals & smoothies"
      },
      about: "Architecture & design student at CEPT. Often at the university workshop during afternoons. I enjoy music, cycling around the riverfront, and plant styling.",
      lookingFor: [
        "Room with good natural airflow and desk space",
        "Safe locality for late evening walks",
        "Budget ₹11k–₹15k"
      ],
      whyCompatible: [
        "Respectful of personal space and study deadlines",
        "Clean, thoughtful roommate etiquette"
      ]
    }
  ],

  sharedExpenses: [
    {
      id: "exp-1",
      title: "Torrent Power Electricity Bill",
      category: "Electricity",
      totalAmount: 2400,
      paidBy: "Rahul Verma",
      yourShare: 1200,
      status: "You owe ₹1,200",
      isOwedByYou: true,
      date: "Sep 15, 2026",
      dueDate: "Sep 22, 2026"
    },
    {
      id: "exp-2",
      title: "Airtel Xstream 300 Mbps Fiber",
      category: "Internet",
      totalAmount: 1000,
      paidBy: "Het Darji (You)",
      yourShare: 500,
      status: "Rahul owes you ₹500",
      isOwedByYou: false,
      date: "Sep 12, 2026",
      dueDate: "Settled soon"
    },
    {
      id: "exp-3",
      title: "Monthly Groceries & Essentials",
      category: "Groceries",
      totalAmount: 3200,
      paidBy: "Het Darji (You)",
      yourShare: 1600,
      status: "Settled ✓",
      isOwedByYou: false,
      isSettled: true,
      date: "Sep 08, 2026",
      dueDate: "Completed"
    },
    {
      id: "exp-4",
      title: "Society Drinking Water Cans (RO)",
      category: "Water",
      totalAmount: 600,
      paidBy: "Rahul Verma",
      yourShare: 300,
      status: "You owe ₹300",
      isOwedByYou: true,
      date: "Sep 16, 2026",
      dueDate: "Sep 25, 2026"
    }
  ],

  maintenanceTickets: [
    {
      id: "maint-1",
      title: "Master Bathroom Faucet Leakage",
      category: "Plumbing",
      status: "In Progress",
      statusColor: "red",
      urgency: "High",
      reportedAgo: "Reported 2 days ago (Sep 16)",
      technician: {
        name: "Ramesh Kumar (Plumber)",
        phone: "+91 98251 XXXXX",
        rating: 4.9,
        eta: "Today, 4:30 PM"
      },
      currentStep: 4, // 1: Reported, 2: Assigned, 3: Scheduled, 4: In Progress, 5: Resolved
      timeline: [
        { label: "Reported", time: "Sep 16, 10:15 AM", done: true },
        { label: "Assigned", time: "Sep 16, 11:30 AM", done: true },
        { label: "Technician Scheduled", time: "Sep 17, 02:00 PM", done: true },
        { label: "In Progress", time: "Sep 18, 04:30 PM", done: true },
        { label: "Resolved", time: "Pending test", done: false }
      ],
      description: "Continuous drip from the ceramic mixer tap in the master bathroom. Causing water loss and lime marks.",
      location: "Master Bedroom Ensuite",
      images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80"]
    },
    {
      id: "maint-2",
      title: "Living Room Split AC Periodic Service",
      category: "Appliance",
      status: "Scheduled",
      statusColor: "yellow",
      urgency: "Medium",
      reportedAgo: "Scheduled for Tomorrow, 11:00 AM",
      technician: {
        name: "Dinesh Solanki (UrbanClap Pro)",
        phone: "+91 99740 XXXXX",
        rating: 4.85,
        eta: "Sep 19, 11:00 AM"
      },
      currentStep: 3,
      timeline: [
        { label: "Reported", time: "Sep 15, 04:00 PM", done: true },
        { label: "Assigned", time: "Sep 16, 09:00 AM", done: true },
        { label: "Technician Scheduled", time: "Sep 19, 11:00 AM", done: true },
        { label: "In Progress", time: "Upcoming", done: false },
        { label: "Resolved", time: "Upcoming", done: false }
      ],
      description: "Quarterly filter cleaning and gas pressure diagnostic before summer.",
      location: "Living Room",
      images: []
    },
    {
      id: "maint-3",
      title: "Kitchen Warm-White LED Panel Replacement",
      category: "Electrical",
      status: "Completed",
      statusColor: "green",
      urgency: "Low",
      reportedAgo: "Resolved Yesterday (Sep 17)",
      technician: {
        name: "Mukesh Parmar",
        phone: "+91 97120 XXXXX",
        rating: 5.0,
        eta: "Completed"
      },
      currentStep: 5,
      timeline: [
        { label: "Reported", time: "Sep 14, 02:00 PM", done: true },
        { label: "Assigned", time: "Sep 14, 03:30 PM", done: true },
        { label: "Technician Scheduled", time: "Sep 15, 10:00 AM", done: true },
        { label: "In Progress", time: "Sep 17, 11:15 AM", done: true },
        { label: "Resolved", time: "Sep 17, 12:00 PM", done: true }
      ],
      description: "Replaced faulty 18W ceiling panel with Philips warm-white LED. 1-year warranty receipt attached.",
      location: "Kitchen Ceiling",
      images: []
    }
  ],

  notifications: [
    {
      id: "notif-1",
      priority: "urgent",
      type: "payment",
      title: "Rent payment due in 5 days",
      message: "₹18,000 for Flat 402, Palm Grove due on Oct 5. Pay via UPI to avoid late fee.",
      time: "2 hours ago",
      read: false,
      actionText: "Pay Now",
      actionTarget: "payments"
    },
    {
      id: "notif-2",
      priority: "important",
      type: "maintenance",
      title: "Technician assigned for Plumbing Issue",
      message: "Ramesh Kumar will visit today at 4:30 PM. OTP for service verification: 4891.",
      time: "4 hours ago",
      read: false,
      actionText: "Track Ticket",
      actionTarget: "maintenance"
    },
    {
      id: "notif-3",
      priority: "social",
      type: "roommate",
      title: "New 87% Roommate Match Found!",
      message: "Rohan Patel (Nirma University) matches your living habits and budget near SG Highway.",
      time: "Yesterday",
      read: false,
      actionText: "View Match",
      actionTarget: "roommates"
    },
    {
      id: "notif-4",
      priority: "important",
      type: "agreement",
      title: "Agreement ready for Aadhaar eSign",
      message: "Your simplified 11-month lease terms have been approved by owner Vikrambhai Patel.",
      time: "2 days ago",
      read: true,
      actionText: "Review Terms",
      actionTarget: "agreement"
    },
    {
      id: "notif-5",
      priority: "success",
      type: "system",
      title: "Property & Identity Verification Completed ✓",
      message: "Your DigiLocker Aadhaar KYC and college enrollment proof have been verified with 100% score.",
      time: "3 days ago",
      read: true,
      actionText: "View Badge",
      actionTarget: "profile"
    }
  ],

  ownerData: {
    stats: {
      activeProperties: 8,
      occupiedUnits: 7,
      occupancyRate: "87.5%",
      monthlyRevenue: 142000,
      pendingMaintenance: 3,
      onTimePayments: "94%"
    },
    properties: [
      {
        id: "own-1",
        title: "Palm Grove Luxury Living - Flat 402",
        locality: "SG Highway, Ahmedabad",
        tenant: "Het Darji",
        rent: 18000,
        status: "Occupied",
        paymentStatus: "Due in 5 days",
        maintenanceStatus: "1 Ticket Active",
        leaseExpiry: "Aug 2027"
      },
      {
        id: "own-2",
        title: "Bodakdev Minimal Studio - Unit 201",
        locality: "Judges Bungalow, Ahmedabad",
        tenant: "Sneha Nair",
        rent: 14500,
        status: "Occupied",
        paymentStatus: "Paid ✓",
        maintenanceStatus: "Clear",
        leaseExpiry: "Nov 2026"
      },
      {
        id: "own-3",
        title: "GIFT City Tech Suite - Flat 704",
        locality: "Koba Circle, Gandhinagar",
        tenant: "Aditya Shah & 2 Others",
        rent: 33000,
        status: "Occupied",
        paymentStatus: "Paid ✓",
        maintenanceStatus: "Clear",
        leaseExpiry: "Jan 2027"
      },
      {
        id: "own-4",
        title: "Prahlad Nagar Penthouse - Unit 1102",
        locality: "Anandnagar, Ahmedabad",
        tenant: "Vacant (3 Applications)",
        rent: 28000,
        status: "Available",
        paymentStatus: "Vacant",
        maintenanceStatus: "Painting Complete",
        leaseExpiry: "Immediate"
      },
      {
        id: "own-5",
        title: "Navrangpura Creative Studio - Unit 3B",
        locality: "Near CEPT, Ahmedabad",
        tenant: "Kavya Desai",
        rent: 16500,
        status: "Occupied",
        paymentStatus: "Paid ✓",
        maintenanceStatus: "Clear",
        leaseExpiry: "May 2027"
      }
    ]
  },

  plainEnglishAgreementClauses: [
    {
      id: "cl-1",
      clauseTitle: "Monthly Rent & Escrow Safeguard",
      highlightValue: "₹18,000 / month",
      standardLegal: "The Tenant convenants to pay monthly rent in advance on or before the 5th day of each calendar month into designated account. Failure to remit shall attract statutory penal interest of 12% per annum.",
      plainEnglish: "Pay ₹18,000 by the 5th of every month directly through Nestora UPI or net banking. Zero penalty if you notify before the 3rd. Nestora provides instant GST rent receipts for your HRA tax exemption."
    },
    {
      id: "cl-2",
      clauseTitle: "Security Deposit & Instant 7-Day Refund",
      highlightValue: "₹36,000 (2 Months Rent)",
      standardLegal: "The Tenant shall deposit interest-free security deposit of INR 36,000 to be retained until vacant peaceful handover and indemnification against damages.",
      plainEnglish: "Your ₹36,000 deposit is kept in an escrow-monitored account. When your lease ends, 100% of your deposit is refunded within 7 working days, subject only to fair inspection. No arbitrary owner deductions."
    },
    {
      id: "cl-3",
      clauseTitle: "Notice Period & Early Exit",
      highlightValue: "2 Months Notice",
      standardLegal: "Either party may terminate this deed by serving two calendar months written notice upon the other party after the expiration of the lock-in period.",
      plainEnglish: "Give a 2-month notice through the Nestora app whenever you want to move out. If you find a verified replacement tenant through Nestora Roommate Match, the notice fee is waived!"
    },
    {
      id: "cl-4",
      clauseTitle: "Lock-in Period",
      highlightValue: "6 Months",
      standardLegal: "A mandatory non-derogable lock-in period of six (6) months shall be in effect during which unilateral premature termination shall forfeit the security deposit.",
      plainEnglish: "You commit to stay for at least 6 months. After 6 months, you can exit anytime by giving standard 2 months notice."
    },
    {
      id: "cl-5",
      clauseTitle: "Maintenance & Repair Responsibility",
      highlightValue: "Clear 50/50 Division",
      standardLegal: "Structural defects, plumbing mainlines, seepage and society levies shall devolve onto Lessor. Day-to-day minor consumables under INR 500 shall devolve onto Lessee.",
      plainEnglish: "Landlord pays 100% for structural issues, dampness, plumbing lines, and society maintenance bills. You only pay for minor personal wear and tear like light bulbs or showerheads."
    }
  ]
};

// Export to window
window.NESTORA_DATA = NESTORA_DATA;
