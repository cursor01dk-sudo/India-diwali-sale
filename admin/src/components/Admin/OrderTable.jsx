import { useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { clearErrors, deleteOrder, getAllOrders } from '../../actions/orderAction';
import { DELETE_ORDER_RESET } from '../../constants/orderConstants';
import Actions from './Actions';
import { formatDate } from '../../utils/functions';
import MetaData from '../Layouts/MetaData';
import BackdropLoader from '../Layouts/BackdropLoader';

const OrderTable = () => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { orders, error } = useSelector((state) => state.allOrders);
    const { loading, isDeleted, error: deleteError } = useSelector((state) => state.order);

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
            enqueueSnackbar("Deleted Successfully", { variant: "success" });
            dispatch({ type: DELETE_ORDER_RESET });
        }
        dispatch(getAllOrders());
    }, [dispatch, error, deleteError, isDeleted, enqueueSnackbar]);

    const deleteOrderHandler = (id) => {
        dispatch(deleteOrder(id));
    }

    const columns = [
        {
            field: "id",
            headerName: "Order ID",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 150,
            flex: 0.2,
            renderCell: (params) => {
                return (
                    <>
                        {
                            params.row.status === "Delivered" ? (
                                <span className="text-[10px] bg-[#10B981]/15 border border-[#10B981]/30 py-0.5 px-2.5 font-bold uppercase rounded-full text-[#34D399]">{params.row.status}</span>
                            ) : params.row.status === "Shipped" ? (
                                <span className="text-[10px] bg-[#3B82F6]/15 border border-[#3B82F6]/30 py-0.5 px-2.5 font-bold uppercase rounded-full text-[#60A5FA]">{params.row.status}</span>
                            ) : (
                                <span className="text-[10px] bg-[#F59E0B]/15 border border-[#F59E0B]/30 py-0.5 px-2.5 font-bold uppercase rounded-full text-[#FBBF24]">{params.row.status}</span>
                            )
                        }
                    </>
                )
            },
        },
        {
            field: "itemsQty",
            headerName: "Items Qty",
            type: "number",
            minWidth: 100,
            flex: 0.1,
        },
        {
            field: "amount",
            headerName: "Amount",
            type: "number",
            minWidth: 200,
            flex: 0.2,
            renderCell: (params) => {
                return (
                    <span>₹{params.row.amount.toLocaleString()}</span>
                );
            },
        },
        {
            field: "orderOn",
            headerName: "Order On",
            type: "date",
            minWidth: 200,
            flex: 0.5,
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 100,
            flex: 0.3,
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <Actions editRoute={"order"} deleteHandler={deleteOrderHandler} id={params.row.id} />
                );
            },
        },
    ];

    const rows = [];

    orders && orders.forEach((order) => {
        rows.unshift({
            id: order._id,
            itemsQty: order.orderItems.length,
            amount: order.totalPrice,
            orderOn: formatDate(order.createdAt),
            status: order.orderStatus,
        });
    });

    return (
        <div className="space-y-4">
            <MetaData title="Admin Orders | Nexmart" />

            {loading && <BackdropLoader />}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight uppercase">Orders & Shipments</h1>
                    <p className="text-xs text-[#8E92BC] mt-0.5">Track live customer orders, courier dispatch & delivery status</p>
                </div>
            </div>

            <div className="bg-[#171825] rounded-2xl shadow-xl border border-[#232538] p-2 w-full overflow-hidden" style={{ height: 560 }}>

                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    disableSelectIconOnClick
                    sx={{
                        boxShadow: 0,
                        border: 0,
                        color: '#f1f5f9',
                        '& .MuiDataGrid-cell': {
                            borderColor: '#232538',
                            color: '#f1f5f9',
                            fontSize: '12px'
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#1E2033',
                            borderColor: '#232538',
                            color: '#8E92BC',
                            fontWeight: 'bold',
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderColor: '#232538',
                            color: '#8E92BC',
                            backgroundColor: '#1E2033',
                        },
                        '& .MuiTablePagination-root': {
                            color: '#8E92BC',
                        },
                        '& .MuiIconButton-root': {
                            color: '#8E92BC',
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default OrderTable;
