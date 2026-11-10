// Role-Based Access Control (RBAC) Constants

const ROLES = {
    SUPER_ADMIN: 'superadmin',
    ADMIN: 'admin',
    STAFF: 'staff',
    USER: 'user'
};

const PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: ['all'],
    [ROLES.ADMIN]: [
        'manage_products',
        'manage_orders',
        'manage_banners',
        'manage_content',
        'manage_coupons',
        'manage_upi',
        'view_logs',
        'manage_users'
    ],
    [ROLES.STAFF]: [
        'manage_products',
        'manage_orders',
        'view_logs'
    ],
    [ROLES.USER]: [
        'view_products',
        'place_orders',
        'manage_profile'
    ]
};

module.exports = {
    ROLES,
    PERMISSIONS
};
