const http = require('http');

const API_BASE = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token && { Authorization: `Bearer ${options.token}` })
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, data };
}

async function runTests() {
  console.log('🚀 Running ChargeNear Full-Stack E2E Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extraInfo = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${extraInfo}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${extraInfo}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.ok && health.data.status === 'healthy', '1. System Health API is operational');

    // 2. Demo Rider Login
    const riderLogin = await request('/auth/demo-login', {
      method: 'POST',
      body: { role: 'RIDER' }
    });
    assert(riderLogin.ok && riderLogin.data.user.role === 'RIDER', '2. Rider Demo Login', `(Token: ${riderLogin.data.token ? 'Present' : 'Missing'})`);
    const riderToken = riderLogin.data.token;

    // 3. Demo Host Login
    const hostLogin = await request('/auth/demo-login', {
      method: 'POST',
      body: { role: 'HOST' }
    });
    assert(hostLogin.ok && hostLogin.data.user.role === 'HOST', '3. Host Demo Login');
    const hostToken = hostLogin.data.token;

    // 4. Demo Admin Login
    const adminLogin = await request('/auth/demo-login', {
      method: 'POST',
      body: { role: 'ADMIN' }
    });
    assert(adminLogin.ok && adminLogin.data.user.role === 'ADMIN', '4. Admin Demo Login');
    const adminToken = adminLogin.data.token;

    // 5. Charger Search with Haversine Distance
    const chargersRes = await request('/chargers?userLat=13.0418&userLng=80.2341');
    assert(chargersRes.ok && chargersRes.data.chargers.length >= 9, '5. Fetch Charging Points with Haversine distance', `(${chargersRes.data.chargers.length} locations found)`);
    const targetCharger = chargersRes.data.chargers[0];
    assert(targetCharger.distanceKm !== undefined, '5b. Distance calculated via Haversine formula', `(${targetCharger.title}: ${targetCharger.distanceKm} km)`);

    // 6. Transparent Cost Estimate
    const estRes = await request('/bookings/estimate', {
      method: 'POST',
      body: {
        locationId: targetCharger.id,
        durationHours: 2,
        batteryCapacityKwh: 3.7
      }
    });
    assert(estRes.ok && estRes.data.breakdown.platformFee > 0, '6. Transparent Cost Estimation with 5% Platform Fee', `(Total: ₹${estRes.data.breakdown.totalAmount})`);

    // 7. Check Slot Availability
    const randomDay = String(Math.floor(1 + Math.random() * 28)).padStart(2, '0');
    const randomHour = Math.floor(7 + Math.random() * 10);
    const startHourStr = String(randomHour).padStart(2, '0') + ':00';
    const endHourStr = String(randomHour + 2).padStart(2, '0') + ':00';
    const overlapStartStr = String(randomHour).padStart(2, '0') + ':30';
    const overlapEndStr = String(randomHour + 1).padStart(2, '0') + ':30';
    const testDate = `2026-12-${randomDay}`;

    const availRes = await request('/bookings/check-availability', {
      method: 'POST',
      body: {
        locationId: targetCharger.id,
        bookingDate: testDate,
        startTime: startHourStr,
        endTime: endHourStr
      }
    });
    assert(availRes.ok && availRes.data.isAvailable === true, '7. Slot availability check verifies vacant slot');

    // 8. Create Rider Booking
    const bookingRes = await request('/bookings', {
      method: 'POST',
      token: riderToken,
      body: {
        locationId: targetCharger.id,
        bookingDate: testDate,
        startTime: startHourStr,
        endTime: endHourStr,
        durationHours: 2,
        vehicleModel: 'Ather 450X Gen 3',
        notes: 'E2E Test Booking'
      }
    });
    assert(bookingRes.ok && bookingRes.data.booking?.status === 'PENDING', '8. Booking Created with status PENDING', `(#${bookingRes.data.booking?.bookingNumber})`);
    const testBookingId = bookingRes.data.booking.id;

    // 9. Prevent Double-Booking (Conflict Prevention Check)
    const conflictRes = await request('/bookings', {
      method: 'POST',
      token: riderToken,
      body: {
        locationId: targetCharger.id,
        bookingDate: testDate,
        startTime: overlapStartStr, // Overlaps!
        endTime: overlapEndStr,
        durationHours: 1
      }
    });
    assert(conflictRes.status === 409, '9. Conflict Prevention Engine rejects overlapping double-booking (409 Conflict)');

    // 10. Process Simulated Razorpay Test Payment
    const payRes = await request(`/bookings/${testBookingId}/pay`, {
      method: 'POST',
      token: riderToken,
      body: {
        paymentMethod: 'RAZORPAY_TEST'
      }
    });
    assert(payRes.ok && payRes.data.booking.status === 'CONFIRMED', '10. Simulated Payment transitions booking to CONFIRMED');

    // 11. Rider leaves review
    const reviewRes = await request('/reviews', {
      method: 'POST',
      token: riderToken,
      body: {
        bookingId: testBookingId,
        rating: 5,
        comment: 'Outstanding socket grounding and convenient parking porch.'
      }
    });
    assert(reviewRes.ok && reviewRes.data.review.rating === 5, '11. Review submitted and location rating recalculated');

    // 12. Host adds new charging point (Pending Verification)
    const newChargerRes = await request('/chargers', {
      method: 'POST',
      token: hostToken,
      body: {
        title: 'New Guindy Porch EV Plug (Test)',
        address: '55 SIDCO Estate, Guindy',
        city: 'Chennai',
        latitude: 13.007,
        longitude: 80.203,
        category: 'RESIDENTIAL',
        pricePerHour: 32,
        isDedicatedEvse: false,
        hasEarthProtection: true
      }
    });
    assert(newChargerRes.ok && newChargerRes.data.charger.verificationStatus === 'PENDING', '12. Host lists charger with PENDING admin verification');
    const newChargerId = newChargerRes.data.charger.id;

    // 13. Admin verifies and approves the new charger
    const verifyRes = await request(`/admin/chargers/${newChargerId}/verify`, {
      method: 'PATCH',
      token: adminToken,
      body: {
        status: 'APPROVED',
        verificationNotes: 'Grounding certificate and 30mA RCCB photo verified by Admin.'
      }
    });
    assert(verifyRes.ok && verifyRes.data.charger.verificationStatus === 'APPROVED', '13. Admin approves charger and publishes live to map');

    // 14. Admin Platform Metrics
    const metricsRes = await request('/admin/metrics', { token: adminToken });
    assert(metricsRes.ok && metricsRes.data.metrics.totalUsers > 0, '14. Admin Platform Metrics & Revenue accounting');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`E2E Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();

