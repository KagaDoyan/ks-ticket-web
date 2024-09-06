import { Box, Modal, Button, TextField, Typography, Stack, Grid, Autocomplete, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth/client";
import useOnMount from "@mui/utils/useOnMount";
import dayjs from "dayjs";

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

interface customer {
    id: number
    fullname: string
    shortname: string
    shops: shop[]
}

interface shop {
    id: number
    shop_name: string
    shop_number: string
    province: {
        priority_group: priority_group
    }
    latitude: string
    longitude: string
}

interface priority_group {
    priorities: priority[]
}

interface priority {
    id: number
    name: string
    time_sec: number
}

interface engineer {
    id: number
    name: string,
    lastname: string,
    distance: number
}

export default function CreateTicketModalForm({ open, handleClose, ticketID, fetchticketData }: { open: boolean, handleClose: () => void, ticketID: number, fetchticketData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        inc_number: "n/a",
        customer_id: 0,
        shop_id: 0,
        open_date: "",
        open_time: "",
        title: "",
        description: "",
        due_by: "",
        sla_priority_level: "",
        contact_name: "",
        contact_tel: "",
        assigned_to: "",
        ticket_status: "open",
        appointment_date: "",
        appointment_time: "",
        engineer_id: 0
    });

    const [customerOptions, setCustomerOptions] = useState<customer[]>([]);
    const [shopOptions, setshopOptions] = useState<shop[]>([]);
    const [priorityOptions, setpriorityOptions] = useState<priority[]>([]);
    const [enginnerOption, setEngineerOption] = useState<engineer[]>([]);
    const [priority_time, setpriority_time] = useState(0);
    const [shoplatlng,  setShoplatlng] = useState({ lat: "", lng: ""});

    const HandleShopLatLngChange = ( lat: string, lng: string) => {
        setShoplatlng({ lat: lat, lng: lng })
    }

    const fetchCustomer = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/option?shop_id=${formData.shop_id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setCustomerOptions(data.data);
                    })
                } else {
                    throw new Error("Failed to fetch customer options");
                }
            }).catch((err) => {
                toast.error("Failed to fetch customer options");
            });
    }

    const fetchEngineer = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/enigeer/${formData.shop_id ? formData.shop_id : 0}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setEngineerOption(data.data);
                    })
                } else {
                    setEngineerOption([]);
                    throw new Error("Failed to fetch engineer options");
                }
            }).catch((err) => {
                setEngineerOption([]);
                toast.error("Failed to fetch engineer options");
            });
    }

    const clearFormData = () => {
        setFormData({
            inc_number: "n/a",
            customer_id: 0,
            shop_id: 0,
            open_date: "",
            open_time: "",
            title: "",
            description: "",
            due_by: "",
            sla_priority_level: "",
            contact_name: "",
            contact_tel: "",
            assigned_to: "",
            ticket_status: "open",
            appointment_date: "",
            appointment_time: "",
            engineer_id: 0
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (ticketID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/${ticketID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("ticket updated successfully");
                        fetchticketData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update ticket");
                    }
                }).catch((err) => {
                    toast.error("Failed to update ticket");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/open`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("ticket created successfully");
                        fetchticketData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create ticket");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create ticket");
                });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleModalClose = () => {
        clearFormData();
        handleClose();
    };

    useOnMount(() => {
        fetchCustomer();
        fetchEngineer()
    })

    useEffect(() => {
        fetchCustomer();
        fetchEngineer()
    }, [formData.shop_id])

    useEffect(() => {
        if (formData.open_date && formData.open_time && priority_time) {
            const open_date = new Date(formData.open_date + " " + formData.open_time);
            const due_by = open_date.setSeconds(open_date.getSeconds() + priority_time);
            setFormData({
                ...formData,
                due_by: dayjs(due_by).format("YYYY-MM-DD HH:mm:ss")
            })
        }
    }, [formData.open_date, formData.open_time, priority_time])

    return (
        <Modal
            BackdropProps={{
                onClick: (event) => event.stopPropagation(), // Disable backdrop click
            }}
            disableEscapeKeyDown
            open={open}
            onClose={handleModalClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Create Ticket Form
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
                        <Grid item xs={12} sm={3}>
                            <TextField
                                required
                                label="Incident Number"
                                name="inc_number"
                                value={formData.inc_number}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Autocomplete
                                options={customerOptions}
                                getOptionLabel={(option) => option.shortname}
                                value={customerOptions.find((customer) => customer.id === formData.customer_id) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        setFormData({
                                            ...formData,
                                            customer_id: 0
                                        })
                                        setshopOptions([]);
                                        setpriorityOptions([]);
                                        setpriority_time(0)
                                    }
                                    const selectedOption = newValue ? newValue.id : 0;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    setFormData({
                                        ...formData,
                                        customer_id: selectedOption
                                    });
                                    setshopOptions(customerOptions.find((customer) => customer.id === selectedOption)?.shops || []);
                                }}
                                renderInput={(params) => <TextField required {...params} label="Customer" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Autocomplete
                                options={shopOptions}
                                getOptionLabel={(option) => option.shop_number + ' ' + option.shop_name}
                                value={shopOptions.find((shop) => shop.id === formData.shop_id) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        setFormData({
                                            ...formData,
                                            shop_id: 0,
                                            sla_priority_level: ""
                                        })
                                        setpriorityOptions([]);
                                        setpriority_time(0)
                                    }
                                    const selectedOption = newValue ? newValue.id : 0;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    setFormData({
                                        ...formData,
                                        shop_id: selectedOption
                                    });
                                    setpriorityOptions(shopOptions.find((shop) => shop.id === selectedOption)?.province.priority_group.priorities || []);
                                    HandleShopLatLngChange(shopOptions.find((shop) => shop.id === selectedOption)?.latitude || "", shopOptions.find((shop) => shop.id === selectedOption)?.longitude || "");
                                }}
                                renderInput={(params) => <TextField required {...params} label="Shop" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Autocomplete
                                options={priorityOptions}
                                getOptionLabel={(option) => option.name}
                                value={priorityOptions.find((priority) => priority.name === formData.sla_priority_level) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        setFormData({
                                            ...formData,
                                            sla_priority_level: ""
                                        })
                                        setpriority_time(0)
                                    }
                                    const selectedOption = newValue ? newValue.name : "";
                                    if (!selectedOption) {
                                        return;
                                    }
                                    setFormData({
                                        ...formData,
                                        sla_priority_level: selectedOption
                                    });
                                    setpriority_time(newValue?.time_sec ? newValue.time_sec : 0)
                                }}
                                renderInput={(params) => <TextField required {...params} label="Priority" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                label="Open Date"
                                name="open_date"
                                type="date"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={formData.open_date}
                                onChange={handleChange}
                                fullWidth

                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                label="Open Time"
                                name="open_time"
                                type="time"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={formData.open_time}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                required
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                required
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={4}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                label="Contact Name"
                                name="contact_name"
                                value={formData.contact_name}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                label="Contact Telephone"
                                name="contact_tel"
                                value={formData.contact_tel}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={enginnerOption}
                                getOptionLabel={(option) => option.name + ' ' + option.lastname + ' ' + option.distance + " km"}
                                value={enginnerOption.find((engineer) => engineer.id === formData.engineer_id) || null}
                                onChange={(event, newValue, reason) => {
                                    if (reason === "clear") {
                                        setFormData({
                                            ...formData,
                                            engineer_id: 0,
                                        })
                                    }
                                    const selectedOption = newValue ? newValue.id : 0;
                                    if (!selectedOption) {
                                        return;
                                    }
                                    setFormData({
                                        ...formData,
                                        engineer_id: selectedOption
                                    });
                                }}
                                renderInput={(params) => <TextField required {...params} label="Engineer" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                label="Assigned To"
                                name="assigned_to"
                                value={formData.assigned_to}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                label="Appointment Date"
                                name="appointment_date"
                                type="date"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={formData.appointment_date}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                label="Appointment Time"
                                name="appointment_time"
                                type="time"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={formData.appointment_time}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} sm={12}>
                            <TextField
                                error
                                required
                                label="Due By"
                                name="due_by"
                                type="datetime-local"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{ readOnly: true }}
                                value={formData.due_by}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                    <Divider/>
                    <Stack justifyContent={"flex-end"} direction="row" spacing={4}>
                        <Button onClick={handleModalClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {ticketID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}