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
                    <Link to={`/admin/${editRoute}/${id}`} className="text-[#818CF8] hover:bg-[#5B5CE5]/25 p-1.5 rounded-lg bg-[#5B5CE5]/15 border border-[#5B5CE5]/30 flex items-center justify-center transition-colors no-underline">
                        <EditIcon sx={{ fontSize: 16 }} />
                    </Link>
                )}
                <button onClick={() => setOpen(true)} className="text-[#F87171] hover:bg-[#EF4444]/25 p-1.5 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center transition-colors cursor-pointer">
                    <DeleteIcon sx={{ fontSize: 16 }} />
                </button>
            </div>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                PaperProps={{
                    sx: {
                        backgroundColor: '#171825',
                        color: '#f8fafc',
                        border: '1px solid #232538',
                        borderRadius: '20px',
                        padding: '12px'
                    }
                }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ color: '#ffffff', fontWeight: 800 }}>
                    {"Are you sure?"}
                </DialogTitle>
                <DialogContent>
                    <p className="text-[#8E92BC] text-sm">Do you really want to delete{name && <span className="font-bold text-white">&nbsp;{name}</span>}? This process cannot be undone.</p>
                </DialogContent>
                <DialogActions sx={{ padding: '12px 16px' }}>
                    <button onClick={handleClose} className="py-2 px-5 rounded-xl border border-[#2E314A] bg-[#202234] hover:bg-[#282B42] text-slate-300 font-bold text-xs cursor-pointer transition-colors">Cancel</button>
                    <button onClick={() => deleteHandler(id)} className="py-2 px-5 ml-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs shadow-md cursor-pointer transition-colors">Delete</button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Actions;
