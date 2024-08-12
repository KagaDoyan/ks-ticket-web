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
export default function ModelModalForm({ open, handleClose, ModelID, fetchModelData }: { open: boolean, handleClose: () => void, ModelID: number, fetchModelData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        name: "",
    });

    const getModelData = () => {
        if (ModelID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/model/${ModelID}`, {
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
                        throw new Error("Failed to fetch Model data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch Model data");
                });
        }
    }

    const clearFormData = () => {
        setFormData({
            name: "",
        });
    }

    useEffect(() => {
        getModelData();
        if (ModelID == 0) {
            clearFormData()
        }
    }, [ModelID]);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (ModelID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/model/${ModelID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("Model updated successfully");
                        fetchModelData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update Model");
                    }
                }).catch((err) => {
                    toast.error("Failed to update Model");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/model`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("Model created successfully");
                        fetchModelData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create Model");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create Model");
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
                    Model Form
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
                        label="Model Name"
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
                            {ModelID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}