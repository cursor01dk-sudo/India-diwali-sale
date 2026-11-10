import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from './actions/userAction';
import WebFont from 'webfontloader';

import ProtectedRoute from './Routes/ProtectedRoute';
import AdminLogin from './components/Admin/AdminLogin';
import Dashboard from './components/Admin/Dashboard';
import MainData from './components/Admin/MainData';
import ProductTable from './components/Admin/ProductTable';
import NewProduct from './components/Admin/NewProduct';
import UpdateProduct from './components/Admin/UpdateProduct';
import OrderTable from './components/Admin/OrderTable';
import UpdateOrder from './components/Admin/UpdateOrder';
import UserTable from './components/Admin/UserTable';
import UpdateUser from './components/Admin/UpdateUser';
import ManageBanners from './components/Admin/ManageBanners';
import ContentEditor from './components/Admin/ContentEditor';
import CouponTable from './components/Admin/CouponTable';
import ImportFlipkart from './components/Admin/ImportFlipkart';
import UpiSettings from './components/Admin/UpiSettings';
import ActivityLogs from './components/Admin/ActivityLogs';
import ReviewsTable from './components/Admin/ReviewsTable';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        WebFont.load({
            google: {
                families: ["Roboto:300,400,500,600,700"]
            },
        });
        dispatch(loadUser());
    }, [dispatch]);

    return (
        <Routes>
            {/* Standalone Admin Login */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/login" element={<AdminLogin />} />

            {/* Dashboard Analytics */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                    <Dashboard activeTab={0}>
                        <MainData />
                    </Dashboard>
                </ProtectedRoute>
            } />

            {/* Products Management */}
            <Route path="/admin/products" element={
                <ProtectedRoute>
                    <Dashboard activeTab={2}>
                        <ProductTable />
                    </Dashboard>
                </ProtectedRoute>
            } />
            <Route path="/admin/new_product" element={
                <ProtectedRoute>
                    <Dashboard activeTab={3}>
                        <NewProduct />
                    </Dashboard>
                </ProtectedRoute>
            } />
            <Route path="/admin/product/:id" element={
                <ProtectedRoute>
                    <Dashboard activeTab={2}>
                        <UpdateProduct />
                    </Dashboard>
                </ProtectedRoute>
            } />

            {/* Orders Management */}
            <Route path="/admin/orders" element={
                <ProtectedRoute>
                    <Dashboard activeTab={1}>
                        <OrderTable />
                    </Dashboard>
                </ProtectedRoute>
            } />
            <Route path="/admin/order/:id" element={
                <ProtectedRoute>
                    <Dashboard activeTab={1}>
                        <UpdateOrder />
                    </Dashboard>
                </ProtectedRoute>
            } />

            {/* Customers Management */}
            <Route path="/admin/users" element={
                <ProtectedRoute>
                    <Dashboard activeTab={6}>
                        <UserTable />
                    </Dashboard>
                </ProtectedRoute>
            } />
            <Route path="/admin/user/:id" element={
                <ProtectedRoute>
                    <Dashboard activeTab={6}>
                        <UpdateUser />
                    </Dashboard>
                </ProtectedRoute>
            } />

            {/* Posters & Banners */}
            <Route path="/admin/banners" element={
                <ProtectedRoute>
                    <Dashboard activeTab={5}>
                        <ManageBanners />
                    </Dashboard>
                </ProtectedRoute>
            } />

            {/* Website Content / CMS */}
            <Route path="/admin/content" element={
                <ProtectedRoute>
                    <Dashboard activeTab={9}>
                        <ContentEditor />
                    </Dashboard>
                </ProtectedRoute>
            } />

            {/* Coupons & Offers */}
            <Route path="/admin/coupons" element={
                <ProtectedRoute>
                    <Dashboard activeTab={10}>
                        <CouponTable />
                    </Dashboard>
                </ProtectedRoute>
            } />

            {/* Flipkart 1-Click Importer */}
            <Route path="/admin/import-flipkart" element={
                <ProtectedRoute>
                    <Dashboard activeTab={4}>
                        <ImportFlipkart />
                    </Dashboard>
                </ProtectedRoute>
            } />

            {/* UPI Gateway Settings */}
            <Route path="/admin/upi-settings" element={
                <ProtectedRoute>
                    <Dashboard activeTab={8}>
                        <UpiSettings />
                    </Dashboard>
                </ProtectedRoute>
            } />

            {/* Activity Logs & Audit Trail */}
            <Route path="/admin/activity-logs" element={
                <ProtectedRoute>
                    <Dashboard activeTab={11}>
                        <ActivityLogs />
                    </Dashboard>
                </ProtectedRoute>
            } />

            {/* Reviews Management */}
            <Route path="/admin/reviews" element={
                <ProtectedRoute>
                    <Dashboard activeTab={7}>
                        <ReviewsTable />
                    </Dashboard>
                </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
    );
}

export default App;

