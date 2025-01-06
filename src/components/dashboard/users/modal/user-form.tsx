import { Box, Modal, Button, TextField, MenuItem, Typography, Stack, InputAdornment, IconButton, Autocomplete } from "@mui/material";
import { useEffect, useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth/client";
import { User } from "@phosphor-icons/react/dist/ssr";

const style = {
    position: 'absolute' as 'absolute',
    padding: 10,
    borderRadius: 3,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

interface Customer {
    id: number;
    fullname: string;
    shortname: string;
}

const roles = ["Admin", "User", "Engineer", "Customer"];
export default function UserModalForm({ open, handleClose, userID, fetchUserData }: { open: boolean, handleClose: () => void, userID: number, fetchUserData: () => void }): React.JSX.Element {
    const [userData, setUserData] = useState<{ role?: string, customer?: { shortname: string, fullname: string } } | null>(null);
    useEffect(() => {
        const storedUserData = JSON.parse(localStorage.getItem('user_info') || '{}');
        setUserData(storedUserData);

        const handleStorageChange = () => {
            const updatedUserData = JSON.parse(localStorage.getItem('user_info') || '{}');
            setUserData(updatedUserData);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        if (userData?.role === "SuperAdmin") {
            roles.push("SuperAdmin");
        }
    }, [userData]);

    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        role: "",
        customer_id: 0
    });

    const [customers, setCustomers] = useState<Customer[]>([]);

    const getUserData = () => {
        if (userID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/id/${userID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        res.json().then((data) => {
                            setFormData({
                                fullname: data.data.fullname,
                                email: data.data.email,
                                password: data.data.password,
                                role: data.data.role,
                                customer_id: data.data.customer_id
                            });
                        })
                    } else {
                        throw new Error("Failed to fetch user data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch user data");
                });
        }
    }

    const GetCustomer = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setCustomers(data.data);
                    })
                }
            })
    }

    const clearFormData = () => {
        setFormData({
            fullname: "",
            email: "",
            password: "",
            role: "",
            customer_id: 0
        });
    }

    useEffect(() => {
        getUserData();
        GetCustomer();
        if (userID == 0) {
            clearFormData()
        }
    }, [userID]);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${userID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("User updated successfully");
                        fetchUserData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update user");
                    }
                }).catch((err) => {
                    toast.error("Failed to update user");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("User created successfully");
                        fetchUserData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create user");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create user");
                });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };


    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    User Form
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: "100%",
                        margin: "auto",
                        mt: 2
                    }}
                >
                    <TextField
                        label="Full Name"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    {userID ? "" : <TextField

                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={togglePasswordVisibility}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        required
                    />}
                    <TextField
                        label="Role"
                        name="role"
                        select
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        {roles.map((role) => (
                            <MenuItem key={role} value={role}>
                                {role}
                            </MenuItem>
                        ))}
                    </TextField>
                    {
                        formData.role == "Customer" ?
                            <Autocomplete
                                options={customers}
                                getOptionLabel={(option) => option.fullname}
                                value={customers.find((customer) => customer.id === formData.customer_id) || null}
                                onChange={(event, newValue) => {
                                    const selectedId = newValue ? newValue.id : 0;
                                    setFormData({
                                        ...formData,
                                        customer_id: selectedId
                                    })
                                }}
                                renderInput={(params) => <TextField {...params} label="Customer" />}
                            />
                            : ""
                    }
                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={handleClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {userID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}