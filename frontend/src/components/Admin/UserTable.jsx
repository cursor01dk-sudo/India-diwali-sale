import { useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { clearErrors, deleteUser, getAllUsers } from '../../actions/userAction';
import { DELETE_USER_RESET } from '../../constants/userConstants';
import Actions from './Actions';
import MetaData from '../Layouts/MetaData';
import BackdropLoader from '../Layouts/BackdropLoader';

const UserTable = () => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { users, error } = useSelector((state) => state.users);
    const { loading, isDeleted, error: deleteError } = useSelector((state) => state.profile);

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
            enqueueSnackbar("User Deleted Successfully", { variant: "success" });
            dispatch({ type: DELETE_USER_RESET });
        }
        dispatch(getAllUsers());
    }, [dispatch, error, deleteError, isDeleted, enqueueSnackbar]);

    const deleteUserHandler = (id) => {
        dispatch(deleteUser(id));
    }

    const columns = [
        {
            field: "name",
            headerName: "Name",
            minWidth: 200,
            flex: 1,
            renderCell: (params) => {
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full">
                            <img draggable="false" src={params.row.avatar} alt={params.row.name} className="w-full h-full rounded-full object-cover" />
                        </div>
                        {params.row.name}
                    </div>
                )
            },
        },
        {
            field: "email",
            headerName: "Email",
            minWidth: 200,
            flex: 0.2,
        },
        {
            field: "gender",
            headerName: "Gender",
            minWidth: 100,
            flex: 0.1,
        },
        {
            field: "role",
            headerName: "Role",
            minWidth: 100,
            flex: 0.2,
            renderCell: (params) => {
                return (
                    <>
                        {
                            params.row.role === "admin" ? (
                                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 font-bold rounded-md capitalize">{params.row.role}</span>
                            ) : (
                                <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 font-bold rounded-md capitalize">{params.row.role}</span>
                            )
                        }
                    </>
                )
            },
        },
        {
            field: "registeredOn",
            headerName: "Registered On",
            type: "date",
            minWidth: 150,
            flex: 0.2,
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 200,
            flex: 0.3,
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <Actions editRoute={"user"} deleteHandler={deleteUserHandler} id={params.row.id} name={params.row.name} />
                );
            },
        },
    ];

    const rows = [];

    users && users.forEach((item) => {
        rows.unshift({
            id: item._id,
            name: item.name,
            avatar: item.avatar.url,
            email: item.email,
            gender: item.gender.toUpperCase(),
            role: item.role,
            registeredOn: new Date(item.createdAt).toISOString().substring(0, 10),
        });
    });

    return (
        <>
            <MetaData title="Admin Users | Flipkart" />

            {loading && <BackdropLoader />}

            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight uppercase">User Accounts</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Manage registered customer accounts and role permissions</p>
                </div>
            </div>
            <div className="bg-[#131c31] rounded-2xl shadow-xl border border-slate-800 p-2 w-full overflow-hidden" style={{ height: 520 }}>

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

export default UserTable;