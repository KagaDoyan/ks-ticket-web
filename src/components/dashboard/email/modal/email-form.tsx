import { Box, Modal, Button, TextField, Typography, Stack, Autocomplete } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth/client";
import useOnMount from "@mui/utils/useOnMount";

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

const roles = ["Admin", "brand"];
export default function EmailModalForm({ open, handleClose, emailID, fetchbrandData }: { open: boolean, handleClose: () => void, emailID: number, fetchbrandData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        email: "",
        customer_id: 0
    });
    const [customers, setCustomers] = useState<Customer[]>([]);

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

    const getbrandData = () => {
        if (emailID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mail_recipient/${emailID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        res.json().then((data) => {
                            setFormData({
                                email: data.data.email,
                                customer_id: data.data.customer_id
                            });
                        })
                    } else {
                        throw new Error("Failed to fetch email recipient data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch email recipient data");
                });
        }
    }

    const clearFormData = () => {
        setFormData({
            email: "",
            customer_id: 0
        });
    }

    useEffect(() => {
        getbrandData();
        if (emailID == 0) {
            clearFormData()
        }
    }, [emailID]);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (emailID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mail_recipient/${emailID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("email recipient updated successfully");
                        fetchbrandData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update email recipient");
                    }
                }).catch((err) => {
                    toast.error("Failed to update email recipient");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mail_recipient`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("email recipient created successfully");
                        fetchbrandData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create email recipient");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create email recipient");
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

    useOnMount(() => {
        GetCustomer();
    })

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    email Form
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
                        label="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
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

                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={handleClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {emailID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}