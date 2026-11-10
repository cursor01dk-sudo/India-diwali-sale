import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { clearErrors, getUserDetails, updateUser } from '../../actions/userAction';
import { UPDATE_USER_RESET, REMOVE_USER_DETAILS } from '../../constants/userConstants';
import Loading from './Loading';
import Avatar from '@mui/material/Avatar';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import MetaData from '../Layouts/MetaData';
import BackdropLoader from '../Layouts/BackdropLoader';

const UpdateUser = () => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const params = useParams();
    const navigate = useNavigate();

    const { user, error, loading } = useSelector((state) => state.userDetails);
    const { isUpdated, error: updateError, loading: updateLoading } = useSelector((state) => state.profile);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [gender, setGender] = useState("");
    const [role, setRole] = useState("");
    const [avatarPreview, setAvatarPreview] = useState("");

    const userId = params.id;

    const updateUserSubmitHandler = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.set("name", name);
        formData.set("email", email);
        formData.set("gender", gender);
        formData.set("role", role);

        dispatch(updateUser(userId, formData));
    }

    useEffect(() => {
        if (user && user._id !== userId) {
            dispatch(getUserDetails(userId));
        } else {
            setName(user.name);
            setEmail(user.email);
            setGender(user.gender);
            setRole(user.role);
            setAvatarPreview(user.avatar.url);
        }
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        if (updateError) {
            enqueueSnackbar(updateError, { variant: "error" });
            dispatch(clearErrors());
        }
        if (isUpdated) {
            enqueueSnackbar("User Updates Successfully", { variant: "success" });
            dispatch({ type: UPDATE_USER_RESET });
            dispatch({ type: REMOVE_USER_DETAILS });
            navigate("/admin/users");
        }
    }, [dispatch, error, userId, user, navigate, isUpdated, updateError, enqueueSnackbar]);

    return (
        <>
            <MetaData title="Admin: Update User | Flipkart" />

            {updateLoading && <BackdropLoader />}

            {loading ? <Loading /> : (
                <div className="space-y-4">
                    <MetaData title="Update User Profile | Nexmart" />

                    <div className="flex flex-col bg-[#171825] border border-[#232538] shadow-xl rounded-2xl mx-auto w-full max-w-xl text-slate-100 overflow-hidden">
                        <div className="bg-[#10111A] border-b border-[#232538] p-5 text-center">
                            <h2 className="text-xl font-extrabold text-white">Update User Profile & Role</h2>
                            <p className="text-xs text-[#8E92BC] mt-1">Manage user account permissions and customer details</p>
                        </div>

                        <form
                            onSubmit={updateUserSubmitHandler}
                            className="p-6 sm:p-8 space-y-5"
                        >
                            <div className="flex flex-col gap-4 items-start w-full">

                                {/* input container column */}
                                <div className="flex flex-col w-full gap-4 items-center">
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        sx={{
                                            '& .MuiInputLabel-root': { color: '#8E92BC' },
                                            '& .MuiOutlinedInput-root': {
                                                color: '#f8fafc',
                                                backgroundColor: '#10111A',
                                                '& fieldset': { borderColor: '#26283D' },
                                                '&:hover fieldset': { borderColor: '#5B5CE5' },
                                                '&.Mui-focused fieldset': { borderColor: '#5B5CE5' },
                                            }
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        sx={{
                                            '& .MuiInputLabel-root': { color: '#8E92BC' },
                                            '& .MuiOutlinedInput-root': {
                                                color: '#f8fafc',
                                                backgroundColor: '#10111A',
                                                '& fieldset': { borderColor: '#26283D' },
                                                '&:hover fieldset': { borderColor: '#5B5CE5' },
                                                '&.Mui-focused fieldset': { borderColor: '#5B5CE5' },
                                            }
                                        }}
                                    />
                                </div>

                                {/* gender input */}
                                <div className="flex gap-4 items-center w-full bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                                    <h2 className="text-xs font-bold text-slate-300">Gender:</h2>
                                    <div className="flex items-center gap-6 text-slate-200" id="radioInput">
                                        <RadioGroup
                                            row
                                            aria-labelledby="radio-buttons-group-label"
                                            name="radio-buttons-group"
                                        >
                                            <FormControlLabel
                                                name="gender"
                                                value="male"
                                                checked={gender === "male"}
                                                onChange={(e) => setGender(e.target.value)}
                                                control={<Radio required sx={{ color: '#64748b', '&.Mui-checked': { color: '#3b82f6' } }} />}
                                                label={<span className="text-xs text-slate-200">Male</span>}
                                            />
                                            <FormControlLabel
                                                name="gender"
                                                value="female"
                                                checked={gender === "female"}
                                                onChange={(e) => setGender(e.target.value)}
                                                control={<Radio required sx={{ color: '#64748b', '&.Mui-checked': { color: '#3b82f6' } }} />}
                                                label={<span className="text-xs text-slate-200">Female</span>}
                                            />
                                        </RadioGroup>
                                    </div>
                                </div>

                                <div className="flex flex-col w-full justify-between sm:flex-row gap-4 items-center">
                                    <Avatar
                                        alt="Avatar Preview"
                                        src={avatarPreview}
                                        sx={{ width: 56, height: 56, border: '2px solid #3b82f6' }}
                                    />
                                    <TextField
                                        label="Role"
                                        select
                                        fullWidth
                                        variant="outlined"
                                        required
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        sx={{
                                            '& .MuiInputLabel-root': { color: '#94a3b8' },
                                            '& .MuiOutlinedInput-root': {
                                                color: '#f8fafc',
                                                backgroundColor: '#0f172a',
                                                '& fieldset': { borderColor: '#334155' },
                                                '&:hover fieldset': { borderColor: '#64748b' },
                                                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                            },
                                            '& .MuiSvgIcon-root': { color: '#94a3b8' }
                                        }}
                                    >
                                        <MenuItem value={"user"}>User</MenuItem>
                                        <MenuItem value={"admin"}>Admin (Full Access)</MenuItem>
                                    </TextField>
                                </div>
                                
                                <div className="flex items-center gap-3 w-full pt-2">
                                    <Link className="hover:bg-[#202234] text-slate-300 text-center py-3 px-4 flex-1 border border-[#2E314A] rounded-xl font-bold text-xs transition-colors no-underline" to="/admin/users">
                                        Cancel
                                    </Link>
                                    <button type="submit" className="text-white py-3 px-4 flex-1 bg-[#5B5CE5] hover:bg-[#4E4FD9] shadow-md shadow-[#5B5CE5]/25 rounded-xl font-bold text-xs transition-colors cursor-pointer">
                                        Update User
                                    </button>
                                </div>
                            </div>

                        </form>

                    </div>
                </div>
            )}
        </>
    );
};

export default UpdateUser;
