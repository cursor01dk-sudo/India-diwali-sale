import CircularProgress from '@mui/material/CircularProgress';

const Loading = () => {
    return (
        <div className="flex items-center justify-center py-16">
            <CircularProgress sx={{ color: '#3b82f6' }} />
        </div>
    );
};

export default Loading;
