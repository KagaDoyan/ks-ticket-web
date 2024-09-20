import { Box, Modal, Button, TextField, Typography, Stack, Grid, Autocomplete } from "@mui/material";
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
interface Customer {
    id: number
    shortname: string
    fullname: string
}
interface Province {
    id: number;
    name: string;
    code: string;
}
export default function PriorityGroupModalForm({ open, handleClose, prioritiesGroupID, setPrioritiesGroupID, fetchprioritiesData }: { open: boolean, handleClose: () => void, prioritiesGroupID: number, setPrioritiesGroupID: () => void, fetchprioritiesData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        group_name: "",
        customer_id: 0,
        province_id: [] as number[],
    });
    const [CustomerOption, setCustomerOption] = useState<Customer[]>([])
    const [provinceData, setProvinceData] = useState<Province[]>([]);


    const getProvinceData = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/province`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setProvinceData(data);
                    })
                } else {
                    throw new Error("Failed to fetch province data");
                }
            }).catch((err) => {
                toast.error("Failed to fetch province data");
            });
    };
    const GetPriorityGroupData = () => {
        if (prioritiesGroupID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/priorityGroup/${prioritiesGroupID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        res.json().then((data) => {
                            const array_of_provinceID = data.data.provinces?.map((p: Province) => p.id);
                            setFormData({
                                group_name: data.data.group_name,
                                customer_id: data.data.customers_id,
                                province_id: array_of_provinceID
                            });
                        })
                    } else {
                        throw new Error("Failed to fetch priority group data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch priority group data");
                });
        }
    }

    const handleChangeProvince = (event: React.SyntheticEvent, value: Province[]) => {
        setFormData({
            ...formData,
            province_id: value.map((province) => province.id)
        });
    };

    const clearFormData = () => {
        setFormData({
            group_name: "",
            customer_id: 0,
            province_id: [],
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
    useEffect(() => {
        GetPriorityGroupData();
        getProvinceData();
        GetCustomer();
        if (prioritiesGroupID == 0) {
            clearFormData()
        }
    }, [prioritiesGroupID]);
    const [showPassword, setShowPassword] = useState(false);

    const HandleModalClose = () => {
        clearFormData();
        setPrioritiesGroupID();
        handleClose();
    }
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prioritiesGroupID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/priorityGroup/${prioritiesGroupID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("priority group updated successfully");
                        fetchprioritiesData();
                        HandleModalClose();
                        clearFormData();
                        setPrioritiesGroupID();
                    } else {
                        throw new Error("Failed to update priority group");
                    }
                }).catch((err) => {
                    toast.error("Failed to update priority group");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/priorityGroup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("priority group created successfully");
                        fetchprioritiesData();
                        HandleModalClose();
                    } else {
                        throw new Error("Failed to create priority group");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create priority group");
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
            onClose={HandleModalClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    priority group Form
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
                                label="priority group Name"
                                name="group_name"
                                value={formData.group_name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={CustomerOption}
                                getOptionLabel={(option) => option.shortname}
                                value={CustomerOption.find((customer) => customer.id === formData.customer_id) || null}
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
                                renderInput={(params) => <TextField required {...params} label="Customer" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <Autocomplete
                                multiple
                                id="province-select"
                                options={provinceData}
                                getOptionLabel={(option) => option.name}
                                value={provinceData.filter(province => formData.province_id.includes(province.id))}
                                onChange={handleChangeProvince}
                                renderInput={(params) => (
                                    <TextField {...params} label="Province" variant="outlined" />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                            />
                        </Grid>
                    </Grid>
                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={HandleModalClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {prioritiesGroupID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}