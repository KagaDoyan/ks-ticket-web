import { Box, Modal, Button, TextField, MenuItem, Typography, Stack, InputAdornment, IconButton } from "@mui/material";
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
const roles = ["Admin", "User"];
export default function UserPasswordModalForm({ open, handleClose, userID, fetchUserData }: { open: boolean, handleClose: () => void, userID: number, fetchUserData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        role: ""
    });

    const clearFormData = () => {
        setFormData({
            fullname: "",
            email: "",
            password: "",
            role: ""
        });
    }

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/password/${userID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify({
                    password: formData.password
                })
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

                        label="New Password"
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
                    />
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