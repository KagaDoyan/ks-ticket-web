import { authClient } from "@/lib/auth/client"
import { Box, Modal, Button, TextField, Typography, Stack, Grid, Autocomplete, Tabs, Tab } from "@mui/material";
import useOnMount from "@mui/utils/useOnMount"
import dayjs from "dayjs"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"

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
    phone: string
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
export default function TicketPage({ open, handleClose, ticketID, fetchticketData }: { open: boolean, handleClose: () => void, ticketID: number, fetchticketData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        inc_number: "",
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
    const [shoplatlng, setShoplatlng] = useState({ lat: "", lng: "" });

    const HandleShopLatLngChange = (lat: string, lng: string) => {
        setShoplatlng({ lat: lat, lng: lng })
    }

    const fetchTicketDetails = (ticketID: number, setFormData: any, setShopOptions: any, setPriorityOptions: any, setPriorityTime: any, customerOptions: customer[], shopOptions: shop[]) => {
        if (ticketID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/${ticketID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    } else {
                        throw new Error("Failed to fetch ticket details");
                    }
                })
                .then((data) => {
                    setFormData({
                        inc_number: data.data.inc_number,
                        customer_id: data.data.customer_id,
                        shop_id: data.data.shop_id,
                        open_date: data.data.open_date,
                        open_time: data.data.open_time,
                        title: data.data.title,
                        description: data.data.description,
                        due_by: data.data.due_by,
                        sla_priority_level: data.data.sla_priority_level,
                        contact_name: data.data.contact_name,
                        contact_tel: data.data.contact_tel,
                        assigned_to: data.data.assigned_to,
                        ticket_status: data.data.ticket_status,
                        appointment_date: data.data.appointment_date,
                        appointment_time: data.data.appointment_time,
                        engineer_id: data.data.engineer_id
                    });
                })
                .catch((err) => {
                    toast.error("something went wrong while fetching ticket details");
                });
        }
    }
    useEffect(() => {
        fetchTicketDetails(ticketID, setFormData, setshopOptions, setpriorityOptions, setpriority_time, customerOptions, shopOptions);
    }, [ticketID]);

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

    const fetchShop = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop/option`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setshopOptions(data.data);
                        if (formData.shop_id) {
                            const priority: priority[] = data.data.filter((shop: shop) => shop.id === formData.shop_id)[0].province.priority_group.priorities;
                            setpriorityOptions(priority);
                            if (formData.sla_priority_level) {
                                setpriority_time(priority.find((priority: priority) => priority.name === formData.sla_priority_level)!.time_sec);
                            }
                        }
                    })
                }
            }).catch((err) => {
                toast.error("Failed to fetch shop options");
            })
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
            inc_number: "",
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
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/update/open/${ticketID}`, {
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

        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    useOnMount(() => {
        fetchCustomer();
        fetchEngineer();
        fetchShop();
    })

    useEffect(() => {
        fetchCustomer();
        fetchEngineer();
        fetchShop();
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
        <>
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
                                    contact_tel: "",
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
                                shop_id: selectedOption,
                                contact_tel: shopOptions.find((shop) => shop.id === selectedOption)?.phone || "",
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
                        inputProps={{ readOnly: true }}
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
            <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                <Button onClick={handleClose} variant="contained" color="warning">
                    Close
                </Button>
                <Button type="submit" variant="contained" color="success" onClick={handleSubmit}>
                    Update
                </Button>
            </Stack>
        </>
    )
}