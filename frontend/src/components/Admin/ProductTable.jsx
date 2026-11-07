import { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import { clearErrors, deleteProduct, getAdminProducts } from '../../actions/productAction';
import Rating from '@mui/material/Rating';
import { DELETE_PRODUCT_RESET } from '../../constants/productConstants';
import Actions from './Actions';
import MetaData from '../Layouts/MetaData';
import BackdropLoader from '../Layouts/BackdropLoader';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { fallbackProducts } from '../../data/storeFallbackData';

const ProductTable = () => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { products, error } = useSelector((state) => state.products);
    const { loading, isDeleted, error: deleteError } = useSelector((state) => state.product);

    // Featured "Best Gadgets & Appliances" Modal State
    const [showGadgetsModal, setShowGadgetsModal] = useState(false);
    const [selectedGadgetIds, setSelectedGadgetIds] = useState([]);
    const [gadgetSearchQuery, setGadgetSearchQuery] = useState('');
    const [savingGadgets, setSavingGadgets] = useState(false);
    const [localProducts, setLocalProducts] = useState([]);

    useEffect(() => {
        const sourceProducts = (products && products.length > 0) ? products : fallbackProducts;
        setLocalProducts(sourceProducts);
        const currentlyFeatured = sourceProducts.filter(p => p.inBestGadgets).map(p => p._id);
        setSelectedGadgetIds(currentlyFeatured);
    }, [products]);

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        if (deleteError) {
            enqueueSnackbar(deleteError, { variant: "error" });
            dispatch(clearErrors());
        }
        if (isDeleted) {
            enqueueSnackbar("Product Deleted Successfully", { variant: "success" });
            dispatch({ type: DELETE_PRODUCT_RESET });
        }
        dispatch(getAdminProducts());
    }, [dispatch, error, deleteError, isDeleted, enqueueSnackbar]);

    const deleteProductHandler = (id) => {
        dispatch(deleteProduct(id));
    }

    const toggleTopSelling = async (id, currentStatus) => {
        const nextStatus = !currentStatus;

        // Instant optimistic update on UI so the button changes immediately in 0ms!
        setLocalProducts(prev => prev.map(p => {
            if (p._id === id) {
                return {
                    ...p,
                    isTopSelling: nextStatus,
                    priority: nextStatus ? 100 : 0
                };
            }
            return p;
        }));

        enqueueSnackbar(nextStatus ? "★ Selected as Top Selling (Pinned 1st)!" : "Unselected from Top Selling (Normal)", {
            variant: nextStatus ? "success" : "info"
        });

        try {
            await axios.put(`/api/v1/admin/product/${id}`, {
                isTopSelling: nextStatus,
                priority: nextStatus ? 100 : 0
            });
        } catch (err) {
            // Revert if error
            setLocalProducts(prev => prev.map(p => {
                if (p._id === id) {
                    return {
                        ...p,
                        isTopSelling: currentStatus,
                        priority: currentStatus ? 100 : 0
                    };
                }
                return p;
            }));
            enqueueSnackbar(err.response?.data?.message || "Failed to update status", { variant: "error" });
        }
    };

    const toggleBestGadgets = async (id, currentStatus) => {
        const nextStatus = !currentStatus;

        // Instant optimistic update
        setLocalProducts(prev => prev.map(p => {
            if (p._id === id) {
                return {
                    ...p,
                    inBestGadgets: nextStatus
                };
            }
            return p;
        }));

        enqueueSnackbar(nextStatus ? "✨ Selected for Best Gadgets!" : "Removed from Best Gadgets", {
            variant: nextStatus ? "success" : "info"
        });

        try {
            await axios.put(`/api/v1/admin/product/${id}`, {
                inBestGadgets: nextStatus
            });
        } catch (err) {
            setLocalProducts(prev => prev.map(p => {
                if (p._id === id) {
                    return {
                        ...p,
                        inBestGadgets: currentStatus
                    };
                }
                return p;
            }));
            enqueueSnackbar(err.response?.data?.message || "Failed to update status", { variant: "error" });
        }
    };

    const handleToggleGadgetSelected = (id) => {
        setSelectedGadgetIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const saveFeaturedGadgets = async () => {
        setSavingGadgets(true);
        try {
            await axios.put('/api/v1/admin/products/featured-gadgets', {
                productIds: selectedGadgetIds
            });
            enqueueSnackbar(`Updated "Best Gadgets & Appliances" with ${selectedGadgetIds.length} products!`, { variant: "success" });
            dispatch(getAdminProducts());
            setShowGadgetsModal(false);
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || "Failed to update featured gadgets", { variant: "error" });
        } finally {
            setSavingGadgets(false);
        }
    };

    const columns = [
        {
            field: "id",
            headerName: "Product ID",
            minWidth: 100,
            flex: 0.5,
        },
        {
            field: "name",
            headerName: "Name",
            minWidth: 200,
            flex: 1,
            renderCell: (params) => {
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full">
                            <img draggable="false" src={params.row.image} alt={params.row.name} className="w-full h-full rounded-full object-cover" />
                        </div>
                        {params.row.name}
                    </div>
                )
            },
        },
        {
            field: "category",
            headerName: "Category",
            minWidth: 100,
            flex: 0.1,
        },
        {
            field: "stock",
            headerName: "Stock",
            type: "number",
            headerAlign: "left",
            align: "left",
            minWidth: 70,
            flex: 0.1,
            renderCell: (params) => {
                return (
                    <>
                        {
                            params.row.stock < 10 ? (
                                <span className="font-medium text-red-700 rounded-full bg-red-200 p-1 w-6 h-6 flex items-center justify-center">{params.row.stock}</span>
                            ) : (
                                <span className="">{params.row.stock}</span>
                            )
                        }
                    </>
                )
            },
        },
        {
            field: "price",
            headerName: "Price",
            type: "number",
            minWidth: 100,
            headerAlign: "left",
            align: "left",
            flex: 0.2,
            renderCell: (params) => {
                return (
                    <span>₹{params.row.price.toLocaleString()}</span>
                );
            },
        },
        {
            field: "cprice",
            headerName: "Cutted Price",
            type: "number",
            minWidth: 100,
            headerAlign: "left",
            align: "left",
            flex: 0.2,
            renderCell: (params) => {
                return (
                    <span>₹{params.row.cprice.toLocaleString()}</span>
                );
            },
        },
        {
            field: "rating",
            headerName: "Rating",
            type: "number",
            minWidth: 100,
            flex: 0.1,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => {
                return <Rating readOnly value={params.row.rating} size="small" precision={0.5} />
            }
        },
        {
            field: "isTopSelling",
            headerName: "Top Selling / Pinned",
            minWidth: 185,
            flex: 0.3,
            renderCell: (params) => {
                const isTop = params.row.isTopSelling;
                return (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleTopSelling(params.row.id, isTop);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                            isTop
                                ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-gray-950 border-2 border-amber-300 font-black shadow-md shadow-amber-400/30 ring-2 ring-amber-400/20 hover:brightness-105'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                        }`}
                        title={isTop ? "Selected as Top Selling - Click to unselect" : "Click to select and pin to top"}
                    >
                        <span>{isTop ? '★ Top Selling (Selected)' : '☆ Normal (Select)'}</span>
                    </button>
                );
            }
        },
        {
            field: "inBestGadgets",
            headerName: "Best Gadgets (Home)",
            minWidth: 185,
            flex: 0.3,
            renderCell: (params) => {
                const inGadgets = params.row.inBestGadgets;
                return (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleBestGadgets(params.row.id, inGadgets);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                            inGadgets
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-2 border-indigo-400 font-black shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400/20 hover:brightness-105'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                        }`}
                        title={inGadgets ? "Selected for Best Gadgets on Home - Click to unselect" : "Click to select for Best Gadgets on Home"}
                    >
                        <span>{inGadgets ? '✨ In Gadgets (Selected)' : '+ Add to Gadgets'}</span>
                    </button>
                );
            }
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 100,
            flex: 0.25,
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <Actions editRoute={"product"} deleteHandler={deleteProductHandler} id={params.row.id} />
                );
            },
        },
    ];

    const rows = [];

    localProducts && localProducts.forEach((item) => {
        rows.push({
            id: item._id,
            name: item.name,
            image: item.images && item.images[0] ? item.images[0].url : '',
            category: item.category,
            stock: item.stock,
            price: item.price,
            cprice: item.cuttedPrice,
            rating: item.ratings,
            isTopSelling: Boolean(item.isTopSelling),
            inBestGadgets: Boolean(item.inBestGadgets),
        });
    });

    const filteredGadgetProducts = localProducts ? localProducts.filter(p =>
        (p.name && p.name.toLowerCase().includes(gadgetSearchQuery.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(gadgetSearchQuery.toLowerCase()))
    ) : [];

    const selectedProductsList = localProducts ? localProducts.filter(p => selectedGadgetIds.includes(p._id)) : [];

    return (
        <>
            <MetaData title="Admin Products | Flipkart" />

            {loading && <BackdropLoader />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight uppercase">Products Catalog</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Manage live store inventory, featured homepage showcases, and prices</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Featured Gadgets Selector Button */}
                    <button
                        type="button"
                        onClick={() => setShowGadgetsModal(true)}
                        className="py-2 px-3.5 rounded-xl shadow font-black text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center gap-1.5 transition-all shadow-indigo-600/30 cursor-pointer"
                    >
                        <span>✨ Select "Best Gadgets" ({localProducts.filter(p => p.inBestGadgets).length} Featured)</span>
                    </button>

                    <Link to="/admin/import-flipkart" className="py-2 px-3 sm:px-4 rounded-xl shadow font-black text-xs bg-amber-400 text-gray-950 hover:bg-amber-500 flex items-center gap-1 transition-all shadow-amber-400/20">
                        <span>⚡ Import Flipkart URL</span>
                    </Link>
                    <Link to="/admin/new_product" className="py-2 px-4 rounded-xl shadow font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-blue-500/20">
                        + New Product
                    </Link>
                </div>
            </div>

            {/* Quick Status Bar - Confirming 1 Single Page With No Next Pages */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 px-1 py-1.5 bg-[#0f172a] rounded-xl border border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">
                        Total: <span className="text-white font-extrabold">{rows.length} Products</span> (Single Page - No Next Pages)
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs bg-amber-400/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                        ★ {localProducts.filter(p => p.isTopSelling).length} Top Selling Selected
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                        ✨ {localProducts.filter(p => p.inBestGadgets).length} Best Gadgets Selected
                    </span>
                </div>
                <div className="text-[11px] text-slate-400 italic">
                    💡 Click any button to instantly select / unselect. All products scroll on 1 single page.
                </div>
            </div>

            {/* DataGrid - All Products on ONE Page (Zero Next Pages) */}
            <div className="bg-[#131c31] rounded-2xl shadow-xl border border-slate-800 p-2 w-full overflow-hidden mt-3" style={{ height: 'calc(100vh - 220px)', minHeight: 650 }}>

                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={rows.length || 100}
                    rowsPerPageOptions={[rows.length || 100]}
                    hideFooter={true}
                    hideFooterPagination={true}
                    disableSelectIconOnClick
                    sx={{
                        boxShadow: 0,
                        border: 0,
                        color: '#f1f5f9',
                        '& .MuiDataGrid-cell': {
                            borderColor: '#1e293b',
                            color: '#f1f5f9',
                            fontSize: '12px'
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#0f172a',
                            borderColor: '#1e293b',
                            color: '#cbd5e1',
                            fontWeight: 'bold',
                        },
                        '& .MuiDataGrid-footerContainer': {
                            display: 'none', // completely removed pagination bar
                        },
                    }}
                />
            </div>

            {/* MODAL: Select Products for "Best Gadgets & Appliances" */}
            {showGadgetsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#131c31]">
                            <div>
                                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                    <span className="text-amber-400">✨</span>
                                    <span>Select Products for "Best Gadgets & Appliances"</span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Choose the exact products to display in the 4-card grid on your storefront homepage.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowGadgetsModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <CloseIcon sx={{ fontSize: 18 }} />
                            </button>
                        </div>

                        {/* Live Selected Preview Strip */}
                        <div className="px-6 py-3 bg-[#17223b] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                    Currently Selected:
                                </span>
                                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                                    selectedGadgetIds.length === 4
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                }`}>
                                    {selectedGadgetIds.length} {selectedGadgetIds.length === 4 ? '(Perfect 4-Grid Fit)' : 'Selected'}
                                </span>
                            </div>

                            {/* Mini Previews */}
                            <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
                                {selectedProductsList.map((p) => (
                                    <div
                                        key={p._id}
                                        className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-2 py-1 rounded-lg shrink-0 group"
                                    >
                                        <img
                                            src={p.images && p.images[0] ? p.images[0].url : ''}
                                            alt={p.name}
                                            className="w-6 h-6 object-contain rounded bg-white p-0.5"
                                        />
                                        <span className="text-[11px] text-white font-medium max-w-[120px] truncate">
                                            {p.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleGadgetSelected(p._id)}
                                            className="text-slate-400 hover:text-red-400 cursor-pointer ml-1"
                                            title="Remove"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                {selectedProductsList.length === 0 && (
                                    <span className="text-xs text-slate-500 italic">No products selected yet. Click products below to add.</span>
                                )}
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="p-4 border-b border-slate-800 bg-[#0f172a]">
                            <div className="relative">
                                <SearchIcon sx={{ fontSize: 18, color: '#64748b' }} className="absolute left-3.5 top-3" />
                                <input
                                    type="text"
                                    placeholder="Search products by title or category..."
                                    value={gadgetSearchQuery}
                                    onChange={(e) => setGadgetSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#131c31] border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl focus:border-indigo-500 focus:outline-hidden"
                                />
                            </div>
                        </div>

                        {/* Products Grid to Select */}
                        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {filteredGadgetProducts.map((p) => {
                                const isSelected = selectedGadgetIds.includes(p._id);
                                return (
                                    <div
                                        key={p._id}
                                        onClick={() => handleToggleGadgetSelected(p._id)}
                                        className={`relative p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center ${
                                            isSelected
                                                ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                                                : 'bg-[#131c31] border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                                        }`}
                                    >
                                        <div className="w-14 h-14 shrink-0 rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden border border-slate-700">
                                            <img
                                                src={p.images && p.images[0] ? p.images[0].url : ''}
                                                alt={p.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-slate-100 truncate mb-0.5" title={p.name}>
                                                {p.name}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-extrabold text-emerald-400">
                                                    ₹{p.price?.toLocaleString()}
                                                </span>
                                                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                                    {p.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Selection Checkbox / Indicator */}
                                        <div className="shrink-0">
                                            {isSelected ? (
                                                <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-xs">
                                                    <CheckCircleIcon sx={{ fontSize: 18 }} />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border border-slate-600 hover:border-slate-400"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-800 bg-[#131c31] flex items-center justify-between gap-3">
                            <span className="text-xs text-slate-400">
                                Selected items will immediately display on the homepage after saving.
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowGadgetsModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={savingGadgets}
                                    onClick={saveFeaturedGadgets}
                                    className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {savingGadgets ? (
                                        <span>Saving...</span>
                                    ) : (
                                        <>
                                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                                            <span>Save & Update Homepage</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default ProductTable;