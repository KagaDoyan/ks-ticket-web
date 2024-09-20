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
export default function SellModalForm({ open, handleClose, SellID, fetchsellData }: { open: boolean, handleClose: () => void, SellID: number, fetchsellData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        brand: "",
        model: "",
        serial: "",
        warranty: "",
        sell_date: "",
        buyer_name: "",
        sell_price: null,
    });

    const getInventoryData = () => {
        if (SellID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/${SellID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        res.json().then((data) => {
                            setFormData({
                                brand: data.data.brand,
                                model: data.data.model,
                                serial: data.data.serial,
                                warranty: data.data.warranty,
                                sell_date: data.data.sell_date,
                                buyer_name: data.data.buyer_name,
                                sell_price: data.data.sell_price
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

    const clearFormData = () => {
        setFormData({
            brand: "",
            model: "",
            serial: "",
            warranty: "",
            sell_date: "",
            buyer_name: "",
            sell_price: null,
        });
    }

    useEffect(() => {
        getInventoryData();
        if (SellID == 0) {
            clearFormData()
        }
    }, [SellID]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (SellID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/${SellID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("sell updated successfully");
                        fetchsellData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update sell");
                    }
                }).catch((err) => {
                    toast.error("Failed to update sell");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("sell created successfully");
                        fetchsellData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create sell");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create sell");
                });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
                    sell Form
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
                        label="serial"
                        name="serial"
                        value={formData.serial}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="model"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="warranty"
                        name="warranty"
                        type="date"
                        InputLabelProps={
                            {
                                shrink: true
                            }
                        }
                        value={formData.warranty}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="sell_date"
                        name="sell_date"
                        type="date"
                        value={formData.sell_date}
                        InputLabelProps={
                            {
                                shrink: true
                            }
                        }
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="buyer_name"
                        name="buyer_name"
                        value={formData.buyer_name}
                        onChange={handleChange}
                    />
                    <TextField
                        label="sell_price"
                        name="sell_price"
                        type="number"
                        value={formData.sell_price}
                        onChange={handleChange}
                    />
                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={handleClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {SellID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}