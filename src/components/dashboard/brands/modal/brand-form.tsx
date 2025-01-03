import { Box, Modal, Button, TextField, Typography, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth/client";

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
const roles = ["Admin", "brand"];
export default function BrandModalForm({ open, handleClose, brandID, fetchbrandData }: { open: boolean, handleClose: () => void, brandID: number, fetchbrandData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        name: "",
    });

    const getbrandData = () => {
        if (brandID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brand/${brandID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        res.json().then((data) => {
                            setFormData({
                                name: data.data.name,
                            });
                        })
                    } else {
                        throw new Error("Failed to fetch brand data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch brand data");
                });
        }
    }

    const clearFormData = () => {
        setFormData({
            name: "",
        });
    }

    useEffect(() => {
        getbrandData();
        if (brandID == 0) {
            clearFormData()
        }
    }, [brandID]);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (brandID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brand/${brandID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("brand updated successfully");
                        fetchbrandData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update brand");
                    }
                }).catch((err) => {
                    toast.error("Failed to update brand");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brand`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("brand created successfully");
                        fetchbrandData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create brand");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create brand");
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
                    brand Form
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
                        label="Brand Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={handleClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {brandID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}