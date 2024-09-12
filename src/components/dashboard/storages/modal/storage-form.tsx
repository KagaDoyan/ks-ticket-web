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
export default function StorageModalForm({ open, handleClose, storageID, fetchStorageData }: { open: boolean, handleClose: () => void, storageID: number, fetchStorageData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        name: "",
        location: ""
    });

    const getstorageData = () => {
        if (storageID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/${storageID}`, {
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
                                location: data.data.location
                            });
                        })
                    } else {
                        throw new Error("Failed to fetch storage data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch storage data");
                });
        }
    }

    const clearFormData = () => {
        setFormData({
            name: "",
            location: "",
        });
    }

    useEffect(() => {
        getstorageData();
        if (storageID == 0) {
            clearFormData()
        }
    }, [storageID]);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (storageID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/${storageID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("storage updated successfully");
                        fetchStorageData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update storage");
                    }
                }).catch((err) => {
                    toast.error("Failed to update storage");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("storage created successfully");
                        fetchStorageData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create storage");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create storage");
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
                    storage Form
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
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="Location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={handleClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {storageID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}