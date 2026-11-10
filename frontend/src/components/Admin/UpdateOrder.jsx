import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { clearErrors, getOrderDetails, updateOrder } from '../../actions/orderAction';
import { UPDATE_ORDER_RESET } from '../../constants/orderConstants';
import { formatDate } from '../../utils/functions';
import TrackStepper from '../Order/TrackStepper';
import Loading from './Loading';
import { Link } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import MetaData from '../Layouts/MetaData';

const UpdateOrder = () => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const params = useParams();

    const [status, setStatus] = useState("");

    const { order, error, loading } = useSelector((state) => state.orderDetails);
    const { isUpdated, error: updateError } = useSelector((state) => state.order);

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        if (updateError) {
            enqueueSnackbar(updateError, { variant: "error" });
            dispatch(clearErrors());
        }
        if (isUpdated) {
            enqueueSnackbar("Order Updates Successfully", { variant: "success" });
            dispatch({ type: UPDATE_ORDER_RESET });
        }
        dispatch(getOrderDetails(params.id));
    }, [dispatch, error, params.id, isUpdated, updateError, enqueueSnackbar]);

    const updateOrderSubmitHandler = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set("status", status);
        dispatch(updateOrder(params.id, formData));
    }

    return (
        <>
            <MetaData title="Admin: Update Order | Flipkart" />

            {loading ? <Loading /> : (
                <>
                    {order && order.shippingInfo && (
                        <div className="flex flex-col gap-4">
                            <Link to="/admin/orders" className="ml-1 flex items-center gap-1 font-bold text-blue-400 hover:text-blue-300 uppercase text-xs">
                                <ArrowBackIosIcon sx={{ fontSize: "14px" }} />
                                <span>Go Back to Orders</span>
                            </Link>

                            <div className="flex flex-col sm:flex-row bg-[#171825] border border-[#232538] shadow-lg rounded-2xl min-w-full text-slate-100">
                                <div className="sm:w-1/2 border-b sm:border-b-0 sm:border-r border-[#232538]">
                                    <div className="flex flex-col gap-3 my-6 mx-8">
                                        <h3 className="font-extrabold text-base text-white border-b border-[#232538] pb-2">Delivery Address</h3>
                                        <h4 className="font-bold text-white text-sm">{order.user ? order.user.name : (order.shippingInfo.name || "Guest Customer")}</h4>
                                        <p className="text-xs text-slate-300">{`${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state} - ${order.shippingInfo.pincode}`}</p>
                                        <div className="flex gap-2 text-xs">
                                            <p className="font-bold text-[#8E92BC]">Customer Type:</p>
                                            <p className="text-slate-200">{order.user ? order.user.email : "Guest Checkout"}</p>
                                        </div>
                                        <div className="flex gap-2 text-xs">
                                            <p className="font-bold text-[#8E92BC]">Phone Number:</p>
                                            <p className="text-slate-200">{order.shippingInfo.phoneNo}</p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={updateOrderSubmitHandler} className="flex flex-col gap-3 p-8 sm:w-1/2">
                                    <h3 className="font-extrabold text-base text-white border-b border-[#232538] pb-2">Update Status</h3>
                                    <div className="flex gap-2 text-xs">
                                        <p className="font-bold text-[#8E92BC]">Current Status:</p>
                                        <p className="font-semibold text-[#5B5CE5]">
                                            {order.orderStatus === "Shipped" && (`Shipped on ${formatDate(order.shippedAt)}`)}
                                            {order.orderStatus === "Processing" && (`Ordered on ${formatDate(order.createdAt)}`)}
                                            {order.orderStatus === "Delivered" && (`Delivered on ${formatDate(order.deliveredAt)}`)}
                                        </p>
                                    </div>
                                    <FormControl fullWidth sx={{
                                        marginTop: 1,
                                        '& .MuiInputLabel-root': { color: '#8E92BC' },
                                        '& .MuiOutlinedInput-root': {
                                            color: '#f8fafc',
                                            backgroundColor: '#10111A',
                                            '& fieldset': { borderColor: '#26283D' },
                                            '&:hover fieldset': { borderColor: '#5B5CE5' },
                                            '&.Mui-focused fieldset': { borderColor: '#5B5CE5' },
                                        },
                                        '& .MuiSvgIcon-root': { color: '#8E92BC' }
                                    }}>
                                        <InputLabel id="order-status-select-label">Status</InputLabel>
                                        <Select
                                            labelId="order-status-select-label"
                                            id="order-status-select"
                                            value={status}
                                            label="Status"
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            {order.orderStatus === "Shipped" && (<MenuItem value={"Delivered"}>Delivered</MenuItem>)}
                                            {order.orderStatus === "Processing" && (<MenuItem value={"Shipped"}>Shipped</MenuItem>)}
                                            {order.orderStatus === "Delivered" && (<MenuItem value={"Delivered"}>Delivered</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                    <button type="submit" className="bg-[#5B5CE5] hover:bg-[#4E4FD9] p-2.5 text-white font-bold rounded-xl shadow-md transition-colors mt-2 cursor-pointer">
                                        Update Order Status
                                    </button>
                                </form>
                            </div>

                            {order.orderItems && order.orderItems.map((item) => {

                                const { _id, image, name, price, quantity } = item;

                                return (
                                    <div className="flex flex-col sm:flex-row min-w-full shadow-md rounded-2xl bg-[#131c31] border border-slate-800 px-4 py-5 text-slate-100" key={_id}>

                                        <div className="flex flex-col sm:flex-row sm:w-1/2 gap-3 items-center sm:items-start">
                                            <div className="w-24 h-24 bg-[#0f172a] rounded-xl p-1 border border-slate-800 shrink-0">
                                                <img draggable="false" className="h-full w-full object-contain" src={image} alt={name} />
                                            </div>
                                            <div className="flex flex-col gap-1 overflow-hidden">
                                                <p className="text-xs sm:text-sm font-bold text-white">{name.length > 55 ? `${name.substring(0, 55)}...` : name}</p>
                                                <p className="text-xs text-slate-400 mt-1">Quantity: <strong className="text-white">{quantity}</strong></p>
                                                <p className="text-xs text-slate-400">Price: <strong className="text-white">₹{price.toLocaleString()}</strong></p>
                                                <span className="font-extrabold text-emerald-400 text-sm">Total: ₹{(quantity * price).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col w-full sm:w-1/2 mt-4 sm:mt-0">
                                            <h3 className="font-bold sm:text-center text-xs text-slate-400 uppercase tracking-wider mb-2">Order Tracking Status</h3>
                                            <TrackStepper
                                                orderOn={order.createdAt}
                                                shippedAt={order.shippedAt}
                                                deliveredAt={order.deliveredAt}
                                                activeStep={
                                                    order.orderStatus === "Delivered" ? 2 : order.orderStatus === "Shipped" ? 1 : 0
                                                }
                                            />
                                        </div>

                                    </div>
                                )
                            })
                            }
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default UpdateOrder;
