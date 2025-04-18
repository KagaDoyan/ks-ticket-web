import { Box, Modal, Button, TextField, Typography, Stack, Grid } from "@mui/material";
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
const roles = ["Admin", "customer"];
export default function CustomerModalForm({ open, handleClose, customerID, fetchcustomerData }: { open: boolean, handleClose: () => void, customerID: number, fetchcustomerData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        fullname: "",
        shortname: "",
        open_mail: "",
        line_open: "",
        line_appointment: "",
        line_close: "",
    });

    const getcustomerData = () => {
        if (customerID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/${customerID}`, {
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
                                shortname: data.data.shortname,
                                line_open: data.data.line_open,
                                line_appointment: data.data.line_appointment,
                                line_close: data.data.line_close,
                                open_mail: data.data.open_mail
                            });
                        })
                    } else {
                        throw new Error("Failed to fetch customer data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch customer data");
                });
        }
    }

    const clearFormData = () => {
        setFormData({
            fullname: "",
            shortname: "",
            open_mail: "",
            line_open: "",
            line_appointment: "",
            line_close: "",
        });
    }

    useEffect(() => {
        getcustomerData();
        if (customerID == 0) {
            clearFormData()
        }
    }, [customerID]);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customerID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/${customerID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("customer updated successfully");
                        fetchcustomerData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update customer");
                    }
                }).catch((err) => {
                    toast.error("Failed to update customer");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("customer created successfully");
                        fetchcustomerData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create customer");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create customer");
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
                    customer Form
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
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Full Name"
                                name="fullname"
                                value={formData.fullname}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Short Name"
                                name="shortname"
                                value={formData.shortname}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Line Open"
                                name="line_open"
                                value={formData.line_open}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Line Appointment"
                                name="line_appointment"
                                value={formData.line_appointment}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Line Close"
                                name="line_close"
                                value={formData.line_close}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={handleClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {customerID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}