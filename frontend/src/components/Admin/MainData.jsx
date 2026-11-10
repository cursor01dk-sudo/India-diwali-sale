import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAdminProducts } from '../../actions/productAction';
import { getAllOrders } from '../../actions/orderAction';
import { getAllUsers } from '../../actions/userAction';
import MetaData from '../Layouts/MetaData';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { fallbackProducts } from '../../data/storeFallbackData';

const sampleTransactions = [
    {
        id: "#9359",
        name: "Esther",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
        product: "1x SoundPro Spe...",
        date: "21/07/2024 08:22",
        price: "$40",
        status: "Paid",
        statusColor: "paid"
    },
    {
        id: "#3933",
        name: "Arlene",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
        product: "5x FlexBar Dum...",
        date: "21/07/2024 10:11",
        price: "$101",
        status: "Pending",
        statusColor: "pending"
    },
    {
        id: "#5948",
        name: "Marjorie",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
        product: "4x BrewMate.....",
        date: "21/07/2024 12:31",
        price: "$112",
        status: "Paid",
        statusColor: "paid"
    },
    {
        id: "#2798",
        name: "Soham",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
        product: "2x GlowSkin S....",
        date: "21/07/2024 03:12",
        price: "$10",
        status: "Cancel",
        statusColor: "cancel"
    }
];

const sampleTopProducts = [
    {
        id: "tp-1",
        name: "Wireless Bluetooth...",
        category: "Electronics",
        stock: "In stock #101",
        price: "$63",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80"
    },
    {
        id: "tp-2",
        name: "Premium Yoga Mat",
        category: "Fitness",
        stock: "In stock #204",
        price: "$8,400",
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=120&q=80"
    },
    {
        id: "tp-3",
        name: "Stainless Steel Wa....",
        category: "Home & Kitchen",
        stock: "In stock #2531",
        price: "$110",
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=120&q=80"
    }
];

const sampleTopCustomers = [
    {
        id: "tc-1",
        name: "John Doe",
        email: "jhondoe@gmail.com",
        orders: 45,
        spent: "$8,750",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"
    },
    {
        id: "tc-2",
        name: "John Doe",
        email: "jhondoe@gmail.com",
        orders: 45,
        spent: "$8,750",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
    }
];

const MainData = () => {
    const dispatch = useDispatch();

    const { products } = useSelector((state) => state.products);
    const { orders } = useSelector((state) => state.allOrders);
    const { users } = useSelector((state) => state.users);

    const [liveUpiId, setLiveUpiId] = useState(() => localStorage.getItem('merchantUpiId') || 'deepakddoswala@fam');
    const [activeDateIndex, setActiveDateIndex] = useState(3); // 05 is active

    useEffect(() => {
        dispatch(getAdminProducts());
        dispatch(getAllOrders());
        dispatch(getAllUsers());

        axios.get('/api/v1/payment/upi-settings')
            .then(({ data }) => {
                if (data && data.success && data.upiId) {
                    setLiveUpiId(data.upiId);
                    localStorage.setItem('merchantUpiId', data.upiId);
                }
            })
            .catch(() => {});
    }, [dispatch]);

    const safeProducts = (Array.isArray(products) && products.length > 0) ? products : fallbackProducts;
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeUsers = Array.isArray(users) ? users : [];

    const totalOrdersCount = safeOrders.length > 0 ? safeOrders.length : 1250;
    const totalSalesAmount = safeOrders.length > 0
        ? safeOrders.reduce((sum, o) => sum + (o?.totalPrice || 0), 0)
        : 2430;

    // Map store orders to transactions table if available
    const displayTransactions = safeOrders.length > 0
        ? safeOrders.slice(0, 5).map((ord) => ({
            id: `#${String(ord._id).slice(-4)}`,
            name: ord.user?.name || ord.shippingInfo?.name || "Customer",
            avatar: ord.user?.avatar?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
            product: ord.orderItems?.[0]?.name ? `${ord.orderItems[0].quantity}x ${ord.orderItems[0].name.slice(0, 16)}...` : "Order Items",
            date: ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : "Today",
            price: `₹${(ord.totalPrice || 0).toLocaleString('en-IN')}`,
            status: ord.orderStatus === "Delivered" ? "Paid" : (ord.orderStatus === "Shipped" ? "Pending" : ord.orderStatus || "Paid"),
            statusColor: ord.orderStatus === "Delivered" ? "paid" : (ord.orderStatus === "Shipped" ? "pending" : "paid")
        }))
        : sampleTransactions;

    // Map store products to top products list if available
    const displayTopProducts = safeProducts.slice(0, 3).map((p, i) => ({
        id: p._id || `p-${i}`,
        name: p.name ? (p.name.length > 22 ? p.name.slice(0, 22) + "..." : p.name) : sampleTopProducts[i].name,
        category: p.category || "Electronics",
        stock: `In stock #${p.stock || (100 + i * 50)}`,
        price: `₹${(p.price || 999).toLocaleString('en-IN')}`,
        image: p.images?.[0]?.url || sampleTopProducts[i].image
    }));

    // Map store users to top customers list if available
    const displayTopCustomers = safeUsers.length > 0
        ? safeUsers.slice(0, 2).map((u, i) => ({
            name: u.name || sampleTopCustomers[i]?.name || "Customer",
            email: u.email || sampleTopCustomers[i]?.email || "customer@gmail.com",
            orders: 45,
            spent: "$8,750",
            avatar: u.avatar?.url || sampleTopCustomers[i]?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
        }))
        : sampleTopCustomers;

    // Bar chart data blocks matching reference image
    const barBlocks = [
        { label: "1-05 Sept", height: 52, active: false, val: "$1,450" },
        { label: "06-10 Sept", height: 86, active: false, val: "$3,120" },
        { label: "11-15 Sept", height: 40, active: false, val: "$1,120" },
        { label: "16-20 Sept", height: 74, active: true, val: "$2,134" },
        { label: "21-25 Sept", height: 96, active: false, val: "$4,540" },
        { label: "26-30 Sept", height: 68, active: false, val: "$2,430" },
    ];

    const calendarDays = [
        { day: "Mo", date: "02" },
        { day: "Tue", date: "03" },
        { day: "Wed", date: "04" },
        { day: "Thu", date: "05", isCurrent: true },
        { day: "Fri", date: "06" },
        { day: "Sat", date: "07" },
        { day: "Sun", date: "08" },
    ];

    return (
        <div className="space-y-6">
            <MetaData title="Admin Dashboard | Nexmart" />

            {/* Overall Grid: 12 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* =========================================================================
                    LEFT & CENTER MAIN COLUMN (8 of 12 cols on desktop)
                   ========================================================================= */}
                <div className="lg:col-span-8 space-y-5">
                    
                    {/* 1. TOP METRIC CARDS ROW (3 Cards) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        
                        {/* CARD 1: Total Orders */}
                        <div className="bg-[#171825] border border-[#232538] rounded-2xl p-4 sm:p-5 relative shadow-lg shadow-black/20 hover:border-[#343750] transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#34D399] flex items-center justify-center">
                                    <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} />
                                </div>
                                <span className="text-xs font-semibold text-slate-300">Total Orders</span>
                                <button className="text-[#63688E] hover:text-white transition-colors cursor-pointer">
                                    <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
                                </button>
                            </div>

                            <div className="mt-4">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    {totalOrdersCount.toLocaleString()}
                                </h2>
                                <div className="flex items-center justify-between mt-3 text-[11px]">
                                    <span className="text-[#63688E]">Since last month</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/20 font-bold">
                                        <CheckRoundedIcon sx={{ fontSize: 12 }} />
                                        <span>10.5%</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: Sales Today */}
                        <div className="bg-[#171825] border border-[#232538] rounded-2xl p-4 sm:p-5 relative shadow-lg shadow-black/20 hover:border-[#343750] transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 text-[#FBBF24] flex items-center justify-center">
                                    <Inventory2OutlinedIcon sx={{ fontSize: 20 }} />
                                </div>
                                <span className="text-xs font-semibold text-slate-300">Sales Today</span>
                                <button className="text-[#63688E] hover:text-white transition-colors cursor-pointer">
                                    <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
                                </button>
                            </div>

                            <div className="mt-4">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    ${totalSalesAmount.toLocaleString()}
                                </h2>
                                <div className="flex items-center justify-between mt-3 text-[11px]">
                                    <span className="text-[#63688E]">Since last month</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/20 font-bold">
                                        <CheckRoundedIcon sx={{ fontSize: 12 }} />
                                        <span>10.5%</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CARD 3: Conversion Rate */}
                        <div className="bg-[#171825] border border-[#232538] rounded-2xl p-4 sm:p-5 relative shadow-lg shadow-black/20 hover:border-[#343750] transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 text-[#A78BFA] flex items-center justify-center">
                                    <AccountCircleOutlinedIcon sx={{ fontSize: 20 }} />
                                </div>
                                <span className="text-xs font-semibold text-slate-300">Conversion Rate</span>
                                <button className="text-[#63688E] hover:text-white transition-colors cursor-pointer">
                                    <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
                                </button>
                            </div>

                            <div className="mt-4">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    3.2%
                                </h2>
                                <div className="flex items-center justify-between mt-3 text-[11px]">
                                    <span className="text-[#63688E]">Since last month</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/20 font-bold">
                                        <CheckRoundedIcon sx={{ fontSize: 12 }} />
                                        <span>10.5%</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. SALES SUMMARY + WIDGETS SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        
                        {/* Sales Summary Bar Chart Card (7 cols on md) */}
                        <div className="md:col-span-7 bg-[#171825] border border-[#232538] rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/20 flex flex-col justify-between">
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-white">Sales Summary</h3>
                                <div className="flex items-center gap-1.5">
                                    <button className="px-2.5 py-1 rounded-lg bg-[#202234] hover:bg-[#282B42] border border-[#2E314A] text-[10px] font-semibold text-slate-300 flex items-center gap-1 transition-colors">
                                        <FilterListRoundedIcon sx={{ fontSize: 13 }} />
                                        <span>Sort</span>
                                    </button>
                                    <button className="px-2.5 py-1 rounded-lg bg-[#202234] hover:bg-[#282B42] border border-[#2E314A] text-[10px] font-semibold text-slate-300 transition-colors">
                                        <span>View Details</span>
                                    </button>
                                </div>
                            </div>

                            {/* Chart Area with Left Y-Axis & Vertical Columns */}
                            <div className="relative pt-6 pb-2">
                                <div className="flex items-end gap-3 h-52">
                                    {/* Left Y-Axis Labels */}
                                    <div className="flex flex-col justify-between h-full text-[10px] font-semibold text-[#63688E] pr-2 select-none">
                                        <span>13k</span>
                                        <span>11k</span>
                                        <span>9k</span>
                                        <span>7k</span>
                                        <span>5k</span>
                                        <span>3k</span>
                                        <span>1k</span>
                                    </div>

                                    {/* Columns Track */}
                                    <div className="flex-1 flex items-end justify-between h-full gap-2 px-1">
                                        {barBlocks.map((col, idx) => (
                                            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                                {/* Tooltip on Active Column (Matching $2,134 in Reference) */}
                                                {col.active && (
                                                    <div className="absolute -top-6 px-2 py-0.5 rounded-md bg-[#25283E] border border-[#3A3D5E] text-white text-[10px] font-bold shadow-md shadow-black/40 flex items-center gap-1 z-10 animate-bounce">
                                                        <span>{col.val}</span>
                                                        <span className="text-[#38BDF8] text-[9px]">↗</span>
                                                    </div>
                                                )}

                                                {/* The Rounded Bar */}
                                                <div
                                                    style={{ height: `${col.height}%` }}
                                                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                                                        col.active
                                                            ? 'bg-[#5B5CE5] shadow-lg shadow-[#5B5CE5]/40 hover:brightness-110'
                                                            : 'bg-[#C7D2FE] hover:bg-[#E0E7FF]'
                                                    }`}
                                                ></div>

                                                {/* X-Axis Date Label */}
                                                <span className="text-[9px] font-medium text-[#63688E] mt-2 text-center whitespace-nowrap">
                                                    {col.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Widgets Column (5 cols on md) */}
                        <div className="md:col-span-5 space-y-4">
                            {/* Widget Header Strip */}
                            <div className="flex items-center justify-between px-1">
                                <div>
                                    <h4 className="text-sm font-bold text-white leading-tight">Widgets</h4>
                                    <p className="text-[10px] text-[#63688E]">Customize your window according to your need</p>
                                </div>
                                <button className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer">
                                    View more
                                </button>
                            </div>

                            {/* Sub-Widget 1: Total Revenue Blue Gradient Card */}
                            <div className="bg-gradient-to-r from-[#2563EB] to-[#5B5CE5] rounded-2xl p-4 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                                {/* Wave Silhouette Graphic in Background */}
                                <div className="absolute -right-4 -bottom-4 opacity-30 pointer-events-none">
                                    <svg width="180" height="90" viewBox="0 0 180 90" fill="none">
                                        <path d="M0 60 Q 40 20 80 50 T 160 30 L 180 70 L 0 90 Z" fill="white" />
                                    </svg>
                                </div>

                                <div className="flex items-center justify-between relative z-10">
                                    <span className="text-xs font-semibold text-blue-100">Total Revenue</span>
                                    <button className="text-white/80 hover:text-white transition-colors cursor-pointer">
                                        <OpenInFullRoundedIcon sx={{ fontSize: 16 }} />
                                    </button>
                                </div>

                                <div className="mt-3 relative z-10">
                                    <h3 className="text-2xl font-black tracking-tight">$4,544</h3>
                                </div>
                            </div>

                            {/* Sub-Widget 2: Mini Interactive Calendar */}
                            <div className="bg-[#171825] border border-[#232538] rounded-2xl p-4 shadow-lg shadow-black/20">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-white">
                                        <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: '#8E92BC' }} />
                                        <span className="text-xs font-bold">Sept 21, 2024</span>
                                    </div>
                                    <button className="text-[#63688E] hover:text-white transition-colors cursor-pointer">
                                        <OpenInFullRoundedIcon sx={{ fontSize: 15 }} />
                                    </button>
                                </div>

                                {/* Days of Week & Date Numbers */}
                                <div className="grid grid-cols-7 gap-1 text-center">
                                    {calendarDays.map((item, idx) => {
                                        const isSelected = idx === activeDateIndex;
                                        return (
                                            <button
                                                key={item.day}
                                                type="button"
                                                onClick={() => setActiveDateIndex(idx)}
                                                className={`flex flex-col items-center py-1.5 rounded-xl transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-white text-gray-950 font-bold shadow-md shadow-white/10'
                                                        : 'text-[#8E92BC] hover:bg-[#202234] hover:text-white'
                                                }`}
                                            >
                                                <span className="text-[9px] font-medium">{item.day}</span>
                                                <span className="text-xs font-extrabold mt-0.5">{item.date}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. RECENT TRANSACTIONS TABLE CARD (Matching Nexmart) */}
                    <div className="bg-[#171825] border border-[#232538] rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/20">
                        {/* Table Header Strip */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white">Transactions</h3>
                            <div className="flex items-center gap-2">
                                <button className="px-2.5 py-1 rounded-lg bg-[#202234] hover:bg-[#282B42] border border-[#2E314A] text-[10px] font-semibold text-slate-300 flex items-center gap-1 transition-colors">
                                    <FilterListRoundedIcon sx={{ fontSize: 13 }} />
                                    <span>Filter</span>
                                </button>
                                <Link
                                    to="/admin/orders"
                                    className="px-2.5 py-1 rounded-lg bg-[#202234] hover:bg-[#282B42] border border-[#2E314A] text-[10px] font-semibold text-slate-300 transition-colors no-underline"
                                >
                                    <span>View all</span>
                                </Link>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="text-[#63688E] border-b border-[#232538] text-[10px] font-bold uppercase tracking-wider">
                                        <th className="pb-3 font-semibold">Customer's ID</th>
                                        <th className="pb-3 font-semibold">Customer Name</th>
                                        <th className="pb-3 font-semibold">Product</th>
                                        <th className="pb-3 font-semibold">Date</th>
                                        <th className="pb-3 font-semibold">Price</th>
                                        <th className="pb-3 font-semibold text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#232538]">
                                    {displayTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-[#1E2033]/50 transition-colors">
                                            <td className="py-3 font-bold text-slate-300">{tx.id}</td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={tx.avatar}
                                                        alt={tx.name}
                                                        className="w-6 h-6 rounded-full object-cover border border-[#343750]"
                                                    />
                                                    <span className="font-semibold text-white">{tx.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-slate-300">{tx.product}</td>
                                            <td className="py-3 text-[#63688E] text-[11px]">{tx.date}</td>
                                            <td className="py-3 font-bold text-white">{tx.price}</td>
                                            <td className="py-3 text-right">
                                                <span
                                                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        tx.statusColor === "paid"
                                                            ? 'bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30'
                                                            : (tx.statusColor === "pending"
                                                                ? 'bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30'
                                                                : 'bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30')
                                                    }`}
                                                >
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* =========================================================================
                    RIGHT SIDEBAR COLUMN (4 of 12 cols on desktop)
                   ========================================================================= */}
                <div className="lg:col-span-4 space-y-5">
                    
                    {/* 1. ORDERS OVERVIEW CARD (With Progress Bars) */}
                    <div className="bg-[#171825] border border-[#232538] rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/20">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white">Orders Overview</h3>
                            <Link to="/admin/orders" className="text-[10px] font-bold text-[#8E92BC] hover:text-white transition-colors no-underline">
                                View details
                            </Link>
                        </div>

                        {/* Progress Rows */}
                        <div className="space-y-3.5">
                            {/* Delivered */}
                            <div>
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-slate-300">Delivered</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold">750</span>
                                        <span className="text-[10px] text-[#63688E]">60%</span>
                                    </div>
                                </div>
                                <div className="w-full h-2 rounded-full bg-[#202234] overflow-hidden">
                                    <div className="h-full bg-[#F97316] rounded-full transition-all" style={{ width: '60%' }}></div>
                                </div>
                            </div>

                            {/* Shipped */}
                            <div>
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-slate-300">Shipped</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold">250</span>
                                        <span className="text-[10px] text-[#63688E]">20%</span>
                                    </div>
                                </div>
                                <div className="w-full h-2 rounded-full bg-[#202234] overflow-hidden">
                                    <div className="h-full bg-[#FB923C] rounded-full transition-all" style={{ width: '20%' }}></div>
                                </div>
                            </div>

                            {/* Pending */}
                            <div>
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-slate-300">Pending</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold">188</span>
                                        <span className="text-[10px] text-[#63688E]">15%</span>
                                    </div>
                                </div>
                                <div className="w-full h-2 rounded-full bg-[#202234] overflow-hidden">
                                    <div className="h-full bg-[#FDBA74] rounded-full transition-all" style={{ width: '15%' }}></div>
                                </div>
                            </div>

                            {/* Cancelled */}
                            <div>
                                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-slate-300">Cancelled</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold">63</span>
                                        <span className="text-[10px] text-[#63688E]">5%</span>
                                    </div>
                                </div>
                                <div className="w-full h-2 rounded-full bg-[#202234] overflow-hidden">
                                    <div className="h-full bg-[#475569] rounded-full transition-all" style={{ width: '5%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. TOP PRODUCTS CARD (Matching Reference Image) */}
                    <div className="bg-[#171825] border border-[#232538] rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/20">
                        <div className="flex items-center justify-between mb-3.5">
                            <h3 className="text-sm font-bold text-white">Top Products</h3>
                            <Link to="/admin/products" className="text-[10px] font-bold text-[#8E92BC] hover:text-white transition-colors no-underline">
                                View all
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {displayTopProducts.map((prod) => (
                                <div key={prod.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#1E2033]/60 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={prod.image}
                                            alt={prod.name}
                                            className="w-10 h-10 rounded-xl object-cover border border-[#2B2E44] shrink-0"
                                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80"; }}
                                        />
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-white truncate">{prod.name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-[#63688E]">{prod.category}</span>
                                                <span className="text-[9px] font-bold text-[#34D399]">{prod.stock}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-extrabold text-white shrink-0 ml-2">{prod.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. TOP CUSTOMERS CARD (Matching Reference Image) */}
                    <div className="bg-[#171825] border border-[#232538] rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/20">
                        <div className="flex items-center justify-between mb-3.5">
                            <h3 className="text-sm font-bold text-white">Top Customers</h3>
                            <Link to="/admin/users" className="text-[10px] font-bold text-[#8E92BC] hover:text-white transition-colors no-underline">
                                View all
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {displayTopCustomers.map((cust, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#1E2033]/60 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={cust.avatar}
                                            alt={cust.name}
                                            className="w-9 h-9 rounded-full object-cover border border-[#2B2E44] shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-white truncate">{cust.name}</h4>
                                            <p className="text-[10px] text-[#63688E] truncate">
                                                {cust.email} <span className="text-slate-400">Orders: {cust.orders}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-extrabold text-white shrink-0 ml-2">{cust.spent}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. ACTIVE UPI RECEIVER CARD (Flipkart Dynamic Gateway) */}
                    <div className="bg-gradient-to-br from-[#181926] to-[#1E2033] border border-[#5B5CE5]/30 rounded-2xl p-4 shadow-lg shadow-black/20 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#34D399]">
                                    Live Gateway Active
                                </span>
                            </div>
                            <Link
                                to="/admin/upi-settings"
                                className="text-[10px] font-bold text-[#5B5CE5] hover:text-white transition-colors no-underline"
                            >
                                Change UPI ID ↗
                            </Link>
                        </div>

                        <div className="mt-3">
                            <p className="text-[11px] text-[#8E92BC]">Store Receiver UPI ID:</p>
                            <p className="text-sm font-black text-white font-mono mt-0.5 tracking-tight break-all">
                                {liveUpiId}
                            </p>
                        </div>

                        <Link
                            to="/admin/upi-settings"
                            className="mt-3 w-full py-2 px-3 rounded-xl bg-[#5B5CE5] hover:bg-[#4E4FD9] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#5B5CE5]/25 transition-all no-underline"
                        >
                            <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16 }} />
                            <span>Manage UPI Gateway</span>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MainData;
