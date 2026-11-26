const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { calculateHaversineDistance } = require('../utils/distance');

const router = express.Router();

// GET /api/chargers - Browse and search charging points
router.get('/', async (req, res) => {
  try {
    const {
      search,
      city,
      category,
      equipmentType,
      connectorType,
      isDedicatedEvse,
      maxPrice,
      minRating,
      maxDistance,
      userLat = 13.0418, // Default Chennai center (T. Nagar)
      userLng = 80.2341,
      includePending
    } = req.query;

    const whereClause = {
      isActive: true
    };

    // By default, public search only shows APPROVED locations
    if (includePending !== 'true') {
      whereClause.verificationStatus = 'APPROVED';
    }

    if (city) {
      whereClause.city = { contains: city, mode: 'insensitive' };
    }

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { landmark: { contains: search, mode: 'insensitive' } }
      ];
    }

    let locations = await prisma.chargingLocation.findMany({
      where: whereClause,
      include: {
        host: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                phone: true
              }
            }
          }
        },
        equipments: true,
        slots: true,
        reviews: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            rider: {
              select: { name: true, avatar: true }
            }
          }
        }
      },
      orderBy: { rating: 'desc' }
    });

    const parsedUserLat = parseFloat(userLat);
    const parsedUserLng = parseFloat(userLng);

    // Compute Haversine distance and filter equipment if requested
    let results = locations.map(loc => {
      const distance = calculateHaversineDistance(
        parsedUserLat,
        parsedUserLng,
        loc.latitude,
        loc.longitude
      );

      // Extract lowest price from slots
      let minSlotPrice = 30.0;
      if (loc.slots && loc.slots.length > 0) {
        minSlotPrice = Math.min(...loc.slots.map(s => s.pricePerHour));
      }

      // Safe JSON parse images & amenities
      let parsedImages = [];
      try {
        parsedImages = JSON.parse(loc.images);
      } catch (e) {
        parsedImages = [loc.images];
      }

      let parsedAmenities = [];
      try {
        parsedAmenities = loc.amenities ? JSON.parse(loc.amenities) : [];
      } catch (e) {
        parsedAmenities = [];
      }

      // Format equipment
      const formattedEquipments = loc.equipments.map(eq => {
        let vehicles = [];
        let safety = [];
        try {
          vehicles = JSON.parse(eq.supportedVehicles);
        } catch (e) {
          vehicles = [eq.supportedVehicles];
        }
        try {
          safety = eq.safetyFeatures ? JSON.parse(eq.safetyFeatures) : [];
        } catch (e) {
          safety = [];
        }

        return {
          ...eq,
          supportedVehicles: vehicles,
          safetyFeatures: safety
        };
      });

      return {
        ...loc,
        images: parsedImages,
        amenities: parsedAmenities,
        equipments: formattedEquipments,
        distanceKm: distance,
        pricePerHour: minSlotPrice
      };
    });

    // Apply equipment and connector filters
    if (equipmentType && equipmentType !== 'ALL') {
      results = results.filter(loc =>
        loc.equipments.some(eq => eq.equipmentType === equipmentType)
      );
    }

    if (connectorType && connectorType !== 'ALL') {
      results = results.filter(loc =>
        loc.equipments.some(eq => eq.connectorType === connectorType)
      );
    }

    if (isDedicatedEvse === 'true') {
      results = results.filter(loc =>
        loc.equipments.some(eq => eq.isDedicatedEvse === true)
      );
    }

    if (maxPrice) {
      const p = parseFloat(maxPrice);
      results = results.filter(loc => loc.pricePerHour <= p);
    }

    if (minRating) {
      const r = parseFloat(minRating);
      results = results.filter(loc => loc.rating >= r);
    }

    if (maxDistance && !isNaN(parsedUserLat) && !isNaN(parsedUserLng)) {
      const d = parseFloat(maxDistance);
      results = results.filter(loc => loc.distanceKm !== null && loc.distanceKm <= d);
    }

    // Sort by distance if user location is valid, otherwise rating
    results.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));

    return res.json({
      success: true,
      count: results.length,
      chargers: results
    });
  } catch (error) {
    console.error('Fetch chargers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve charging points.' });
  }
});

// GET /api/chargers/host/my-listings - Listings owned by logged-in host
router.get('/host/my-listings', authenticate, authorizeRoles('HOST', 'ADMIN'), async (req, res) => {
  try {
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!hostProfile && req.user.role !== 'ADMIN') {
      return res.status(404).json({ success: false, message: 'Host profile not found.' });
    }

    const whereClause = req.user.role === 'ADMIN' && req.query.hostId
      ? { hostId: req.query.hostId }
      : { hostId: hostProfile.id };

    const listings = await prisma.chargingLocation.findMany({
      where: whereClause,
      include: {
        equipments: true,
        slots: true,
        bookings: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            hostEarnings: true
          }
        },
        reviews: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = listings.map(loc => {
      let images = [];
      try {
        images = JSON.parse(loc.images);
      } catch (e) {
        images = [loc.images];
      }

      const totalEarnings = loc.bookings
        .filter(b => b.status === 'COMPLETED' || b.status === 'CONFIRMED')
        .reduce((sum, b) => sum + b.hostEarnings, 0);

      return {
        ...loc,
        images,
        totalBookings: loc.bookings.length,
        totalEarnings
      };
    });

    return res.json({
      success: true,
      listings: formatted
    });
  } catch (error) {
    console.error('Fetch host listings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch host listings.' });
  }
});

// GET /api/chargers/recommendations - Smart charger recommendations algorithm (Section 10)
router.get('/recommendations', async (req, res) => {
  try {
    const {
      userLat = 13.0418,
      userLng = 80.2341,
      vehicleModel = 'Ather 450X',
      maxBudget
    } = req.query;

    const parsedUserLat = parseFloat(userLat);
    const parsedUserLng = parseFloat(userLng);
    const vehicleLower = (vehicleModel || '').toLowerCase();

    const locations = await prisma.chargingLocation.findMany({
      where: {
        isActive: true,
        verificationStatus: 'APPROVED'
      },
      include: {
        host: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        },
        equipments: true,
        slots: true
      }
    });

    const scored = locations.map(loc => {
      const distance = calculateHaversineDistance(
        parsedUserLat,
        parsedUserLng,
        loc.latitude,
        loc.longitude
      );

      const price = loc.slots?.[0]?.pricePerHour || 35;
      const primaryEq = loc.equipments?.[0] || {};

      let supported = [];
      try {
        supported = JSON.parse(primaryEq.supportedVehicles || '[]');
      } catch (e) {
        supported = [primaryEq.supportedVehicles];
      }

      // 1. Proximity score (up to 40 pts): 40 for <= 1km, 0 for >= 20km
      const proxScore = Math.max(0, Math.min(40, (1 - (distance / 20)) * 40));

      // 2. Price score (up to 25 pts): 25 for <= 25/hr, 0 for >= 60/hr
      const priceScore = Math.max(0, Math.min(25, (1 - ((price - 25) / 35)) * 25));

      // 3. Compatibility score (up to 25 pts)
      const isDirectMatch = supported.some(v => v.toLowerCase().includes(vehicleLower) || vehicleLower.includes(v.toLowerCase()));
      const compatScore = isDirectMatch ? 25 : 18; // Default 18 for universal 16A

      // 4. Rating & Earth Safety score (up to 10 pts)
      const safetyScore = (loc.rating / 5) * 8 + (primaryEq.hasEarthProtection ? 2 : 0);

      const totalScore = Math.round(proxScore + priceScore + compatScore + safetyScore);

      let matchReason = `${totalScore}% Match`;
      if (distance <= 3) {
        matchReason = `Closest verified plug (${distance} km) • ${primaryEq.powerKw || 3.3} kW`;
      } else if (price <= 32) {
        matchReason = `Best economy rate (₹${price}/hr) • Earth verified`;
      } else if (loc.category === 'CAFE') {
        matchReason = `Cafe & Wi-Fi lounge • Ideal for work while charging`;
      } else {
        matchReason = `Top rated host (${loc.rating}★) • Grounding certified`;
      }

      let parsedImages = [];
      try {
        parsedImages = JSON.parse(loc.images);
      } catch (e) {
        parsedImages = [loc.images];
      }

      return {
        ...loc,
        images: parsedImages,
        distanceKm: distance,
        pricePerHour: price,
        primaryEquipment: primaryEq,
        matchScore: totalScore,
        matchReason
      };
    });

    // Sort by match score descending and take top 4
    scored.sort((a, b) => b.matchScore - a.matchScore);
    const topRecommendations = scored.slice(0, 4);

    return res.json({
      success: true,
      recommendations: topRecommendations
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return res.status(500).json({ success: false, message: 'Failed to compute recommendations.' });
  }
});

// GET /api/chargers/public/stats - Dynamic platform stats & community reviews
router.get('/public/stats', async (req, res) => {
  try {
    const [
      totalPlugs,
      totalHosts,
      totalRiders,
      totalBookings,
      avgPriceAgg,
      avgRatingAgg,
      recentApprovedReviews
    ] = await Promise.all([
      prisma.chargingLocation.count({ where: { verificationStatus: 'APPROVED', isActive: true } }),
      prisma.user.count({ where: { role: 'HOST' } }),
      prisma.user.count({ where: { role: 'RIDER' } }),
      prisma.booking.count(),
      prisma.availabilitySlot.aggregate({
        _avg: { pricePerHour: true }
      }),
      prisma.chargingLocation.aggregate({
        _avg: { rating: true },
        where: { verificationStatus: 'APPROVED', isActive: true }
      }),
      prisma.review.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          rider: { select: { id: true, name: true, avatar: true, vehicleModel: true } },
          location: { select: { id: true, title: true, address: true, city: true, category: true } }
        }
      })
    ]);

    const avgPrice = Math.round(avgPriceAgg._avg.pricePerHour || 35);
    const avgRating = Math.round(((avgRatingAgg._avg.rating || 4.9)) * 10) / 10;
    const carbonSavedKg = Math.round(totalBookings * 4.2 * 10) / 10;
    const cleanKmPowered = Math.round(totalBookings * 35);

    return res.json({
      success: true,
      stats: {
        totalPlugs,
        totalHosts,
        totalRiders,
        totalBookings,
        avgPricePerHour: avgPrice,
        avgRating,
        carbonSavedKg,
        cleanKmPowered,
        reviews: recentApprovedReviews
      }
    });
  } catch (error) {
    console.error('Public stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve stats.' });
  }
});

// GET /api/chargers/:id - Full details for a single charger
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const location = await prisma.chargingLocation.findUnique({
      where: { id },
      include: {
        host: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                phone: true,
                createdAt: true
              }
            }
          }
        },
        equipments: true,
        slots: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            rider: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!location) {
      return res.status(404).json({ success: false, message: 'Charging location not found.' });
    }

    let parsedImages = [];
    try {
      parsedImages = JSON.parse(location.images);
    } catch (e) {
      parsedImages = [location.images];
    }

    let parsedAmenities = [];
    try {
      parsedAmenities = location.amenities ? JSON.parse(location.amenities) : [];
    } catch (e) {
      parsedAmenities = [];
    }

    const formattedEquipments = location.equipments.map(eq => {
      let vehicles = [];
      let safety = [];
      try {
        vehicles = JSON.parse(eq.supportedVehicles);
      } catch (e) {
        vehicles = [eq.supportedVehicles];
      }
      try {
        safety = eq.safetyFeatures ? JSON.parse(eq.safetyFeatures) : [];
      } catch (e) {
        safety = [];
      }

      return {
        ...eq,
        supportedVehicles: vehicles,
        safetyFeatures: safety
      };
    });

    const pricePerHour = location.slots.length > 0
      ? Math.min(...location.slots.map(s => s.pricePerHour))
      : 30.0;

    return res.json({
      success: true,
      charger: {
        ...location,
        images: parsedImages,
        amenities: parsedAmenities,
        equipments: formattedEquipments,
        pricePerHour
      }
    });
  } catch (error) {
    console.error('Fetch charger details error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve charger details.' });
  }
});

// POST /api/chargers - Add new charging location (Host only)
router.post('/', authenticate, authorizeRoles('HOST', 'ADMIN'), async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      landmark,
      city = 'Chennai',
      state = 'Tamil Nadu',
      pincode = '600001',
      latitude,
      longitude,
      category = 'RESIDENTIAL',
      images = [],
      amenities = [],
      pricePerHour = 30.0,
      equipmentName = 'Primary 16A EV Socket',
      equipmentType = 'SOCKET_16A',
      connectorType = 'PIN_3_16A',
      powerKw = 3.3,
      voltageV = 230,
      currentA = 16,
      isDedicatedEvse = false,
      hasEarthProtection = true,
      supportedVehicles = ['Ather', 'Ola', 'TVS', 'Bajaj', 'Generic 16A 3-Pin'],
      safetyFeatures = ['Dedicated MCB', 'Earth Pit Verified', 'Weatherproof Box'],
      availableFrom = '06:00',
      availableTo = '23:00'
    } = req.body;

    if (!title || !address || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Title, address, latitude, and longitude are required.'
      });
    }

    let hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: req.user.id }
    });

    // Create host profile if it didn't exist for some reason
    if (!hostProfile) {
      hostProfile = await prisma.hostProfile.create({
        data: {
          userId: req.user.id,
          businessName: `${req.user.name}'s EV Hub`,
          address,
          city,
          state,
          pincode,
          payoutUpiId: `${req.user.email.split('@')[0]}@upi`
        }
      });
    }

    const defaultImages = images && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80'
    ];

    const newLocation = await prisma.chargingLocation.create({
      data: {
        hostId: hostProfile.id,
        title: title.trim(),
        description: description || 'Convenient peer-to-peer EV charging point.',
        address: address.trim(),
        landmark: landmark || null,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        category,
        images: JSON.stringify(defaultImages),
        amenities: JSON.stringify(amenities),
        isVerified: false, // Must be verified by Admin
        verificationStatus: 'PENDING',
        verificationNotes: 'Submitted and awaiting safety and electrical verification by Admin.',
        equipments: {
          create: [
            {
              name: equipmentName,
              equipmentType,
              connectorType,
              powerKw: parseFloat(powerKw) || 3.3,
              voltageV: parseInt(voltageV) || 230,
              currentA: parseInt(currentA) || 16,
              isDedicatedEvse: Boolean(isDedicatedEvse),
              hasEarthProtection: Boolean(hasEarthProtection),
              supportedVehicles: JSON.stringify(supportedVehicles),
              safetyFeatures: JSON.stringify(safetyFeatures)
            }
          ]
        },
        slots: {
          create: [
            {
              dayOfWeek: 'ALL',
              startTime: availableFrom,
              endTime: availableTo,
              pricePerHour: parseFloat(pricePerHour) || 30.0,
              isAvailable: true
            }
          ]
        }
      },
      include: {
        equipments: true,
        slots: true
      }
    });

    // Create system notification for host
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Listing Submitted for Verification',
        message: `Your listing "${title}" has been submitted and is currently in the verification queue. Admin will inspect safety compliance shortly.`,
        type: 'SYSTEM',
        link: '/host/listings'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Charging point listed successfully! Status is PENDING verification.',
      charger: newLocation
    });
  } catch (error) {
    console.error('Create charger error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create charging location.' });
  }
});

// PUT /api/chargers/:id - Update charging location
router.put('/:id', authenticate, authorizeRoles('HOST', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      address,
      landmark,
      city,
      pincode,
      category,
      pricePerHour,
      isActive
    } = req.body;

    const existing = await prisma.chargingLocation.findUnique({
      where: { id },
      include: { host: true }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Charging location not found.' });
    }

    if (req.user.role !== 'ADMIN' && existing.host.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this listing.' });
    }

    const updated = await prisma.chargingLocation.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(address && { address }),
        ...(landmark !== undefined && { landmark }),
        ...(city && { city }),
        ...(pincode && { pincode }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      }
    });

    if (pricePerHour !== undefined) {
      await prisma.availabilitySlot.updateMany({
        where: { locationId: id },
        data: { pricePerHour: parseFloat(pricePerHour) }
      });
    }

    return res.json({
      success: true,
      message: 'Charging location updated successfully.',
      charger: updated
    });
  } catch (error) {
    console.error('Update charger error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update charging location.' });
  }
});

// DELETE /api/chargers/:id
router.delete('/:id', authenticate, authorizeRoles('HOST', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.chargingLocation.findUnique({
      where: { id },
      include: { host: true }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Charging location not found.' });
    }

    if (req.user.role !== 'ADMIN' && existing.host.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this listing.' });
    }

    await prisma.chargingLocation.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Charging location deleted successfully.'
    });
  } catch (error) {
    console.error('Delete charger error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete charging location.' });
  }
});

module.exports = router;

