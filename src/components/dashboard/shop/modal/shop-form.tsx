import { Box, Modal, Button, TextField, Typography, Stack, Grid, Autocomplete } from "@mui/material";
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
    width: '60%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};
interface Province {
    id: number;
    name: string;
    code: string;
}
interface Customer {
    id: number;
    fullname: string;
    shortname: string;
}
export default function ShopModalForm({ open, handleClose, shopID, fetchshopData }: { open: boolean, handleClose: () => void, shopID: number, fetchshopData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        shop_number: "",
        shop_name: "",
        phone: "",
        email: "",
        latitude: "",
        longitude: "",
        province_id: 0,
        customer_id: 0,
    });
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const closeModal = () => {
        clearFormData()
        handleClose();
    }

    const getProvince = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/province`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setProvinces(data);
                    })
                }
            })
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
    const getshopData = () => {
        if (shopID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop/${shopID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        res.json().then((data) => {
                            setFormData({
                                shop_number: data.data.shop_number,
                                shop_name: data.data.shop_name,
                                phone: data.data.phone,
                                email: data.data.email,
                                latitude: data.data.latitude,
                                longitude: data.data.longitude,
                                province_id: data.data.province_id,
                                customer_id: data.data.customers_id,
                            });
                        })
                    } else {
                        throw new Error("Failed to fetch shop data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch shop data");
                });
        }
    }

    const clearFormData = () => {
        setFormData({
            shop_number: "",
            shop_name: "",
            phone: "",
            email: "",
            latitude: "",
            longitude: "",
            province_id: 0,
            customer_id: 0,
        });
    }

    useEffect(() => {
        getshopData();
        if (shopID == 0) {
            clearFormData()
        }
    }, [shopID]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (shopID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop/${shopID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(
                    {
                        ...formData,
                    }
                )
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("shop updated successfully");
                        fetchshopData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update shop");
                    }
                }).catch((err) => {
                    toast.error("Failed to update shop");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(
                    {
                        ...formData,
                    }
                )
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("shop created successfully");
                        fetchshopData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create shop");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create shop");
                });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    useOnMount(() => {
        getProvince();
        GetCustomer();
    })

    return (
        <Modal
            open={open}
            onClose={closeModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Shop Form
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
                                label="Shop Number"
                                name="shop_number"
                                value={formData.shop_number}
                                onChange={handleChange}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Shop Name"
                                name="shop_name"
                                value={formData.shop_name}
                                onChange={handleChange}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Latitude"
                                name="latitude"
                                type="number"
                                value={formData.latitude}
                                onChange={handleChange}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Longitude"
                                name="longitude"
                                type="number"
                                value={formData.longitude}
                                onChange={handleChange}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={provinces}
                                getOptionLabel={(option) => option.name}
                                value={provinces.find((province) => province.id === formData.province_id) || null}
                                onChange={(event, newValue) => {
                                    const selectedId = newValue ? newValue.id : 0;
                                    setFormData({
                                        ...formData,
                                        province_id: selectedId
                                    })
                                }}
                                renderInput={(params) => <TextField {...params} label="Province" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
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
                        </Grid>
                    </Grid>
                    <Stack justifyContent={"flex-end"} direction="row" spacing={2} mt={2}>
                        <Button onClick={handleClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {shopID ? "Update" : "Add"}
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Modal>
    )
}