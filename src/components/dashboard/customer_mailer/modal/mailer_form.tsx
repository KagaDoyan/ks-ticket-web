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

export default function EmailModalForm({ open, handleClose, emailID, fetchbrandData }: { open: boolean, handleClose: () => void, emailID: number, fetchbrandData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        host: "",
        port: "",
        customer_id: [] as number[]
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
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer_mailer/${emailID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        res.json().then((data) => {
                            const array_of_customerID = data.data.customers?.map((c: Customer) => c.id);
                            setFormData({
                                email: data.data.sender_email,
                                customer_id: array_of_customerID,
                                password: data.data.sender_password,
                                host: data.data.sender_host,
                                port: data.data.sender_port
                            });
                        })
                    } else {
                        throw new Error("Failed to fetch mailer data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch mailer data");
                });
        }
    }

    const clearFormData = () => {
        setFormData({
            email: "",
            customer_id: [],
            password: "",
            host: "",
            port: ""
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
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer_mailer/${emailID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("mailer updated successfully");
                        fetchbrandData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update mailer");
                    }
                }).catch((err) => {
                    toast.error("Failed to update mailer");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer_mailer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("mailer created successfully");
                        fetchbrandData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create mailer");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create mailer");
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

    const handleChangeCustomer = (event: React.SyntheticEvent, value: Customer[]) => {
        setFormData({
            ...formData,
            customer_id: value.map((customer) => customer.id)
        });
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
                    <TextField
                        label="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={emailID ? false : true}
                    />
                    <TextField
                        label="host"
                        name="host"
                        value={formData.host}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="port"
                        name="port"
                        value={formData.port}
                        onChange={handleChange}
                        required
                    />
                    <Autocomplete
                        multiple
                        id="customer-select"
                        options={customers}
                        getOptionLabel={(option) => option.shortname}
                        value={customers.filter(customer => formData.customer_id.includes(customer.id))}
                        onChange={handleChangeCustomer}
                        renderInput={(params) => (
                            <TextField {...params} label="Customer" variant="outlined"/>
                        )}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
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