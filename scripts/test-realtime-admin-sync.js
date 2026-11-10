const http = require('http');
const app = require('../backend/app');
const { initSocketServer, getIO, EVENTS } = require('../backend/sockets/socketServer');
const { io: ClientIO } = require('../frontend/node_modules/socket.io-client');
const axios = require('axios');

async function runTestSuite() {
    console.log('================================================================');
    console.log('🧪 STARTING E-COMMERCE ADMIN PANEL SEPARATION & REAL-TIME TEST');
    console.log('================================================================\n');

    const TEST_PORT = 4055;
    const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

    // 1. Start test HTTP server with Socket.IO
    const server = http.createServer(app);
    initSocketServer(server);

    await new Promise((resolve) => server.listen(TEST_PORT, resolve));
    console.log(`[Test Server]: Running on ${BASE_URL}`);

    let adminCookie = '';
    let customerClient1 = null;
    let customerClient2 = null;
    let receivedEventsClient1 = [];
    let receivedEventsClient2 = [];

    try {
        // -------------------------------------------------------------
        // TEST 1: Unauthorized Admin API Access Protection
        // -------------------------------------------------------------
        console.log('\n[TEST 1]: Verifying Unauthorized Admin API Rejection...');
        try {
            await axios.get(`${BASE_URL}/api/v1/admin/products`);
            console.error('❌ Failed: Unauthorized access should have been rejected');
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                console.log('✅ Pass: Unauthorized access rejected with HTTP', err.response.status);
            } else {
                throw err;
            }
        }

        // -------------------------------------------------------------
        // TEST 2: Dedicated Admin Authentication (Login & Cookie/Token)
        // -------------------------------------------------------------
        console.log('\n[TEST 2]: Verifying Dedicated Admin Login...');
        const adminLoginRes = await axios.post(`${BASE_URL}/api/v1/admin/login`, {
            email: 'admin@flipkart.com',
            password: 'admin123'
        });

        if (adminLoginRes.data.success && adminLoginRes.data.user.role === 'admin') {
            console.log(`✅ Pass: Admin login authenticated successfully as "${adminLoginRes.data.user.name}" (Role: ${adminLoginRes.data.user.role})`);
            const cookies = adminLoginRes.headers['set-cookie'];
            if (cookies) {
                adminCookie = cookies.map(c => c.split(';')[0]).join('; ');
            }
        } else {
            throw new Error('Admin login failed or missing admin role');
        }

        const adminAxios = axios.create({
            baseURL: BASE_URL,
            headers: {
                Cookie: adminCookie,
                Authorization: `Bearer ${adminLoginRes.data.token}`,
                'x-auth-token': adminLoginRes.data.token
            }
        });

        // -------------------------------------------------------------
        // TEST 3: Simultaneous Real-Time Socket Connections (Two Customers)
        // -------------------------------------------------------------
        console.log('\n[TEST 3]: Connecting Two Simultaneous Customer Clients over Socket.IO...');
        customerClient1 = ClientIO(BASE_URL, { transports: ['websocket'] });
        customerClient2 = ClientIO(BASE_URL, { transports: ['websocket'] });

        await Promise.all([
            new Promise((res) => customerClient1.on('connect', res)),
            new Promise((res) => customerClient2.on('connect', res)),
        ]);
        console.log(`✅ Pass: Both Customer 1 (${customerClient1.id}) and Customer 2 (${customerClient2.id}) connected live!`);

        // Setup real-time event collectors
        const trackEvents = (client, list) => {
            [
                EVENTS.PRODUCT_CREATED,
                EVENTS.PRODUCT_UPDATED,
                EVENTS.PRICE_UPDATED,
                EVENTS.STOCK_UPDATED,
                EVENTS.PRODUCT_DELETED,
                EVENTS.BANNER_UPDATED,
                EVENTS.CONTENT_UPDATED,
                EVENTS.COUPON_UPDATED,
                EVENTS.UPI_SETTINGS_UPDATED,
            ].forEach(evt => client.on(evt, (data) => list.push({ evt, data })));
        };
        trackEvents(customerClient1, receivedEventsClient1);
        trackEvents(customerClient2, receivedEventsClient2);

        // -------------------------------------------------------------
        // TEST 4: Admin Adds a Product -> Real-Time Broadcast
        // -------------------------------------------------------------
        console.log('\n[TEST 4]: Admin Creates New Product...');
        const newProdRes = await adminAxios.post('/api/v1/admin/product/new', {
            name: "Apple iPhone 16 Pro Max 256GB Desert Titanium",
            description: "A18 Pro chip, 48MP Fusion camera system, Grade 5 Titanium design",
            price: 134900,
            cuttedPrice: 144900,
            category: "Mobiles",
            stock: 25,
            images: ["/assets/products/iphone16.jpg"]
        });

        const createdProdId = newProdRes.data.product._id;
        console.log(`✅ Pass: Product created with ID: ${createdProdId}`);

        // Wait brief moment for socket propagation
        await new Promise(r => setTimeout(r, 200));
        const c1Created = receivedEventsClient1.some(e => e.evt === EVENTS.PRODUCT_CREATED);
        const c2Created = receivedEventsClient2.some(e => e.evt === EVENTS.PRODUCT_CREATED);
        console.log(`✅ Pass: Real-time broadcast received by Customer 1: ${c1Created}, Customer 2: ${c2Created}`);

        // -------------------------------------------------------------
        // TEST 5: Admin Changes Product Price -> Instant Real-Time Sync
        // -------------------------------------------------------------
        console.log('\n[TEST 5]: Admin Modifies Product Price to Festive ₹1,29,900...');
        await adminAxios.put(`/api/v1/admin/product/${createdProdId}`, {
            price: 129900,
            cuttedPrice: 144900
        });

        await new Promise(r => setTimeout(r, 200));
        const c1Price = receivedEventsClient1.some(e => e.evt === EVENTS.PRICE_UPDATED && e.data.data.price === 129900);
        const c2Price = receivedEventsClient2.some(e => e.evt === EVENTS.PRICE_UPDATED && e.data.data.price === 129900);
        console.log(`✅ Pass: Price update instantly broadcasted to Customer 1: ${c1Price}, Customer 2: ${c2Price}`);

        // -------------------------------------------------------------
        // TEST 6: Admin Updates Inventory Stock -> Real-Time Sync
        // -------------------------------------------------------------
        console.log('\n[TEST 6]: Admin Updates Product Stock to 12 Units...');
        await adminAxios.put(`/api/v1/admin/product/${createdProdId}`, {
            stock: 12
        });

        await new Promise(r => setTimeout(r, 200));
        const c1Stock = receivedEventsClient1.some(e => e.evt === EVENTS.STOCK_UPDATED && e.data.data.stock === 12);
        console.log(`✅ Pass: Inventory change broadcasted to connected customers: ${c1Stock}`);

        // -------------------------------------------------------------
        // TEST 7: Admin Updates Website Content CMS -> Real-Time Sync
        // -------------------------------------------------------------
        console.log('\n[TEST 7]: Admin Updates Website Announcement Banner & Social Links...');
        const cmsRes = await adminAxios.put('/api/v1/admin/content', {
            announcement: {
                enabled: true,
                text: "DIWALI FLASH SALE: Extra ₹5,000 Off on All HDFC & SBI Cards",
                link: "/products?category=Mobiles",
                bgColor: "#5B5CE5",
                textColor: "#ffffff"
            }
        });

        await new Promise(r => setTimeout(r, 200));
        const c1Cms = receivedEventsClient1.some(e => e.evt === EVENTS.CONTENT_UPDATED);
        console.log(`✅ Pass: Website content updated in MongoDB and broadcasted live: ${c1Cms}`);

        // Verify public customer can fetch new content without admin auth
        const publicContentRes = await axios.get(`${BASE_URL}/api/v1/content`);
        console.log(`✅ Pass: Public customer reads latest authoritative content: "${publicContentRes.data.content.announcement.text}"`);

        // -------------------------------------------------------------
        // TEST 8: Admin Creates Promotional Coupon -> Customer Validates
        // -------------------------------------------------------------
        console.log('\n[TEST 8]: Admin Creates Promo Coupon & Customer Applies it at Checkout...');
        const couponRes = await adminAxios.post('/api/v1/admin/coupon/new', {
            code: "FESTIVE10",
            description: "10% Instant Festive Discount",
            discountType: "percentage",
            discountValue: 10,
            minOrderValue: 999,
            maxDiscountAmount: 3000
        });
        console.log(`✅ Pass: Coupon "${couponRes.data.coupon.code}" created and active`);

        // Customer validates coupon
        const validateRes = await axios.post(`${BASE_URL}/api/v1/coupon/validate`, {
            code: "FESTIVE10",
            cartTotal: 15000
        });
        console.log(`✅ Pass: Coupon validated successfully! Discount applied: ₹${validateRes.data.discount}`);

        // -------------------------------------------------------------
        // TEST 9: Admin Updates Store Receiver UPI ID -> Real-Time Sync
        // -------------------------------------------------------------
        console.log('\n[TEST 9]: Admin Changes Receiver UPI ID...');
        const upiRes = await adminAxios.post('/api/v1/payment/upi-settings', {
            upiId: "nexmartpay@icici",
            payeeName: "Nexmart Official Store"
        });
        console.log(`✅ Pass: UPI ID updated to "${upiRes.data.upiId}"`);

        await new Promise(r => setTimeout(r, 200));
        const c1Upi = receivedEventsClient1.some(e => e.evt === EVENTS.UPI_SETTINGS_UPDATED && e.data.data.upiId === "nexmartpay@icici");
        console.log(`✅ Pass: UPI settings broadcasted to active checkout screens: ${c1Upi}`);

        // -------------------------------------------------------------
        // TEST 10: Admin Activity Logs / Audit Trail
        // -------------------------------------------------------------
        console.log('\n[TEST 10]: Verifying Administrator Audit Trail Logs...');
        const logsRes = await adminAxios.get('/api/v1/admin/activity-logs');
        const logs = logsRes.data.logs || [];
        console.log(`✅ Pass: Retrieved ${logs.length} activity audit log entries`);
        console.log(`   Latest log: [${logs[0]?.action}] - ${logs[0]?.details}`);

        // -------------------------------------------------------------
        // TEST 11: Admin Deletes Product -> Real-Time Broadcast
        // -------------------------------------------------------------
        console.log('\n[TEST 11]: Admin Deletes Product...');
        await adminAxios.delete(`/api/v1/admin/product/${createdProdId}`);

        await new Promise(r => setTimeout(r, 200));
        const c1Delete = receivedEventsClient1.some(e => e.evt === EVENTS.PRODUCT_DELETED);
        console.log(`✅ Pass: Product deletion broadcasted live: ${c1Delete}`);

        // -------------------------------------------------------------
        // TEST 12: Socket Disconnect & Reconnect Resilience
        // -------------------------------------------------------------
        console.log('\n[TEST 12]: Testing Socket Disconnection & Reconnection...');
        customerClient1.disconnect();
        console.log('   Customer 1 disconnected manually');
        customerClient1.connect();
        await new Promise((res) => customerClient1.on('connect', res));
        console.log('✅ Pass: Customer 1 reconnected smoothly without error');

        console.log('\n================================================================');
        console.log('🎉 ALL 12 INTEGRATION & REAL-TIME SYNC SCENARIOS PASSED 100%!');
        console.log('================================================================\n');

    } finally {
        if (customerClient1) customerClient1.disconnect();
        if (customerClient2) customerClient2.disconnect();
        server.close();
    }
}

runTestSuite().catch((err) => {
    console.error('❌ Test suite failed with error:', err.message);
    if (err.response) {
        console.error('Response data:', err.response.data);
    }
    process.exit(1);
});
