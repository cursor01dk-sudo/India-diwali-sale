import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { clearErrors, deleteReview, getAllReviews } from '../../actions/productAction';
import Rating from '@mui/material/Rating';
import Actions from './Actions';
import { DELETE_REVIEW_RESET } from '../../constants/productConstants';
import MetaData from '../Layouts/MetaData';
import BackdropLoader from '../Layouts/BackdropLoader';

const ReviewsTable = () => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [productId, setProductId] = useState("");

    const { reviews, error } = useSelector((state) => state.reviews);
    const { loading, isDeleted, error: deleteError } = useSelector((state) => state.review);

    useEffect(() => {
        if (productId.length === 24) {
            dispatch(getAllReviews(productId));
        }
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        if (deleteError) {
            enqueueSnackbar(deleteError, { variant: "error" });
            dispatch(clearErrors());
        }
        if (isDeleted) {
            enqueueSnackbar("Review Deleted Successfully", { variant: "success" });
            dispatch({ type: DELETE_REVIEW_RESET });
        }
    }, [dispatch, error, deleteError, isDeleted, productId, enqueueSnackbar]);

    const deleteReviewHandler = (id) => {
        dispatch(deleteReview(id, productId));
    }

    const columns = [
        {
            field: "id",
            headerName: "Review ID",
            minWidth: 200,
            flex: 0.5,
        },
        {
            field: "user",
            headerName: "User",
            minWidth: 150,
            flex: 0.5,
        },
        {
            field: "rating",
            headerName: "Rating",
            type: "number",
            minWidth: 200,
            flex: 0.3,
            align: "left",
            headerAlign: "left",
            renderCell: (params) => {
                return <Rating readOnly value={params.row.rating} size="small" precision={0.5} />
            }
        },
        {
            field: "comment",
            headerName: "Comment",
            minWidth: 200,
            flex: 0.5,
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 150,
            flex: 0.3,
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <Actions editRoute={"review"} deleteHandler={deleteReviewHandler} id={params.row.id} />
                );
            },
        },
    ];

    const rows = [];

    reviews && reviews.forEach((rev) => {
        rows.push({
            id: rev._id,
            rating: rev.rating,
            comment: rev.comment,
            user: rev.name,
        });
    });

    return (
        <>
            <MetaData title="Admin Reviews | Flipkart" />

            {loading && <BackdropLoader />}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight uppercase">Customer Reviews</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Filter and moderate verified customer feedback</p>
                </div>
                <input 
                    type="text" 
                    placeholder="Enter Product ID to inspect reviews..." 
                    value={productId} 
                    onChange={(e) => setProductId(e.target.value)} 
                    className="outline-none bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2 text-xs w-full sm:w-72 shadow-inner focus:border-blue-500 transition-colors" 
                />
            </div>
            <div className="bg-[#131c31] rounded-2xl shadow-xl border border-slate-800 p-2 w-full overflow-hidden" style={{ height: 500 }}>

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
                            borderColor: '#1e293b',
                            color: '#94a3b8',
                            backgroundColor: '#0f172a',
                        },
                        '& .MuiTablePagination-root': {
                            color: '#94a3b8',
                        },
                        '& .MuiIconButton-root': {
                            color: '#94a3b8',
                        },
                    }}
                />
            </div>
        </>
    );
};

export default ReviewsTable;