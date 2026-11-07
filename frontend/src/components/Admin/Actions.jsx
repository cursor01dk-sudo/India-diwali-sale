import { useState } from 'react';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

const Actions = ({ id, deleteHandler, name, editRoute }) => {

    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <div className="flex justify-between items-center gap-2">
                {editRoute !== "review" && (
                    <Link to={`/admin/${editRoute}/${id}`} className="text-blue-400 hover:bg-blue-500/30 p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center transition-colors">
                        <EditIcon sx={{ fontSize: 18 }} />
                    </Link>
                )}
                <button onClick={() => setOpen(true)} className="text-red-400 hover:bg-red-500/30 p-1.5 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center transition-colors cursor-pointer">
                    <DeleteIcon sx={{ fontSize: 18 }} />
                </button>
            </div>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                PaperProps={{
                    sx: {
                        backgroundColor: '#131c31',
                        color: '#f8fafc',
                        border: '1px solid #334155',
                        borderRadius: '16px',
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ color: '#ffffff', fontWeight: 800 }}>
                    {"Are you sure?"}
                </DialogTitle>
                <DialogContent>
                    <p className="text-slate-300 text-sm">Do you really want to delete{name && <span className="font-bold text-white">&nbsp;{name}</span>}? This process cannot be undone.</p>
                </DialogContent>
                <DialogActions sx={{ padding: '12px 16px' }}>
                    <button onClick={handleClose} className="py-2 px-5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors">Cancel</button>
                    <button onClick={() => deleteHandler(id)} className="py-2 px-5 ml-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md cursor-pointer transition-colors">Delete</button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Actions;
