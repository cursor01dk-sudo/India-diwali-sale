import React, { useEffect } from 'react';
import 'chart.js/auto'; // Required for react-chartjs-2 registration
import { Doughnut, Line, Pie, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAdminProducts } from '../../actions/productAction';
import { getAllOrders } from '../../actions/orderAction';
import { getAllUsers } from '../../actions/userAction';
import { categories } from '../../utils/constants';
import MetaData from '../Layouts/MetaData';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { fallbackProducts } from '../../data/storeFallbackData';

const MainData = () => {
    const dispatch = useDispatch();

    const { products } = useSelector((state) => state.products);
    const { orders } = useSelector((state) => state.allOrders);
    const { users } = useSelector((state) => state.users);

    useEffect(() => {
        dispatch(getAdminProducts());
        dispatch(getAllOrders());
        dispatch(getAllUsers());
    }, [dispatch]);

    // Defensive array guards with seamless store fallback
    const safeProducts = (Array.isArray(products) && products.length > 0) ? products : fallbackProducts;
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeUsers = Array.isArray(users) ? users : [];

    let outOfStock = 0;
    safeProducts.forEach((item) => {
        if (item && item.stock === 0) {
            outOfStock += 1;
        }
    });

    const totalAmount = safeOrders.reduce((total, order) => total + (order?.totalPrice || 0), 0);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = new Date();

    const lineState = {
        labels: months,
        datasets: [
            {
                label: `Sales (${date.getFullYear() - 1})`,
                borderColor: '#64748b',
                backgroundColor: 'rgba(100, 116, 139, 0.15)',
                tension: 0.3,
                fill: true,
                data: months.map((m, i) =>
                    safeOrders
                        .filter((od) => od?.createdAt && new Date(od.createdAt).getMonth() === i && new Date(od.createdAt).getFullYear() === date.getFullYear() - 1)
                        .reduce((total, od) => total + (od.totalPrice || 0), 0)
                ),
            },
            {
                label: `Sales (${date.getFullYear()})`,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.35,
                fill: true,
                borderWidth: 2.5,
                data: months.map((m, i) =>
                    safeOrders
                        .filter((od) => od?.createdAt && new Date(od.createdAt).getMonth() === i && new Date(od.createdAt).getFullYear() === date.getFullYear())
                        .reduce((total, od) => total + (od.totalPrice || 0), 0)
                ),
            },
        ],
    };

    const statuses = ['Processing', 'Shipped', 'Delivered'];

    const pieState = {
        labels: statuses,
        datasets: [
            {
                backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
                hoverBackgroundColor: ['#d97706', '#2563eb', '#059669'],
                borderWidth: 2,
                borderColor: '#131c31',
                data: statuses.map((status) => safeOrders.filter((item) => item?.orderStatus === status).length),
            },
        ],
    };

    const inStockCount = Math.max(0, safeProducts.length - outOfStock);
    const doughnutState = {
        labels: ['Out of Stock', 'In Stock'],
        datasets: [
            {
                backgroundColor: ['#ef4444', '#10b981'],
                hoverBackgroundColor: ['#dc2626', '#059669'],
                borderWidth: 2,
                borderColor: '#131c31',
                data: [outOfStock, inStockCount > 0 ? inStockCount : (safeProducts.length > 0 ? safeProducts.length : 1)],
            },
        ],
    };

    const categoriesList = Array.isArray(categories) && categories.length > 0 ? categories : ['Electronics', 'Mobiles', 'Home', 'Fashion', 'Appliances'];
    const barState = {
        labels: categoriesList.slice(0, 7),
        datasets: [
            {
                label: "Items in Catalog",
                backgroundColor: '#3b82f6',
                hoverBackgroundColor: '#2563eb',
                borderRadius: 6,
                data: categoriesList.slice(0, 7).map((cat) => safeProducts.filter((item) => item?.category === cat).length),
            },
        ],
    };

    return (
        <div className="space-y-6">
            <MetaData title="Admin Dashboard | Flipkart" />

            {/* Top Quick Actions Banner */}
            <div className="bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#1d4ed8] rounded-2xl p-4 sm:p-6 text-white shadow-lg shadow-blue-500/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-blue-100 text-[10px] font-bold uppercase tracking-wider mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>Direct Actions</span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                            Operations Control Hub
                        </h2>
                        <p className="text-xs text-blue-100 mt-0.5">
                            Manage your store's live Flipkart importer, posters, products, and customer shipments.
                        </p>
                    </div>

                    <Link
                        to="/"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs bg-white text-blue-700 font-bold px-3.5 py-2 rounded-xl shadow-sm hover:bg-blue-50 transition-all shrink-0"
                    >
                        <span>View Live Store</span>
                        <span>↗</span>
                    </Link>
                </div>

                {/* 4 Operations Shortcut Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <Link
                        to="/admin/import-flipkart"
                        className="bg-white/10 hover:bg-white/20 p-3 sm:p-3.5 rounded-xl border border-white/20 transition-all flex flex-col justify-between group backdrop-blur-xs"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-lg bg-amber-400 text-gray-950 group-hover:scale-110 transition-transform shadow-xs">
                                <CloudDownloadOutlinedIcon fontSize="small" />
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400/30 text-amber-200 px-1.5 py-0.5 rounded">
                                Instant
                            </span>
                        </div>
                        <div>
                            <div className="font-extrabold text-white text-sm group-hover:text-amber-300 transition-colors">
                                Import Flipkart URL
                            </div>
                            <div className="text-[11px] text-blue-100 mt-0.5">
                                Scrapes 1500px HD photos, specs & certified reviews
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/banners"
                        className="bg-white/10 hover:bg-white/20 p-3 sm:p-3.5 rounded-xl border border-white/20 transition-all flex flex-col justify-between group backdrop-blur-xs"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-lg bg-indigo-400 text-white group-hover:scale-110 transition-transform shadow-xs">
                                <ViewCarouselOutlinedIcon fontSize="small" />
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-300/30 text-indigo-100 px-1.5 py-0.5 rounded">
                                Studio
                            </span>
                        </div>
                        <div>
                            <div className="font-extrabold text-white text-sm group-hover:text-indigo-200 transition-colors">
                                Posters & Banners
                            </div>
                            <div className="text-[11px] text-blue-100 mt-0.5">
                                Add, swap, preview, or remove frontpage banners
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/products"
                        className="bg-white/10 hover:bg-white/20 p-3 sm:p-3.5 rounded-xl border border-white/20 transition-all flex flex-col justify-between group backdrop-blur-xs"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-lg bg-emerald-400 text-gray-950 group-hover:scale-110 transition-transform shadow-xs">
                                <Inventory2OutlinedIcon fontSize="small" />
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-300/30 text-emerald-100 px-1.5 py-0.5 rounded">
                                Pricing
                            </span>
                        </div>
                        <div>
                            <div className="font-extrabold text-white text-sm group-hover:text-emerald-200 transition-colors">
                                Products & Prices
                            </div>
                            <div className="text-[11px] text-blue-100 mt-0.5">
                                Adjust selling price (₹), MRP & stock levels
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/orders"
                        className="bg-white/10 hover:bg-white/20 p-3 sm:p-3.5 rounded-xl border border-white/20 transition-all flex flex-col justify-between group backdrop-blur-xs"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="p-2 rounded-lg bg-rose-400 text-white group-hover:scale-110 transition-transform shadow-xs">
                                <LocalShippingOutlinedIcon fontSize="small" />
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider bg-rose-300/30 text-rose-100 px-1.5 py-0.5 rounded">
                                Orders
                            </span>
                        </div>
                        <div>
                            <div className="font-extrabold text-white text-sm group-hover:text-rose-200 transition-colors">
                                Manage Shipments
                            </div>
                            <div className="text-[11px] text-blue-100 mt-0.5">
                                Track orders, dispatch parcels & mark delivered
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Core Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Revenue */}
                <div className="bg-[#131c31] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300" style={{ color: '#94a3b8' }}>
                            Total Revenue
                        </span>
                        <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                            <CurrencyRupeeIcon sx={{ fontSize: 18 }} />
                        </span>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            ₹{totalAmount.toLocaleString()}
                        </div>
                        <div className="text-[11px] font-semibold flex items-center gap-1 mt-1 text-emerald-400" style={{ color: '#34d399' }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />
                            <span>Calculated across all orders</span>
                        </div>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-[#131c31] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300" style={{ color: '#94a3b8' }}>
                            Total Orders
                        </span>
                        <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                            <ShoppingBagOutlinedIcon sx={{ fontSize: 18 }} />
                        </span>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {safeOrders.length}
                        </div>
                        <div className="text-[11px] font-medium mt-1 text-slate-300" style={{ color: '#94a3b8' }}>
                            {safeOrders.filter(o => o.orderStatus === 'Delivered').length} delivered successfully
                        </div>
                    </div>
                </div>

                {/* Active Products */}
                <div className="bg-[#131c31] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300" style={{ color: '#94a3b8' }}>
                            Total Products
                        </span>
                        <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                            <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />
                        </span>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {safeProducts.length}
                        </div>
                        <div className="text-[11px] font-medium mt-1 text-slate-300" style={{ color: '#94a3b8' }}>
                            <span className="font-bold text-emerald-400" style={{ color: '#34d399' }}>{inStockCount} In Stock</span>
                            {outOfStock > 0 && <span className="font-bold ml-1 text-rose-400" style={{ color: '#f87171' }}>• {outOfStock} Out of Stock</span>}
                        </div>
                    </div>
                </div>

                {/* Users / Customers */}
                <div className="bg-[#131c31] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300" style={{ color: '#94a3b8' }}>
                            Active Users
                        </span>
                        <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                            <PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />
                        </span>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {safeUsers.length}
                        </div>
                        <div className="text-[11px] font-medium mt-1 text-slate-300" style={{ color: '#94a3b8' }}>
                            Registered store accounts
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1: Sales Analytics & Order Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-[#131c31] rounded-2xl p-5 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                                Sales & Revenue Analytics
                            </h3>
                            <p className="text-[11px] font-medium text-slate-300" style={{ color: '#94a3b8' }}>
                                Monthly transaction totals across current and past years
                            </p>
                        </div>
                    </div>
                    <div className="h-64 sm:h-72">
                        <Line
                            data={lineState}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 }, color: '#e2e8f0' } },
                                },
                                scales: {
                                    y: {
                                        grid: { color: '#1e293b' },
                                        ticks: {
                                            callback: (val) => `₹${Number(val).toLocaleString()}`,
                                            font: { size: 10 },
                                            color: '#94a3b8'
                                        }
                                    },
                                    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94a3b8' } }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="bg-[#131c31] rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-1">
                        Order Status Breakdown
                    </h3>
                    <p className="text-[11px] font-medium text-slate-300 mb-4" style={{ color: '#94a3b8' }}>
                        Distribution of live order stages
                    </p>
                    <div className="h-56 flex items-center justify-center relative">
                        <Pie
                            data={pieState}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 }, color: '#e2e8f0' } }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Charts Row 2: Categories & Stock Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-[#131c31] rounded-2xl p-5 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                                Products by Category
                            </h3>
                            <p className="text-[11px] font-medium text-slate-300" style={{ color: '#94a3b8' }}>
                                Catalog distribution across primary store departments
                            </p>
                        </div>
                    </div>
                    <div className="h-64 sm:h-72">
                        <Bar
                            data={barState}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false }
                                },
                                scales: {
                                    y: {
                                        grid: { color: '#1e293b' },
                                        ticks: { stepSize: 1, font: { size: 10 }, color: '#94a3b8' }
                                    },
                                    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94a3b8' } }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="bg-[#131c31] rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-1">
                        Stock Inventory Health
                    </h3>
                    <p className="text-[11px] font-medium text-slate-300 mb-4" style={{ color: '#94a3b8' }}>
                        Ratio of available vs out-of-stock items
                    </p>
                    <div className="h-56 flex items-center justify-center relative">
                        <Doughnut
                            data={doughnutState}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 }, color: '#e2e8f0' } }
                                },
                                cutout: '65%'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainData;
