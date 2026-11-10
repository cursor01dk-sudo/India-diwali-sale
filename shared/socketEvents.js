// Shared Socket.IO Event Constants across Backend, Customer Frontend, and Admin Panel

module.exports = {
    // Product real-time events
    PRODUCT_CREATED: 'sync:product_created',
    PRODUCT_UPDATED: 'sync:product_updated',
    PRODUCT_DELETED: 'sync:product_deleted',
    STOCK_UPDATED: 'sync:stock_updated',
    PRICE_UPDATED: 'sync:price_updated',

    // Banner & Promotional events
    BANNER_UPDATED: 'sync:banner_updated',
    BANNER_CREATED: 'sync:banner_created',
    BANNER_DELETED: 'sync:banner_deleted',

    // Website Content & CMS events
    CONTENT_UPDATED: 'sync:content_updated',
    COUPON_UPDATED: 'sync:coupon_updated',

    // Payment & Store Settings events
    UPI_SETTINGS_UPDATED: 'sync:upi_settings_updated',

    // Order real-time events
    ORDER_CREATED: 'sync:order_created',
    ORDER_STATUS_UPDATED: 'sync:order_status_updated',

    // Activity & System notifications
    ACTIVITY_LOGGED: 'sync:activity_logged',
    NOTIFICATION: 'sync:notification'
};

