// Nestera PropTech - Realistic Indian Market Demo Dataset
// Cities: Ahmedabad, Gandhinagar, Vadodara, Surat, Mumbai, Bengaluru, Pune, Delhi

const NESTORA_DATA = {
  currentUser: {
    name: "Aman Singh",
    email: "aman.singh@nirmauni.ac.in",
    phone: "+91 98765 43210",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
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
        experience: "4 years hosting on Nestera"
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
        experience: "3 years on Nestera"
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
        name: "Nestera Workspaces",
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
        maintenanceRule: "100% managed by Nestera Hub",
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
      name: "Aman Singh",
      age: 21,
      role: "Student",
      institution: "CS at Nirma University (3rd Year)",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
      budget: "₹10,000 – ₹14,000",
      budgetValue: 12000,
      preferredLocations: ["SG Highway", "Gota", "Chandkheda"],
      moveInDate: "Immediate",
      verified: true,
      compatibility: 96,
      compatibilityBreakdown: { lifestyle: 95, budget: 92, location: 98, moveInDate: 94 },
      lifestyle: { schedule: "Night Owl (Sleeps 1 AM)", workStyle: "Coding & Projects", socialLevel: "Moderate", cleanliness: "Very Clean (Daily sweep)", smoking: "Strict Non-Smoker", pets: "No pets", food: "Vegetarian Preferred", cooking: "Enjoys cooking chai & snacks" },
      about: "Pre-final year CS undergrad working on distributed systems and AI. Quiet study hours on weekdays, loves badminton and exploring cafes along SG Highway.",
      lookingFor: ["Co-working friendly setup", "Split high-speed Wi-Fi", "Respectful of study hours"],
      whyCompatible: ["Both prefer quiet evening study sessions", "High cleanliness standards match", "Similar campus commute times"]
    },
    {
      id: "roommate-2",
      name: "Siddharth Malhotra",
      age: 23,
      role: "Working Professional",
      institution: "Fintech Product Associate at GIFT City Tech Park",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      budget: "₹15,000 – ₹20,000",
      budgetValue: 18000,
      preferredLocations: ["Prahlad Nagar", "Bodakdev", "Satellite"],
      moveInDate: "Within 15 Days",
      verified: true,
      compatibility: 94,
      compatibilityBreakdown: { lifestyle: 96, budget: 90, location: 92, moveInDate: 95 },
      lifestyle: { schedule: "Early Riser (6 AM - 11 PM)", workStyle: "Hybrid (3 days office, 2 days remote)", socialLevel: "Professional & Calm", cleanliness: "Immaculate (Hires cook/maid)", smoking: "Non-Smoker", pets: "Loves dogs", food: "Flexible / Eggetarian", cooking: "Weekend cooking" },
      about: "Fintech associate at GIFT City. Into specialty filter coffee, running on Sindhu Bhavan Road, and clean living aesthetics.",
      lookingFor: ["Professional working flatmate", "Dedicated work desk zone", "Fully furnished 2BHK/3BHK"],
      whyCompatible: ["Complementary professional schedules", "Shared preference for quiet evenings", "High financial reliability for utility splits"]
    },
    {
      id: "roommate-3",
      name: "Arjun Mehta",
      age: 22,
      role: "Student",
      institution: "M.Des Urban Design at CEPT University",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      budget: "₹12,000 – ₹16,000",
      budgetValue: 14000,
      preferredLocations: ["Navrangpura", "Vastrapur", "Ambawadi"],
      moveInDate: "Next Month",
      verified: true,
      compatibility: 92,
      compatibilityBreakdown: { lifestyle: 88, budget: 85, location: 96, moveInDate: 90 },
      lifestyle: { schedule: "Flexible Design Hours", workStyle: "Studio & 3D Modeling", socialLevel: "Creative & Friendly", cleanliness: "Organized Studio Vibe", smoking: "Non-Smoker", pets: "Pet friendly", food: "No Preference", cooking: "Simple home meals" },
      about: "Architecture postgraduate at CEPT. Often working on 3D modeling and sustainable urban projects. Appreciates plants, natural lighting, and minimalist house interiors.",
      lookingFor: ["Close to CEPT / Navrangpura", "Natural daylight and cross ventilation", "Creative calm atmosphere"],
      whyCompatible: ["Appreciates interior aesthetics and design", "Similar budget ceiling", "Non-intrusive personal boundaries"]
    },
    {
      id: "roommate-4",
      name: "Rohan Shah",
      age: 20,
      role: "Student",
      institution: "B.Tech IT at Nirma University",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
      budget: "₹9,000 – ₹13,000",
      budgetValue: 11000,
      preferredLocations: ["SG Highway", "Gota", "Vaishno Devi Circle"],
      moveInDate: "Immediate",
      verified: true,
      compatibility: 91,
      compatibilityBreakdown: { lifestyle: 90, budget: 94, location: 92, moveInDate: 88 },
      lifestyle: { schedule: "Midnight (12 AM - 8 AM)", workStyle: "Open Source Contributor", socialLevel: "Quiet & Introvert", cleanliness: "Neat & Tidy", smoking: "Non-Smoker", pets: "No pets", food: "Vegetarian", cooking: "Quick bites & snacks" },
      about: "Competitive coder and open source contributor. Looking for a flatmate along SG Highway close to Nirma. Prefers simple vegetarian meals and high-speed broadband.",
      lookingFor: ["Split 300 Mbps Wi-Fi bill", "Clean shared kitchen", "Reliable power backup"],
      whyCompatible: ["Shared Nirma University commute", "Both value fast reliable internet", "Zero conflict vegetarian kitchen preference"]
    },
    {
      id: "roommate-5",
      name: "Aditya Patel",
      age: 24,
      role: "Working Professional",
      institution: "Data Analyst at TCS (Gandhinagar)",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
      budget: "₹13,000 – ₹17,000",
      budgetValue: 15000,
      preferredLocations: ["Kudasan", "Infocity", "Randesan"],
      moveInDate: "Within 10 Days",
      verified: true,
      compatibility: 93,
      compatibilityBreakdown: { lifestyle: 94, budget: 95, location: 90, moveInDate: 91 },
      lifestyle: { schedule: "Regular (11 PM - 7 AM)", workStyle: "Office 5 days/wk", socialLevel: "Calm", cleanliness: "High standard", smoking: "Non-Smoker", pets: "No pets", food: "Vegetarian", cooking: "Tiffin & home kitchen" },
      about: "Data analyst commuting to TCS Infocity Gandhinagar. Enjoys weekend cycling, podcasts, and calm weekends without loud house parties.",
      lookingFor: ["Gandhinagar or Randesan flat", "Quiet flatmates", "Reserved parking for two-wheeler"],
      whyCompatible: ["Similar predictable work-week schedules", "Mutual preference for a calm, non-party home", "Both strictly non-smoking"]
    },
    {
      id: "roommate-6",
      name: "Yash Desai",
      age: 21,
      role: "Student",
      institution: "B.Com Honours at Ahmedabad University",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
      budget: "₹11,000 – ₹15,000",
      budgetValue: 13000,
      preferredLocations: ["Commerce Six Roads", "Vastrapur", "Gulbai Tekra"],
      moveInDate: "Next Month",
      verified: true,
      compatibility: 89,
      compatibilityBreakdown: { lifestyle: 90, budget: 88, location: 90, moveInDate: 92 },
      lifestyle: { schedule: "12 AM - 7:30 AM", workStyle: "Finance studies & Gym", socialLevel: "Active", cleanliness: "Regular upkeep", smoking: "Non-Smoker", pets: "Pet friendly", food: "Vegetarian", cooking: "Healthy protein meals" },
      about: "Finance enthusiast preparing for CFA Level 1. Need a calm study corner. Enjoys gym workouts and weekend cricket.",
      lookingFor: ["Flat near Ahmedabad University", "AC in bedroom", "Equipped kitchen"],
      whyCompatible: ["Values study and exam preparation time", "Disciplined daily routine", "Close proximity to University area"]
    },
    {
      id: "roommate-7",
      name: "Rahul Sharma",
      age: 23,
      role: "Student",
      institution: "MBA at Nirma Institute of Management",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
      budget: "₹14,000 – ₹18,000",
      budgetValue: 16000,
      preferredLocations: ["SG Highway", "Bodakdev", "Thaltej"],
      moveInDate: "Immediate",
      verified: true,
      compatibility: 95,
      compatibilityBreakdown: { lifestyle: 92, budget: 91, location: 97, moveInDate: 89 },
      lifestyle: { schedule: "1 AM - 8 AM", workStyle: "Case studies & presentations", socialLevel: "Networking & Friendly", cleanliness: "Very clean", smoking: "Non-Smoker", pets: "No pets", food: "Flexible", cooking: "Light breakfast" },
      about: "MBA student juggling case studies and internships. Seeking a like-minded flatmate who values productivity and mutual respect.",
      lookingFor: ["2BHK sharing with dedicated study space", "Quiet during exam weeks", "Professional vibe"],
      whyCompatible: ["High drive for academics and career focus", "Clear communication style", "Proactive on utility bill sharing"]
    },
    {
      id: "roommate-8",
      name: "Kunal Verma",
      age: 22,
      role: "Student",
      institution: "M.Tech AI at DA-IICT (Gandhinagar)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      budget: "₹10,000 – ₹13,500",
      budgetValue: 12000,
      preferredLocations: ["PDPU Road", "Kudasan", "Bhaijipura"],
      moveInDate: "Within 2 Weeks",
      verified: true,
      compatibility: 90,
      compatibilityBreakdown: { lifestyle: 91, budget: 96, location: 95, moveInDate: 87 },
      lifestyle: { schedule: "Night Owl coder", workStyle: "AI Research", socialLevel: "Introvert", cleanliness: "Clean room", smoking: "Non-Smoker", pets: "Loves cats", food: "Eggetarian", cooking: "Microwave & meal prep" },
      about: "AI research scholar at DA-IICT. Spends time training computer vision models and writing research papers. Very peaceful roommate.",
      lookingFor: ["Close to DA-IICT / PDPU bus route", "High-speed fiber connection", "Study desk friendly"],
      whyCompatible: ["Respects personal silence and study needs", "Technical background synergy", "Zero drama housemate"]
    },
    {
      id: "roommate-9",
      name: "Dhruv Shah",
      age: 21,
      role: "Student",
      institution: "Civil Engineering at PDPU",
      avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80",
      budget: "₹11,000 – ₹14,500",
      budgetValue: 12500,
      preferredLocations: ["Raysan", "Koba Circle", "PDPU Road"],
      moveInDate: "Immediate",
      verified: true,
      compatibility: 93,
      compatibilityBreakdown: { lifestyle: 93, budget: 89, location: 92, moveInDate: 90 },
      lifestyle: { schedule: "11:30 PM - 7 AM", workStyle: "College projects", socialLevel: "Sports & Social", cleanliness: "Neat & Organized", smoking: "Non-Smoker", pets: "No pets", food: "Strict Vegetarian", cooking: "Home Gujarati food" },
      about: "PDPU final year student. Passionate about green building design and concrete technology. Enjoys tennis on weekends and home-cooked Gujarati food.",
      lookingFor: ["Furnished flat near Raysan/PDPU", "Shared cook facility", "Peaceful society"],
      whyCompatible: ["Shared university radius", "Clean vegetarian lifestyle match", "Dependable rent commitment"]
    },
    {
      id: "roommate-10",
      name: "Harsh Patel",
      age: 24,
      role: "Working Professional",
      institution: "Software Engineer at Crest Data Systems",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80",
      budget: "₹15,000 – ₹19,000",
      budgetValue: 17000,
      preferredLocations: ["Sindhu Bhavan Road", "Bodakdev", "Makarba"],
      moveInDate: "Within 20 Days",
      verified: true,
      compatibility: 97,
      compatibilityBreakdown: { lifestyle: 98, budget: 92, location: 94, moveInDate: 93 },
      lifestyle: { schedule: "11 PM - 7 AM", workStyle: "Hybrid Tech Work", socialLevel: "Balanced", cleanliness: "Immaculate cleanliness", smoking: "Non-Smoker", pets: "No pets", food: "Vegetarian", cooking: "Cooks on Sundays" },
      about: "Full-stack engineer at Crest Data Systems. Loves tech podcasts, ergonomic workspace setups, and cooking healthy meals on Sundays.",
      lookingFor: ["Modern 3BHK flatshare", "Ensuite washroom", "Balcony with plants"],
      whyCompatible: ["Matches high standards of home cleanliness", "Mature working professional", "Punctual with all bills"]
    },
    {
      id: "roommate-11",
      name: "Ankit Joshi",
      age: 23,
      role: "Student",
      institution: "Chartered Accountancy (CA Final)",
      avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=400&q=80",
      budget: "₹10,500 – ₹14,000",
      budgetValue: 12000,
      preferredLocations: ["Navrangpura", "Paldi", "Usmanpura"],
      moveInDate: "Next Month",
      verified: true,
      compatibility: 88,
      compatibilityBreakdown: { lifestyle: 90, budget: 86, location: 99, moveInDate: 82 },
      lifestyle: { schedule: "5 AM early wake", workStyle: "Articleship & Studies", socialLevel: "Quiet", cleanliness: "Orderly", smoking: "Non-Smoker", pets: "No pets", food: "Vegetarian", cooking: "Tiffin" },
      about: "CA Final student doing articleship at a reputed firm in Ashram Road. Spends 10-12 hours studying. Needs an ultra-peaceful household.",
      lookingFor: ["Absolute silence after 10 PM", "No loud parties", "Reliable power & study lamp"],
      whyCompatible: ["Ultimate peace of mind flatmate", "Zero disruption lifestyle", "Reliable and ethical housemate"]
    },
    {
      id: "roommate-12",
      name: "Raj Mehta",
      age: 22,
      role: "Student",
      institution: "Mechanical Engineering at Nirma University",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      budget: "₹11,000 – ₹15,000",
      budgetValue: 13000,
      preferredLocations: ["Gota", "SG Highway", "Jagatpur"],
      moveInDate: "Immediate",
      verified: true,
      compatibility: 92,
      compatibilityBreakdown: { lifestyle: 91, budget: 93, location: 90, moveInDate: 91 },
      lifestyle: { schedule: "12 AM - 7 AM", workStyle: "Formula Student Lead", socialLevel: "Friendly", cleanliness: "Clean", smoking: "Non-Smoker", pets: "Pet friendly", food: "Flexible", cooking: "Basic meals" },
      about: "Automobile enthusiast and Formula Student collegiate team lead. Spends hours designing chassis and suspension. Friendly and easy-going.",
      lookingFor: ["Gota/SG Highway location", "Safe vehicle parking", "Cooperative flatmate"],
      whyCompatible: ["Affinity for mechanical projects and precision", "Good natured communication", "Consistent routine"]
    },
    {
      id: "roommate-13",
      name: "Krish Shah",
      age: 20,
      role: "Student",
      institution: "BBA at HL Institute of Commerce",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
      budget: "₹12,000 – ₹16,000",
      budgetValue: 14000,
      preferredLocations: ["Navrangpura", "Gulbai Tekra", "C.G. Road"],
      moveInDate: "Within 1 Week",
      verified: true,
      compatibility: 91,
      compatibilityBreakdown: { lifestyle: 89, budget: 91, location: 89, moveInDate: 94 },
      lifestyle: { schedule: "12 AM - 8 AM", workStyle: "Entrepreneurship cell", socialLevel: "Sociable", cleanliness: "Regular tidying", smoking: "Non-Smoker", pets: "Loves dogs", food: "Vegetarian", cooking: "Smoothies & shakes" },
      about: "Commerce student involved in university entrepreneurship cell. Interested in startup ecosystems and public speaking. Enjoys fitness and running.",
      lookingFor: ["Vibrant central Ahmedabad location", "Modern interior amenities", "Fast Wi-Fi"],
      whyCompatible: ["Active and positive personality", "Sociable yet respectful of privacy", "Organized house maintenance"]
    },
    {
      id: "roommate-14",
      name: "Dev Patel",
      age: 23,
      role: "Working Professional",
      institution: "UI/UX Designer at Ahmedabad Design Studio",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      budget: "₹14,000 – ₹18,000",
      budgetValue: 16000,
      preferredLocations: ["Prahlad Nagar", "Vastrapur", "Satellite"],
      moveInDate: "Next Month",
      verified: true,
      compatibility: 95,
      compatibilityBreakdown: { lifestyle: 97, budget: 92, location: 91, moveInDate: 93 },
      lifestyle: { schedule: "12:30 AM - 8 AM", workStyle: "Design consultant", socialLevel: "Relaxed", cleanliness: "Design studio tidy", smoking: "Non-Smoker", pets: "Plant parent", food: "Flexible", cooking: "Italian & chai" },
      about: "Visual designer who works with global SaaS clients. Loves plants, Scandinavian furniture, and ambient music on headphones.",
      lookingFor: ["Aesthetically curated apartment", "Spacious work station area", "Clean kitchen & washroom"],
      whyCompatible: ["Eye for clean living environments", "Considerate of shared spaces", "Easy to collaborate on home tasks"]
    },
    {
      id: "roommate-15",
      name: "Parth Desai",
      age: 22,
      role: "Student",
      institution: "Chemical Engineering at PDPU",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      budget: "₹10,000 – ₹13,500",
      budgetValue: 11500,
      preferredLocations: ["Kudasan", "Raysan", "Infocity"],
      moveInDate: "Immediate",
      verified: true,
      compatibility: 90,
      compatibilityBreakdown: { lifestyle: 91, budget: 90, location: 93, moveInDate: 88 },
      lifestyle: { schedule: "11:30 PM - 6:30 AM", workStyle: "Early Morning Library", socialLevel: "Quiet", cleanliness: "Well maintained", smoking: "Non-Smoker", pets: "No pets", food: "Vegetarian", cooking: "Simple food" },
      about: "Chemical engineering senior focusing on battery technology. Early morning person who studies in campus library. Loves badminton and chess.",
      lookingFor: ["Peaceful gated society in Gandhinagar", "Split electricity and maid bills evenly", "Non-smoker flat"],
      whyCompatible: ["Disciplined lifestyle schedule", "Low maintenance flatmate", "Consistent bill payer"]
    },
    {
      id: "roommate-16",
      name: "Ayush Sharma",
      age: 24,
      role: "Working Professional",
      institution: "Investment Banking Analyst at GIFT City IFSC",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
      budget: "₹16,000 – ₹22,000",
      budgetValue: 19000,
      preferredLocations: ["GIFT City", "Randesan", "Motera"],
      moveInDate: "Within 10 Days",
      verified: true,
      compatibility: 96,
      compatibilityBreakdown: { lifestyle: 96, budget: 94, location: 90, moveInDate: 95 },
      lifestyle: { schedule: "11:30 PM - 6:30 AM", workStyle: "Finance professional", socialLevel: "Private", cleanliness: "Executive tidy", smoking: "Non-Smoker", pets: "No pets", food: "Vegetarian / Eggetarian", cooking: "Occasional" },
      about: "IB analyst working in GIFT City IFSC. High work hours on weekdays, travels occasionally. Seeking a reliable professional to co-rent a premium 2BHK/3BHK.",
      lookingFor: ["Premium high-rise society", "Gym and swimming pool on campus", "Professional housekeeping"],
      whyCompatible: ["High financial stability", "Quiet weekday resident", "Respects mutual privacy"]
    },
    {
      id: "roommate-17",
      name: "Neel Shah",
      age: 21,
      role: "Student",
      institution: "B.Tech Electrical at Nirma University",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
      budget: "₹10,000 – ₹14,000",
      budgetValue: 12000,
      preferredLocations: ["SG Highway", "Gota", "Tragda"],
      moveInDate: "Next Month",
      verified: true,
      compatibility: 92,
      compatibilityBreakdown: { lifestyle: 92, budget: 93, location: 94, moveInDate: 89 },
      lifestyle: { schedule: "12 AM - 7:30 AM", workStyle: "IoT Projects", socialLevel: "Moderate", cleanliness: "Proper upkeep", smoking: "Non-Smoker", pets: "No pets", food: "Vegetarian", cooking: "Home kitchen" },
      about: "Electrical engineering junior working on IoT robotics. Enjoys microcontroller tinkering and playing guitar with headphones.",
      lookingFor: ["Close to Nirma bus stop", "Broadband internet with low ping", "Vegetarian kitchen"],
      whyCompatible: ["Same college campus radius", "Technical hobbies with zero noise disruption", "Clear communication"]
    },
    {
      id: "roommate-18",
      name: "Manav Patel",
      age: 23,
      role: "Student",
      institution: "Masters in Urban Planning at CEPT",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
      budget: "₹13,000 – ₹17,000",
      budgetValue: 15000,
      preferredLocations: ["Navrangpura", "Vastrapur", "Ambawadi"],
      moveInDate: "Immediate",
      verified: true,
      compatibility: 94,
      compatibilityBreakdown: { lifestyle: 94, budget: 91, location: 96, moveInDate: 92 },
      lifestyle: { schedule: "Flexible", workStyle: "Transit Mapping & Studio", socialLevel: "Artistic", cleanliness: "Very neat", smoking: "Non-Smoker", pets: "Plant lover", food: "Flexible", cooking: "Cooking enthusiast" },
      about: "Urban planner analyzing public transit networks in Ahmedabad. Spends free time sketching heritage monuments and visiting art galleries.",
      lookingFor: ["Proximity to CEPT campus", "Open balcony for plants", "Quiet residential lane"],
      whyCompatible: ["Cultured and respectful companion", "Clean household etiquette", "Shared urban living values"]
    },
    {
      id: "roommate-19",
      name: "Vedant Mehta",
      age: 22,
      role: "Working Professional",
      institution: "Associate Consultant at PwC (Ahmedabad)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      budget: "₹15,000 – ₹19,000",
      budgetValue: 17000,
      preferredLocations: ["Sindhu Bhavan Road", "Bodakdev", "Thaltej"],
      moveInDate: "Within 2 Weeks",
      verified: true,
      compatibility: 95,
      compatibilityBreakdown: { lifestyle: 95, budget: 93, location: 92, moveInDate: 94 },
      lifestyle: { schedule: "11:30 PM - 7 AM", workStyle: "Strategy Consulting", socialLevel: "Professional", cleanliness: "Professional neatness", smoking: "Non-Smoker", pets: "No pets", food: "Flexible", cooking: "Cook/maid service" },
      about: "Consultant working in corporate strategy. Enjoys squash, reading autobiographies, and exploring new restaurants along SBR.",
      lookingFor: ["Furnished gated complex", "Clubhouse / fitness center access", "Strictly non-smoking home"],
      whyCompatible: ["Professional integrity and reliability", "Healthy social-private boundary balance", "Split home expenses transparently"]
    },
    {
      id: "roommate-20",
      name: "Riya Shah",
      age: 22,
      role: "Student",
      institution: "M.Des Industrial Design at NID (Ahmedabad)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      budget: "₹12,000 – ₹16,000",
      budgetValue: 14000,
      preferredLocations: ["Paldi", "Ellisbridge", "Navrangpura"],
      moveInDate: "Immediate",
      verified: true,
      compatibility: 93,
      compatibilityBreakdown: { lifestyle: 96, budget: 90, location: 95, moveInDate: 91 },
      lifestyle: { schedule: "12 AM - 8 AM", workStyle: "Material design & ceramics", socialLevel: "Friendly", cleanliness: "Artistic yet super organized", smoking: "Strict Non-Smoker", pets: "Loves cats", food: "Vegetarian", cooking: "Herbal teas & healthy snacks" },
      about: "Industrial design student passionate about sustainable materials and ceramics. Loves indoor plants and brewing herbal tea.",
      lookingFor: ["Safe female/co-ed flat near Paldi/NID", "Natural ventilation and workspace", "Zero tolerance for cigarettes"],
      whyCompatible: ["High cleanliness standards", "Peaceful, inspiring home environment", "Organized and mindful of chores"]
    },
    {
      id: "roommate-21",
      name: "Ananya Patel",
      age: 21,
      role: "Student",
      institution: "B.Tech CSE at Ahmedabad University",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      budget: "₹11,000 – ₹15,000",
      budgetValue: 13000,
      preferredLocations: ["Vastrapur", "Commerce Six Roads", "Bodakdev"],
      moveInDate: "Within 10 Days",
      verified: true,
      compatibility: 94,
      compatibilityBreakdown: { lifestyle: 95, budget: 93, location: 97, moveInDate: 90 },
      lifestyle: { schedule: "11 PM - 7 AM", workStyle: "Open Source Developer", socialLevel: "Balanced", cleanliness: "Clean and tidy", smoking: "Non-Smoker", pets: "Pet friendly", food: "Vegetarian", cooking: "Morning smoothies & snacks" },
      about: "Computer science undergrad building open-source developer tooling. Into yoga, morning smoothies, and weekend book club discussions.",
      lookingFor: ["Quiet flat near Vastrapur Lake", "Dedicated study corner", "Friendly communicative housemate"],
      whyCompatible: ["Shared academic focus and discipline", "Healthy lifestyle alignment", "Transparent split of grocery and utilities"]
    },
    {
      id: "roommate-22",
      name: "Priya Sharma",
      age: 24,
      role: "Working Professional",
      institution: "Brand Strategist at DDB Mudra (GIFT City / SG Highway)",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
      budget: "₹14,000 – ₹18,500",
      budgetValue: 16000,
      preferredLocations: ["Prahlad Nagar", "Bodakdev", "Makarba"],
      moveInDate: "Next Month",
      verified: true,
      compatibility: 96,
      compatibilityBreakdown: { lifestyle: 97, budget: 91, location: 92, moveInDate: 94 },
      lifestyle: { schedule: "12 AM - 7:30 AM", workStyle: "Advertising & Campaigns", socialLevel: "Warm & Open", cleanliness: "High aesthetic tidiness", smoking: "Non-Smoker", pets: "No pets", food: "Flexible", cooking: "Baking & coffee" },
      about: "Advertising professional creating campaigns for retail and tech brands. Appreciates warm interior lighting, indie music, and clean kitchens.",
      lookingFor: ["Well-lit 2BHK/3BHK flat", "High security gated society", "Reliable power backup for WFH days"],
      whyCompatible: ["Mature working lifestyle", "Equal chore distribution believer", "Prompt rent settlement"]
    },
    {
      id: "roommate-23",
      name: "Aisha Mehta",
      age: 23,
      role: "Student",
      institution: "LL.M in Trade Law at GNLU",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      budget: "₹12,500 – ₹16,500",
      budgetValue: 14500,
      preferredLocations: ["Koba", "Bhaijipura", "Kudasan"],
      moveInDate: "Immediate",
      verified: true,
      compatibility: 92,
      compatibilityBreakdown: { lifestyle: 94, budget: 92, location: 98, moveInDate: 88 },
      lifestyle: { schedule: "6 AM early wake", workStyle: "Moot Court & Law Research", socialLevel: "Quiet", cleanliness: "Impeccable order", smoking: "Strict Non-Smoker", pets: "No pets", food: "Vegetarian", cooking: "Simple healthy food" },
      about: "Law postgraduate preparing for international moot court and arbitration papers. Reads extensively, values punctuality and quiet evenings.",
      lookingFor: ["Peaceful residential area near GNLU / Gandhinagar", "No loud sound systems", "Secure neighborhood"],
      whyCompatible: ["Utmost respect for personal boundaries", "Serious academic commitment", "Zero friction lifestyle"]
    },
    {
      id: "roommate-24",
      name: "Kavya Desai",
      age: 22,
      role: "Working Professional",
      institution: "Risk Analyst at Deloitte (Ahmedabad)",
      avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
      budget: "₹15,000 – ₹19,500",
      budgetValue: 17000,
      preferredLocations: ["Sindhu Bhavan Road", "Thaltej", "Science City Road"],
      moveInDate: "Within 15 Days",
      verified: true,
      compatibility: 95,
      compatibilityBreakdown: { lifestyle: 96, budget: 94, location: 93, moveInDate: 92 },
      lifestyle: { schedule: "11:30 PM - 7 AM", workStyle: "Risk advisory", socialLevel: "Friendly", cleanliness: "Daily cleaning routine", smoking: "Non-Smoker", pets: "No pets", food: "Vegetarian", cooking: "South Indian cooking" },
      about: "Risk advisory professional. Enjoys weekend tennis, cooking South Indian delicacies, and maintaining a clutter-free living room.",
      lookingFor: ["Modern apartment on SBR/Science City", "Spacious modular kitchen", "Cooperative and pleasant flatmate"],
      whyCompatible: ["Excellent financial discipline", "Friendly and respectful coexistence", "Common vegetarian culinary habits"]
    },
    {
      id: "roommate-25",
      name: "Ishita Shah",
      age: 20,
      role: "Student",
      institution: "B.Design at NIFT Gandhinagar",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      budget: "₹11,000 – ₹14,500",
      budgetValue: 12500,
      preferredLocations: ["Infocity", "Kudasan", "Randesan"],
      moveInDate: "Immediate",
      verified: true,
      compatibility: 91,
      compatibilityBreakdown: { lifestyle: 92, budget: 88, location: 92, moveInDate: 93 },
      lifestyle: { schedule: "12 AM - 8 AM", workStyle: "Fashion Editorial Styling", socialLevel: "Warm & Creative", cleanliness: "Neat & organized space", smoking: "Non-Smoker", pets: "Loves cats", food: "Vegetarian", cooking: "Quick bowls & tea" },
      about: "Design undergrad working on photography and editorial styling. Loves cats, film photography, and designing vibrant cozy living spaces.",
      lookingFor: ["Close to NIFT Gandhinagar campus", "Good natural morning light", "Safe gated community"],
      whyCompatible: ["Creative and warm housemate", "Communicative on house upkeep", "Responsible peer"]
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
      paidBy: "You (Resident)",
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
      paidBy: "You (Resident)",
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
        tenant: "Aman Singh",
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
      plainEnglish: "Pay ₹18,000 by the 5th of every month directly through Nestera UPI or net banking. Zero penalty if you notify before the 3rd. Nestera provides instant GST rent receipts for your HRA tax exemption."
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
      plainEnglish: "Give a 2-month notice through the Nestera app whenever you want to move out. If you find a verified replacement tenant through Nestera Roommate Match, the notice fee is waived!"
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
window.NESTERA_DATA = window.NESTORA_DATA = NESTORA_DATA;
