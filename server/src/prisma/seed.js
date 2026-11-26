const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ChargeNear database seed...');

  // Clean existing data
  await prisma.complaint.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.chargingEquipment.deleteMany();
  await prisma.chargingLocation.deleteMany();
  await prisma.hostProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('DemoPass@123', 10);
  const adminHashedPassword = await bcrypt.hash('AdminPass@123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'ChargeNear Platform Admin',
      email: 'admin@chargenear.com',
      password: adminHashedPassword,
      phone: '+91 98400 11223',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isVerified: true
    }
  });

  // 2. Create 5 Charging Hosts
  const hostUsersData = [
    {
      name: 'Karthik Subramanian',
      email: 'host@chargenear.com', // Default demo host
      phone: '+91 98410 44556',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      bio: 'Green tech enthusiast and EV advocate. I have a solar-backed 16A smart port and Type 2 wallbox right outside my residence in T. Nagar.',
      businessName: 'Karthik Solar EV Hub',
      address: '24 Venkatanarayana Road, T. Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600017',
      isVerified: true,
      payoutUpiId: 'karthik.subramanian@okhdfcbank'
    },
    {
      name: 'Deepa Natarajan',
      email: 'deepa.host@chargenear.com',
      phone: '+91 98412 88990',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      bio: 'Owner of The Daily Grind Artisan Cafe in Adyar. Stop by for fresh filter coffee and fast Wi-Fi while your EV charges up!',
      businessName: 'Daily Grind Cafe & Charge',
      address: '14/2 Gandhi Nagar 3rd Main Rd, Adyar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600020',
      isVerified: true,
      payoutUpiId: 'dailygrind@icici'
    },
    {
      name: 'Suresh Kumar',
      email: 'suresh.host@chargenear.com',
      phone: '+91 97910 22334',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      bio: 'Retail store proprietor in Velachery with high-capacity surge-protected 16A points and CCTV surveillance.',
      businessName: 'Suresh Super Mart & Charge',
      address: '88 Velachery Bypass Road, Near Phoenix Marketcity',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600042',
      isVerified: true,
      payoutUpiId: 'sureshmart@upi'
    },
    {
      name: 'Dr. Meera Ramachandran',
      email: 'meera.host@chargenear.com',
      phone: '+91 94440 66778',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      bio: 'Eco-conscious clinic with covered porch charging for two-wheelers in Anna Nagar west.',
      businessName: 'GreenCare Clinic Porch',
      address: '12 2nd Avenue, Anna Nagar West',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
      isVerified: true,
      payoutUpiId: 'meera.greencare@axl'
    },
    {
      name: 'Ramesh Venkatesh',
      email: 'ramesh.host@chargenear.com',
      phone: '+91 98840 99001',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      bio: 'Tech entrepreneur on OMR IT Corridor. Dedicated shaded charging slots inside business tech park campus.',
      businessName: 'CyberNova Tech Park Charging Bay',
      address: 'Plot 45 Rajiv Gandhi Salai (OMR), Kandanchavadi',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600096',
      isVerified: false, // For testing pending verification queue
      payoutUpiId: 'ramesh.cybernova@sbi'
    }
  ];

  const createdHosts = [];
  for (const h of hostUsersData) {
    const user = await prisma.user.create({
      data: {
        name: h.name,
        email: h.email,
        password: hashedPassword,
        phone: h.phone,
        role: 'HOST',
        avatar: h.avatar,
        isVerified: true,
        hostProfile: {
          create: {
            businessName: h.businessName,
            bio: h.bio,
            address: h.address,
            city: h.city,
            state: h.state,
            pincode: h.pincode,
            idProofType: 'Aadhaar Verified',
            isVerified: h.isVerified,
            payoutUpiId: h.payoutUpiId,
            rating: 4.9,
            totalReviews: 12
          }
        }
      },
      include: { hostProfile: true }
    });
    createdHosts.push(user);
  }

  // 3. Create 10 EV Riders
  const ridersData = [
    { name: 'Arun Prakash', email: 'rider@chargenear.com', vehicle: 'Ather 450X Gen 3', number: 'TN-01-BK-8842', battery: 3.7 },
    { name: 'Pooja Sundaram', email: 'pooja.rider@chargenear.com', vehicle: 'Ola S1 Pro Gen 2', number: 'TN-09-EV-1004', battery: 4.0 },
    { name: 'Vignesh Balaji', email: 'vignesh.rider@chargenear.com', vehicle: 'TVS iQube S', number: 'TN-07-CD-3490', battery: 3.4 },
    { name: 'Ananya Raghavan', email: 'ananya.rider@chargenear.com', vehicle: 'Bajaj Chetak Premium', number: 'TN-02-EA-9912', battery: 3.2 },
    { name: 'Rahul Krishnan', email: 'rahul.rider@chargenear.com', vehicle: 'Hero Vida V1 Pro', number: 'TN-10-XY-4421', battery: 3.9 },
    { name: 'Kavitha Jayaraman', email: 'kavitha.rider@chargenear.com', vehicle: 'Ola S1 Air', number: 'TN-14-GH-6023', battery: 3.0 },
    { name: 'Dinesh Selvan', email: 'dinesh.rider@chargenear.com', vehicle: 'Ather Rizta Z', number: 'TN-05-MN-2287', battery: 3.7 },
    { name: 'Harish Murali', email: 'harish.rider@chargenear.com', vehicle: 'Simple One', number: 'TN-22-PQ-7711', battery: 5.0 },
    { name: 'Swetha Venkat', email: 'swetha.rider@chargenear.com', vehicle: 'TVS iQube ST', number: 'TN-06-KL-1144', battery: 4.5 },
    { name: 'Manoj Kumar', email: 'manoj.rider@chargenear.com', vehicle: 'Ultraviolette F77', number: 'TN-03-ZZ-9090', battery: 10.3 }
  ];

  const createdRiders = [];
  for (const r of ridersData) {
    const rider = await prisma.user.create({
      data: {
        name: r.name,
        email: r.email,
        password: hashedPassword,
        phone: '+91 98400 ' + Math.floor(10000 + Math.random() * 90000),
        role: 'RIDER',
        vehicleModel: r.vehicle,
        vehicleNumber: r.number,
        batteryCapacityKwh: r.battery,
        avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 5000000)}?auto=format&fit=crop&w=200&q=80`,
        isVerified: true
      }
    });
    createdRiders.push(rider);
  }

  // 4. Create 10 Charging Locations in Chennai
  const locationsData = [
    {
      hostIdx: 0,
      title: 'T. Nagar Solar Smart EV Port',
      description: 'Solar-assisted 16A earth-tested socket with weatherproof casing, direct ground earthing rod, and safe CCTV coverage. Ideal for Ather, Ola, TVS portable EV chargers.',
      address: '24 Venkatanarayana Road, T. Nagar',
      landmark: 'Near Panagal Park & Pondy Bazaar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600017',
      latitude: 13.0418,
      longitude: 80.2341,
      category: 'RESIDENTIAL',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558441719-8b489c63f70d?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['Solar Powered', 'Covered Parking', 'CCTV 24/7', 'Restroom Access', 'Drinking Water']),
      isVerified: true,
      verificationStatus: 'APPROVED',
      rating: 4.95,
      totalReviews: 24,
      equipments: [
        {
          name: 'Port A: 16A Heavy-Duty Socket (Tested Earth)',
          equipmentType: 'SOCKET_16A',
          connectorType: 'PIN_3_16A',
          powerKw: 3.3,
          voltageV: 230,
          currentA: 16,
          isDedicatedEvse: false,
          hasEarthProtection: true,
          supportedVehicles: JSON.stringify(['Ather 450X', 'Ola S1', 'TVS iQube', 'Bajaj Chetak', 'Generic 16A 3-Pin']),
          safetyFeatures: JSON.stringify(['Dedicated 30mA RCCB', '3-Ohm Copper Earth Pit', 'MCB C-Curve', 'IP65 Weather Cover'])
        },
        {
          name: 'Port B: Level 2 AC Wallbox (Type 2)',
          equipmentType: 'WALLBOX_TYPE2',
          connectorType: 'TYPE_2',
          powerKw: 7.4,
          voltageV: 230,
          currentA: 32,
          isDedicatedEvse: true,
          hasEarthProtection: true,
          supportedVehicles: JSON.stringify(['Type 2 Two-Wheelers & EVs', 'Ultraviolette F77', 'River Indie']),
          safetyFeatures: JSON.stringify(['Built-in RCD Type B', 'Overvoltage Protection', 'Auto Cut-off'])
        }
      ],
      pricePerHour: 35.0
    },
    {
      hostIdx: 1,
      title: 'The Daily Grind Cafe & EV Lounge',
      description: 'Charming specialty cafe in Adyar. Charge your two-wheeler while enjoying pour-over coffees, artisan sandwiches, and air-conditioned high-speed Wi-Fi workstation.',
      address: '14/2 Gandhi Nagar 3rd Main Rd, Adyar',
      landmark: 'Near Adyar Cancer Institute',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600020',
      latitude: 13.0067,
      longitude: 80.2573,
      category: 'CAFE',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['Cafe & Food', 'Free High-Speed Wi-Fi', 'AC Seating', 'Restroom', 'Pet Friendly']),
      isVerified: true,
      verificationStatus: 'APPROVED',
      rating: 4.88,
      totalReviews: 31,
      equipments: [
        {
          name: 'Cafe Front 16A EV Outlet 1',
          equipmentType: 'SOCKET_16A',
          connectorType: 'PIN_3_16A',
          powerKw: 3.3,
          voltageV: 230,
          currentA: 16,
          isDedicatedEvse: false,
          hasEarthProtection: true,
          supportedVehicles: JSON.stringify(['Ather 450X', 'Ola S1 Pro', 'TVS iQube', 'Bajaj Chetak', 'All 16A EVs']),
          safetyFeatures: JSON.stringify(['MCB Protected', 'Certified Earth Resistance < 2 Ohm', 'Rain Hood'])
        }
      ],
      pricePerHour: 40.0
    },
    {
      hostIdx: 2,
      title: 'Velachery Hypercharge Station at Suresh Mart',
      description: 'Convenient charging spot at popular retail store near Phoenix Marketcity. Wide driveway, security guard on duty, snacks and beverages readily available.',
      address: '88 Velachery Bypass Road',
      landmark: 'Opposite Shell Petrol Bunk',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600042',
      latitude: 12.9784,
      longitude: 80.2185,
      category: 'SHOP',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['Grocery Store', 'Security Guard', 'Tire Pressure Pump', 'CCTV', 'Covered Bay']),
      isVerified: true,
      verificationStatus: 'APPROVED',
      rating: 4.79,
      totalReviews: 19,
      equipments: [
        {
          name: 'Commercial Grade 16A High-Duty Port',
          equipmentType: 'SOCKET_16A',
          connectorType: 'PIN_3_16A',
          powerKw: 3.3,
          voltageV: 230,
          currentA: 16,
          isDedicatedEvse: false,
          hasEarthProtection: true,
          supportedVehicles: JSON.stringify(['Ather', 'Ola', 'TVS', 'Vida', 'Generic 16A 3-Pin']),
          safetyFeatures: JSON.stringify(['Schneider Electric RCBO', 'Industrial Plug Socket', 'Surge Suppressor'])
        }
      ],
      pricePerHour: 30.0
    },
    {
      hostIdx: 3,
      title: 'Anna Nagar GreenCare Porch EV Station',
      description: 'Peaceful residential and clinic driveway in Anna Nagar West. Shaded canopy, cool water dispenser, and verified grounding for safe battery charging.',
      address: '12 2nd Avenue, Anna Nagar West',
      landmark: 'Near Roundtana & Anna Nagar Tower Park',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
      latitude: 13.0850,
      longitude: 80.2101,
      category: 'RESIDENTIAL',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['Shaded Porch', 'Water Dispenser', 'Quiet Neighborhood', 'Lighting']),
      isVerified: true,
      verificationStatus: 'APPROVED',
      rating: 4.92,
      totalReviews: 15,
      equipments: [
        {
          name: 'Porch Heavy-Duty 16A Port',
          equipmentType: 'SOCKET_16A',
          connectorType: 'PIN_3_16A',
          powerKw: 3.3,
          voltageV: 230,
          currentA: 16,
          isDedicatedEvse: false,
          hasEarthProtection: true,
          supportedVehicles: JSON.stringify(['Ola S1', 'Ather 450', 'Bajaj Chetak', 'TVS iQube']),
          safetyFeatures: JSON.stringify(['Legrand Earth Leakage Circuit Breaker', 'Heavy 4 sq mm wiring'])
        }
      ],
      pricePerHour: 32.0
    },
    {
      hostIdx: 4,
      title: 'OMR CyberNova Tech Park Charging Bay',
      description: 'Premium tech park campus station on the IT corridor. Dual 7.4kW Type 2 and high-output 16A sockets with 24/7 security boom barrier.',
      address: 'Plot 45 Rajiv Gandhi Salai (OMR), Kandanchavadi',
      landmark: 'Next to RMZ Millenia Business Park',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600096',
      latitude: 12.9644,
      longitude: 80.2443,
      category: 'OFFICE',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['24/7 Access', 'Security Guard', 'Food Court Nearby', 'Covered Basement', 'Fire Extinguisher']),
      isVerified: false,
      verificationStatus: 'PENDING', // Great for demonstrating Admin Verification Workflow
      rating: 4.70,
      totalReviews: 8,
      equipments: [
        {
          name: 'TechPark Smart Level 2 Wallbox',
          equipmentType: 'WALLBOX_TYPE2',
          connectorType: 'TYPE_2',
          powerKw: 7.4,
          voltageV: 230,
          currentA: 32,
          isDedicatedEvse: true,
          hasEarthProtection: true,
          supportedVehicles: JSON.stringify(['Type 2 Compatible EVs', 'Ultraviolette', 'Electric Cars & Bikes']),
          safetyFeatures: JSON.stringify(['Smart Metering', 'Automated Emergency Trip', 'Surge Protection'])
        }
      ],
      pricePerHour: 45.0
    },
    {
      hostIdx: 0,
      title: 'Besant Nagar Beachside EV Point',
      description: 'Steps away from Elliot Beach! Drop your EV for a top-up while taking a relaxing stroll on the promenade or savoring beachside snacks.',
      address: '4th Main Road, Besant Nagar',
      landmark: '200m from Murugan Idli Shop & Beach',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600090',
      latitude: 13.0001,
      longitude: 80.2668,
      category: 'RESIDENTIAL',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['Beach Access', 'Restaurants Nearby', 'CCTV', 'Outdoor Seating']),
      isVerified: true,
      verificationStatus: 'APPROVED',
      rating: 4.96,
      totalReviews: 28,
      equipments: [
        {
          name: 'Beach Point 16A Earth Socket',
          equipmentType: 'SOCKET_16A',
          connectorType: 'PIN_3_16A',
          powerKw: 3.3,
          voltageV: 230,
          currentA: 16,
          isDedicatedEvse: false,
          hasEarthProtection: true,
          supportedVehicles: JSON.stringify(['Ather', 'Ola', 'TVS', 'Bajaj', 'All Portable Chargers']),
          safetyFeatures: JSON.stringify(['Anti-corrosion Marine Coating', 'RCCB 30mA', 'Double Earthing'])
        }
      ],
      pricePerHour: 35.0
    },
    {
      hostIdx: 1,
      title: 'Alwarpet Artisan EV Spot',
      description: 'Centrally located boutique charging spot in upscale Alwarpet. Quiet residential lane with tree canopy and clean charging dock.',
      address: '18 TT Krishnamachari Road, Alwarpet',
      landmark: 'Near Music Academy & Eldams Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600018',
      latitude: 13.0336,
      longitude: 80.2505,
      category: 'RESIDENTIAL',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['Covered Driveway', 'Tree Shade', 'Wi-Fi', 'Filtered Water']),
      isVerified: true,
      verificationStatus: 'APPROVED',
      rating: 4.85,
      totalReviews: 14,
      equipments: [
        {
          name: 'Alwarpet 16A Dedicated Socket',
          equipmentType: 'SOCKET_16A',
          connectorType: 'PIN_3_16A',
          powerKw: 3.3,
          voltageV: 230,
          currentA: 16,
          isDedicatedEvse: false,
          hasEarthProtection: true,
          supportedVehicles: JSON.stringify(['Ather 450X', 'Ola S1 Pro', 'Hero Vida', 'Generic 16A 3-Pin']),
          safetyFeatures: JSON.stringify(['Dedicated Circuit', 'Short Circuit Protection', 'Copper Earth Rod'])
        }
      ],
      pricePerHour: 38.0
    },
    {
      hostIdx: 2,
      title: 'Nungambakkam High Road EV Hub',
      description: 'Right on Nungambakkam High Road. Commercial courtyard with space for 3 two-wheelers. Safe, well-lit, and right next to cafes and bookstores.',
      address: '74 Nungambakkam High Road',
      landmark: 'Near Taj Coromandel',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600034',
      latitude: 13.0604,
      longitude: 80.2407,
      category: 'SHOP',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['24/7 Security', 'Coffee Kiosk', 'Restrooms', 'CCTV']),
      isVerified: true,
      verificationStatus: 'APPROVED',
      rating: 4.81,
      totalReviews: 22,
      equipments: [
        {
          name: 'Nungambakkam Dual 16A Station',
          equipmentType: 'SOCKET_16A',
          connectorType: 'PIN_3_16A',
          powerKw: 3.3,
          voltageV: 230,
          currentA: 16,
          isDedicatedEvse: false,
          hasEarthProtection: true,
          supportedVehicles: JSON.stringify(['All 2-Wheeler EVs with 16A Plug']),
          safetyFeatures: JSON.stringify(['Overload Cutoff', 'Earthing Resistance Meter on Display'])
        }
      ],
      pricePerHour: 35.0
    },
    {
      hostIdx: 3,
      title: 'Guindy Industrial Estate Quick Charge',
      description: 'Strategically located near Guindy Metro & Kathipara Junction. Ideal for office commuters entering or leaving South Chennai.',
      address: 'F-12 SIDCO Industrial Estate, Guindy',
      landmark: 'Near Guindy Railway Station & Metro',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600032',
      latitude: 13.0067,
      longitude: 80.2025,
      category: 'PARKING',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['Metro Proximity', 'Covered Parking', 'Security Desk', 'Tire Pressure']),
      isVerified: true,
      verificationStatus: 'APPROVED',
      rating: 4.75,
      totalReviews: 17,
      equipments: [
        {
          name: 'Guindy Station 1: 16A Heavy Duty',
          equipmentType: 'SOCKET_16A',
          connectorType: 'PIN_3_16A',
          powerKw: 3.3,
          voltageV: 230,
          currentA: 16,
          isDedicatedEvse: false,
          hasEarthProtection: true,
          supportedVehicles: JSON.stringify(['Ather', 'Ola', 'TVS', 'Bajaj', 'Vida']),
          safetyFeatures: JSON.stringify(['Industrial Enclosure', 'Fire Bucket & Extinguisher'])
        }
      ],
      pricePerHour: 30.0
    },
    {
      hostIdx: 4,
      title: 'Porur Junction Community EV Point',
      description: 'Convenient charging point for West Chennai riders heading towards Poonamallee or Sriperumbudur. Gated residential community with easy guest parking.',
      address: '25 Mount Poonamallee High Road, Porur',
      landmark: 'Near Porur Toll Plaza & Ramachandra Hospital',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600116',
      latitude: 13.0382,
      longitude: 80.1565,
      category: 'RESIDENTIAL',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'
      ]),
      amenities: JSON.stringify(['Gated Security', 'Spacious Bay', 'CCTV', 'Visitor Parking']),
      isVerified: true,
      verificationStatus: 'APPROVED',
      rating: 4.89,
      totalReviews: 11,
      equipments: [
        {
          name: 'Porur Gated 16A EV Socket',
          equipmentType: 'SOCKET_16A',
          connectorType: 'PIN_3_16A',
          powerKw: 3.3,
          voltageV: 230,
          currentA: 16,
          isDedicatedEvse: false,
          hasEarthProtection: true,
          supportedVehicles: JSON.stringify(['Ather 450X', 'Ola S1', 'TVS iQube', 'Hero Vida', 'Generic 16A 3-Pin']),
          safetyFeatures: JSON.stringify(['Havells Double-Pole MCB', 'Weatherproof Flip Lid'])
        }
      ],
      pricePerHour: 28.0
    }
  ];

  const createdLocations = [];
  for (const loc of locationsData) {
    const host = createdHosts[loc.hostIdx];
    const createdLoc = await prisma.chargingLocation.create({
      data: {
        hostId: host.hostProfile.id,
        title: loc.title,
        description: loc.description,
        address: loc.address,
        landmark: loc.landmark,
        city: loc.city,
        state: loc.state,
        pincode: loc.pincode,
        latitude: loc.latitude,
        longitude: loc.longitude,
        category: loc.category,
        images: loc.images,
        amenities: loc.amenities,
        isVerified: loc.isVerified,
        verificationStatus: loc.verificationStatus,
        rating: loc.rating,
        totalReviews: loc.totalReviews,
        equipments: {
          create: loc.equipments.map(eq => ({
            name: eq.name,
            equipmentType: eq.equipmentType,
            connectorType: eq.connectorType,
            powerKw: eq.powerKw,
            voltageV: eq.voltageV,
            currentA: eq.currentA,
            isDedicatedEvse: eq.isDedicatedEvse,
            hasEarthProtection: eq.hasEarthProtection,
            supportedVehicles: eq.supportedVehicles,
            safetyFeatures: eq.safetyFeatures
          }))
        },
        slots: {
          create: [
            { dayOfWeek: 'ALL', startTime: '06:00', endTime: '12:00', pricePerHour: loc.pricePerHour },
            { dayOfWeek: 'ALL', startTime: '12:00', endTime: '18:00', pricePerHour: loc.pricePerHour },
            { dayOfWeek: 'ALL', startTime: '18:00', endTime: '23:00', pricePerHour: loc.pricePerHour }
          ]
        }
      },
      include: { equipments: true, slots: true }
    });
    createdLocations.push(createdLoc);
  }

  // 5. Create Sample Bookings & Payments
  const sampleBookings = [
    {
      riderIdx: 0,
      locIdx: 0,
      date: '2026-11-05',
      start: '09:00',
      end: '11:00',
      duration: 2.0,
      rate: 35.0,
      status: 'COMPLETED',
      bookingNumber: 'CN-2026-00101',
      reviewRating: 5,
      reviewText: 'Excellent host! The socket has clean earthing with no voltage fluctuations. My Ather 450X charged from 20% to 85% smoothly.',
      hostReply: 'Thank you Arun! You are always welcome back anytime.'
    },
    {
      riderIdx: 1,
      locIdx: 1,
      date: '2026-11-05',
      start: '14:00',
      end: '16:30',
      duration: 2.5,
      rate: 40.0,
      status: 'COMPLETED',
      bookingNumber: 'CN-2026-00102',
      reviewRating: 5,
      reviewText: 'Loved the cafe experience! Had a cappuccino and did some laptop work while my Ola S1 topped up.',
      hostReply: 'So glad you enjoyed the coffee Pooja! Drive safe!'
    },
    {
      riderIdx: 2,
      locIdx: 0,
      date: '2026-11-06',
      start: '10:00',
      end: '12:00',
      duration: 2.0,
      rate: 35.0,
      status: 'CONFIRMED',
      bookingNumber: 'CN-2026-00103'
    },
    {
      riderIdx: 3,
      locIdx: 2,
      date: '2026-11-06',
      start: '16:00',
      end: '18:00',
      duration: 2.0,
      rate: 30.0,
      status: 'PENDING',
      bookingNumber: 'CN-2026-00104'
    },
    {
      riderIdx: 4,
      locIdx: 5,
      date: '2026-11-07',
      start: '17:00',
      end: '19:00',
      duration: 2.0,
      rate: 35.0,
      status: 'CONFIRMED',
      bookingNumber: 'CN-2026-00105'
    },
    {
      riderIdx: 5,
      locIdx: 3,
      date: '2026-11-04',
      start: '11:00',
      end: '13:00',
      duration: 2.0,
      rate: 32.0,
      status: 'COMPLETED',
      bookingNumber: 'CN-2026-00106',
      reviewRating: 5,
      reviewText: 'Very calm and secure spot in Anna Nagar. Host verified my portable charger before plugging in. Very professional safety focus.',
      hostReply: 'Safety first always Kavitha. Thanks for being a courteous rider!'
    }
  ];

  for (const b of sampleBookings) {
    const rider = createdRiders[b.riderIdx];
    const location = createdLocations[b.locIdx];
    const equipment = location.equipments[0];
    const subtotal = b.duration * b.rate;
    const platformFee = Math.round(subtotal * 0.05 * 100) / 100;
    const totalAmount = subtotal + platformFee;
    const hostEarnings = subtotal;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber: b.bookingNumber,
        riderId: rider.id,
        locationId: location.id,
        equipmentId: equipment.id,
        bookingDate: b.date,
        startTime: b.start,
        endTime: b.end,
        durationHours: b.duration,
        ratePerHour: b.rate,
        subtotal,
        platformFee,
        totalAmount,
        hostEarnings,
        status: b.status,
        vehicleModel: rider.vehicleModel,
        notes: 'Simulated EV booking for testing and demonstration.'
      }
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        transactionId: `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        razorpayOrderId: `order_sim_${Math.random().toString(36).substring(2, 10)}`,
        razorpayPaymentId: `pay_sim_${Math.random().toString(36).substring(2, 10)}`,
        amount: totalAmount,
        currency: 'INR',
        status: 'PAID',
        paymentMethod: 'RAZORPAY_TEST',
        isSimulated: true
      }
    });

    // If review exists, create review
    if (b.reviewRating) {
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          riderId: rider.id,
          locationId: location.id,
          rating: b.reviewRating,
          comment: b.reviewText,
          hostReply: b.hostReply
        }
      });
    }
  }

  // 6. Create sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: createdHosts[0].id,
        title: 'New Booking Request',
        message: 'Arun Prakash has booked a 2.0 hour charging slot for tomorrow.',
        type: 'BOOKING_CREATED',
        link: '/host/dashboard'
      },
      {
        userId: createdRiders[0].id,
        title: 'Booking Confirmed!',
        message: 'Your slot at T. Nagar Solar Smart EV Port has been confirmed.',
        type: 'BOOKING_CONFIRMED',
        link: '/rider/bookings'
      },
      {
        userId: createdHosts[4].id,
        title: 'Listing Under Review',
        message: 'Your charging location at OMR CyberNova is currently under admin verification.',
        type: 'SYSTEM',
        link: '/host/listings'
      }
    ]
  });

  // 7. Create a sample complaint/inquiry for Admin Dashboard
  await prisma.complaint.create({
    data: {
      userId: createdRiders[3].id,
      subject: 'Host Socket Earthing Clarification',
      description: 'Requesting confirmation whether the host in Velachery supports 3-pin earth check indicators before plugging in.',
      status: 'OPEN',
      adminNotes: 'Contacted host Suresh to confirm earth rod certificate. Verified resistance is 1.8 ohms.'
    }
  });

  console.log('✅ ChargeNear database successfully seeded!');
  console.log(`- 1 Admin: admin@chargenear.com (Password: AdminPass@123)`);
  console.log(`- Demo Host: host@chargenear.com (Password: DemoPass@123)`);
  console.log(`- Demo Rider: rider@chargenear.com (Password: DemoPass@123)`);
  console.log(`- 10 Charging Locations in Chennai`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

