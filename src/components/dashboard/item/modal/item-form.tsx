import { Box, Modal, Button, TextField, Typography, Stack, Grid, Autocomplete } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth/client";
import useOnMount from "@mui/utils/useOnMount";
import formatDate from "@/lib/dateformat";

const style = {
    position: 'absolute' as 'absolute',
    padding: 10,
    borderRadius: 3,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: {
        xs: '90%', // Mobile
        sm: '80%', // Tablet
        md: '60%', // Small desktop
        lg: '60%', // Large desktop
    },
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

interface brand {
    id: number
    name: string
}

interface category {
    id: number
    name: string
}

interface Customer {
    id: number
    shortname: string
    fullname: string
}

interface model {
    id: number
    name: string
    brand_id: number
}

interface Storage {
    id: number
    name: string
}

const conditionOption = ['good', 'broken']
export default function ItemModalForm({ open, handleClose, itemID, fetchitemData }: { open: boolean, handleClose: () => void, itemID: number, fetchitemData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        serial_number: "",
        category_id: 0,
        brand_id: 0,
        customer_id: 0,
        model_id: 0,
        storage_id: 0,
        warranty_expiry_date: "",
        status: "in_stock",
        remark: "",
        condition: "good"
    });

    const [StatusOption, setStatusOption] = useState([])
    const [BrandOption, setBrandOption] = useState<brand[]>([])
    const [ModelOption, setModelOption] = useState<model[]>([])
    const [CategoryOption, setCategoryOption] = useState<category[]>([])
    const [CustomerOption, setCustomerOption] = useState<Customer[]>([])
    const [storageOption, setStorageOption] = useState<Storage[]>([])


    const getStatusOption = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/status`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setStatusOption(data.data);
                    })
                } else {
                    throw new Error("Failed to fetch status option");
                }
            }).catch((err) => {
                toast.error("Failed to fetch status option");
            });
    }

    const getBrandOption = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brand/option`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setBrandOption(data.data);
                    })
                } else {
                    throw new Error("Failed to fetch brand option");
                }
            }).catch((err) => {
                toast.error("Failed to fetch brand option");
            });
    }

    const getCategoryOption = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/option`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setCategoryOption(data.data);
                    })
                } else {
                    throw new Error("Failed to fetch category option");
                }
            }).catch((err) => {
                toast.error("Failed to fetch category option");
            });
    }

    const getModelOption = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/model/option`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setModelOption(data.data);
                    })
                } else {
                    throw new Error("Failed to fetch model option");
                }
            }).catch((err) => {
                toast.error("Failed to fetch model option");
            });
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
                        setCustomerOption(data.data);
                    })
                }
            })
    }

    const GetStorage = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/option`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setStorageOption(data.data);
                    })
                }
            })
    }

    const getitemData = () => {
        if (itemID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/${itemID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        res.json().then((data) => {
                            setFormData({
                                serial_number: data.data.serial_number,
                                category_id: data.data.category_id,
                                brand_id: data.data.brand_id,
                                customer_id: data.data.customer_id || 0,
                                model_id: data.data.model_id,
                                warranty_expiry_date: data.data.warranty_expiry_date ? formatDate(data.data.warranty_expiry_date) : "",
                                status: data.data.status,
                                storage_id: data.data.storage_id,
                                remark: data.data.Remark,
                                condition: data.data.condition
                            });
                        })
                    } else {
                        throw new Error("Failed to fetch item data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch item data");
                });
        }
    }

    const clearFormData = () => {
        setFormData({
            serial_number: "",
            category_id: 0,
            brand_id: 0,
            model_id: 0,
            customer_id: 0,
            warranty_expiry_date: "",
            status: "in_stock",
            storage_id: 0,
            remark: "",
            condition: "good"
        });
    }

    const closeModal = () => {
        clearFormData()
        handleClose();
    }

    useEffect(() => {
        getitemData();
        if (itemID == 0) {
            clearFormData()
        }
    }, [itemID]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        var payload: any = {
            serial_number: formData.serial_number,
            category_id: formData.category_id,
            brand_id: formData.brand_id,
            model_id: formData.model_id,
            customer_id: formData.customer_id,
            status: formData.status,
            storage_id: formData.storage_id,
            remark: formData.remark,
            condition: formData.condition
        };
        if (formData.warranty_expiry_date) {
            payload['warranty_expiry_date'] = new Date(formData.warranty_expiry_date);
        }

        if (itemID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/${itemID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(payload)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("item updated successfully");
                        fetchitemData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update item");
                    }
                }).catch((err) => {
                    toast.error("Failed to update item");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(payload)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("item created successfully");
                        fetchitemData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create item");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create item");
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
        getStatusOption()
        getBrandOption()
        getCategoryOption()
        getModelOption()
        GetCustomer()
        GetStorage()
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
                    Item form
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
                                name="serial_number"
                                label="Serial Number"
                                type="text"
                                value={formData.serial_number}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={ModelOption}
                                getOptionLabel={(option) => option.name}
                                value={ModelOption.find((model) => model.id === formData.model_id) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        setFormData({
                                            ...formData,
                                            model_id: 0
                                        })
                                    }
                                    const selectedOption = newValue ? newValue.id : null;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    setFormData({
                                        ...formData,
                                        model_id: selectedOption || 0
                                    });
                                    
                                }}
                                renderInput={(params) => <TextField required {...params} label="Model" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={CustomerOption}
                                getOptionLabel={(option) => option.shortname}
                                value={CustomerOption.find((brand) => brand.id === formData.customer_id) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        setFormData({
                                            ...formData,
                                            customer_id: 0
                                        })
                                    }
                                    const selectedOption = newValue ? newValue.id : null;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    setFormData({
                                        ...formData,
                                        customer_id: selectedOption || 0
                                    });
                                }}
                                renderInput={(params) => <TextField {...params} label="Customer Brand" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={BrandOption}
                                getOptionLabel={(option) => option.name}
                                value={BrandOption.find((brand) => brand.id === formData.brand_id) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        setFormData({
                                            ...formData,
                                            brand_id: 0
                                        })
                                    }
                                    const selectedOption = newValue ? newValue.id : null;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    setFormData({
                                        ...formData,
                                        brand_id: selectedOption || 0
                                    });
                                }}
                                renderInput={(params) => <TextField required {...params} label="Item Brand" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={CategoryOption}
                                getOptionLabel={(option) => option.name}
                                value={CategoryOption.find((category) => category.id === formData.category_id) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        setFormData({
                                            ...formData,
                                            category_id: 0
                                        })
                                    }
                                    const selectedOption = newValue ? newValue.id : null;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    setFormData({
                                        ...formData,
                                        category_id: selectedOption || 0
                                    });
                                    
                                }}
                                renderInput={(params) => <TextField required {...params} label="Category" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={StatusOption}
                                getOptionLabel={(option) => option}
                                value={StatusOption.find((status) => status === formData.status) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        setFormData({
                                            ...formData,
                                            status: ""
                                        })
                                        return;
                                    }
                                    const selectedOption = newValue;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    setFormData({
                                        ...formData,
                                        status: selectedOption || ""
                                    });
                                    
                                }}
                                renderInput={(params) => <TextField required name="status" {...params} label="Status" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={storageOption}
                                getOptionLabel={(option) => option.name}
                                value={storageOption.find((storage) => storage.id === formData.storage_id) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        setFormData({
                                            ...formData,
                                            storage_id: 0
                                        })
                                        return;
                                    }
                                    const selectedOption = newValue?.id;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    setFormData({
                                        ...formData,
                                        storage_id: selectedOption || 0
                                    });
                                    
                                }}
                                renderInput={(params) => <TextField required name="status" {...params} label="Location" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="warranty_expiry_date"
                                label="Warranty Expiry Date"
                                type="date"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={formData.warranty_expiry_date}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={conditionOption}
                                getOptionLabel={(option) => option}
                                value={conditionOption.find((option) => option === formData.condition)}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        setFormData({
                                            ...formData,
                                            storage_id: 0
                                        })
                                        return;
                                    }
                                    const selectedOption = newValue;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    setFormData({
                                        ...formData,
                                        condition: selectedOption || ""
                                    });
                                    
                                }}
                                renderInput={(params) => <TextField name="status" {...params} label="condition" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="remark"
                                label="remark"
                                value={formData.remark}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={closeModal} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {itemID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}