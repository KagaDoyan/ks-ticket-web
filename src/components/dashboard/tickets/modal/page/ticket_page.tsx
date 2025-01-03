import { authClient } from "@/lib/auth/client"
import { Box, Modal, Button, TextField, Typography, Stack, Grid, Autocomplete, Tabs, Tab } from "@mui/material";
import useOnMount from "@mui/utils/useOnMount"
import dayjs from "dayjs"
import { format } from "path";
import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import EmailAppointmentPage from "./email_appointment_page";
import React from "react";
import Swal from "sweetalert2";
import { Ticket } from "@phosphor-icons/react/dist/ssr";
import OpenEmailPreviewPage from "./email_preview_open_page";
import { DatePicker, DateTimePicker, TimePicker } from "@mui/x-date-pickers";

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
    latitude: string
    longitude: string
    phone: string
    province: {
        id: number
    }
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
    distance: number,
    open_ticket: number
}

interface team {
    id: number,
    team_name: string
}

interface category {
    id: number
    name: string
}
export default function TicketPage({ open, handleClose, ticketID, fetchticketData }: { open: boolean, handleClose: () => void, ticketID: number, fetchticketData: () => void }): React.JSX.Element {
    const [Teams, setTeams] = useState<team[]>([])
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
        engineer_id: 0,
        priority_id: 0,
        item_category: ""
    });

    const [ticketData, setTicketData] = useState<any>({});
    const [customerOptions, setCustomerOptions] = useState<customer[]>([]);
    const [CategoryOption, setCategoryOption] = useState<category[]>([])
    const [shopOptions, setshopOptions] = useState<shop[]>([]);
    const [priorityOptions, setpriorityOptions] = useState<priority[]>([]);
    const [enginnerOption, setEngineerOption] = useState<engineer[]>([]);
    const [priority_time, setpriority_time] = useState(0);
    const [shoplatlng, setShoplatlng] = useState({ lat: "", lng: "" });
    const [mailopen, setmailopen] = useState(false);
    const [previewopen, setpreviewopen] = useState(false);

    const handlePreviewClose = () => {
        setpreviewopen(false);
    }

    const handleMailOpen = () => {
        setpreviewopen(true);
    }

    const handleMailClose = () => {
        setmailopen(false);
    }

    const HandleShopLatLngChange = (lat: string, lng: string) => {
        setShoplatlng({ lat: lat, lng: lng })
    }

    const getPriority = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/priorityGroup/find/${formData.customer_id}/${shopOptions.find((shop) => shop.id === formData.shop_id)?.province.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        }).then((res) => {
            if (res.ok) {
                res.json().then((data) => {
                    setpriorityOptions(data.data);
                    if (formData.shop_id) {
                        setpriority_time(data.data.find((p: any) => p.id === formData.priority_id)?.time_sec);
                    }
                })
            }
        })
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

    function formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const minutesDisplay = minutes > 0 ? `${minutes}m ` : '';
        const secondsDisplay = remainingSeconds > 0 ? `${remainingSeconds}s` : '';

        return `${hours}h ${minutesDisplay}${secondsDisplay}`.trim();
    }

    const fetchTeams = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team/option`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setTeams(data.data);
                    })
                } else {
                    toast.error("Failed to fetch team options");
                }
            }).catch((err) => {
                toast.error("Failed to fetch team options");
            });
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
                    setTicketData(data.data);
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
                        engineer_id: data.data.engineer_id,
                        priority_id: data.data.priority_id,
                        item_category: data.data.item_category
                    });
                })
                .catch((err) => {
                    toast.error("something went wrong while fetching ticket details");
                });
        }
    }

    const handleSendAppointment = () => {
        setmailopen(true);
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

    const fetchShop = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop/option`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setshopOptions(data.data); // Ensure this is updated before proceeding
            } else {
                toast.error("Failed to fetch shop options");
            }
        } catch (err) {
            toast.error("Failed to fetch shop options");
        }
    };

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
            engineer_id: 0,
            priority_id: 0,
            item_category: ""
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
        fetchTeams();
        fetchCustomer();
        fetchEngineer();
        fetchShop();
        getCategoryOption();
    })

    useEffect(() => {
        fetchCustomer();
        fetchShop();
        fetchEngineer();
    }, [formData.shop_id]);

    useEffect(() => {
        if (formData.shop_id != 0) {
            getPriority();
            fetchEngineer();
        }
    }, [shopOptions])


    useEffect(() => {
        if (formData.open_date && formData.open_time && priority_time) {
            const open_date = new Date(formData.open_date + " " + formData.open_time);
            const due_by = open_date.setSeconds(open_date.getSeconds() + priority_time);
            setFormData({
                ...formData,
                due_by: dayjs(due_by).format("YYYY-MM-DD HH:mm")
            })
        }
    }, [formData.open_date, formData.open_time, priority_time])
    return (
        <>
            <EmailAppointmentPage open={mailopen} handleClose={handleMailClose} ticketID={ticketID} ticketData={ticketData} />
            <OpenEmailPreviewPage open={previewopen} handleClose={handlePreviewClose} ticketData={ticketData} />
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
                            HandleShopLatLngChange(shopOptions.find((shop) => shop.id === selectedOption)?.latitude || "", shopOptions.find((shop) => shop.id === selectedOption)?.longitude || "");
                        }}
                        renderInput={(params) => <TextField required {...params} label="Shop" />}
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Autocomplete
                        options={priorityOptions}
                        getOptionLabel={(option) => option.name + ' ' + formatTime(option.time_sec)}
                        value={priorityOptions.find((priority) => priority.name === formData.sla_priority_level) || null}
                        onChange={(event, newValue, reason) => {
                            if (reason === "clear") {
                                setFormData({
                                    ...formData,
                                    priority_id: 0,
                                    sla_priority_level: ""
                                })
                                setpriority_time(0)
                            }
                            const selectedOption = newValue ? newValue.name : "";
                            const selectedOptionID = newValue ? newValue.id : 0;
                            if (!selectedOption) {
                                return;
                            }
                            setFormData({
                                ...formData,
                                priority_id: selectedOptionID,
                                sla_priority_level: selectedOption
                            });
                            setpriority_time(newValue?.time_sec ? newValue.time_sec : 0)
                        }}
                        renderInput={(params) => <TextField required {...params} label="Priority" />}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <DatePicker
                        label="Open Date"
                        name="open_date"
                        slotProps={{ textField: { fullWidth: true, required: true } }}
                        format="DD/MM/YYYY"
                        value={formData.open_date ? dayjs(formData.open_date, "YYYY-MM-DD") : null}
                        onChange={(newValue) => {
                            if (newValue) {
                                setFormData({
                                    ...formData,
                                    open_date: newValue.format('YYYY-MM-DD')
                                });
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TimePicker
                        slotProps={{ textField: { required: true, fullWidth: true } }}
                        label="Open Time"
                        name="open_time"
                        value={dayjs(formData.open_time, 'HH:mm')}
                        timeSteps={{
                            minutes: 1
                        }}
                        onChange={(newValue) => {
                            if (newValue) {
                                setFormData({
                                    ...formData,
                                    open_time: newValue.format('HH:mm')
                                })
                            }
                        }}
                        ampm={false}
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
                        getOptionLabel={(option) => `(${option.open_ticket}) ${option.name} ${option.lastname} ${option.distance ?? 'na'} km`}
                        value={enginnerOption.find((engineer) => engineer.id === formData.engineer_id) || null}
                        onChange={(event, newValue, reason) => {
                            if (reason === "clear") {
                                setFormData({
                                    ...formData,
                                    engineer_id: 0,
                                });
                            }
                            const selectedOption = newValue ? newValue.id : 0;
                            if (!selectedOption) {
                                return;
                            }
                            setFormData({
                                ...formData,
                                engineer_id: selectedOption,
                            });
                        }}
                        renderInput={(params) => <TextField required {...params} label="Engineer" />}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <span
                                    style={{
                                        color: option.open_ticket > 0 ? 'orange' : 'inherit', // Apply orange color if open_ticket > 0
                                    }}
                                >
                                    ({option.open_ticket}) {option.name} {option.lastname} {option.distance ?? 'na'} km
                                </span>
                            </li>
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Autocomplete
                        options={Teams}
                        getOptionLabel={(option) => option.team_name}
                        value={Teams.find((team) => team.team_name === formData.assigned_to) || null}
                        onChange={(event, newValue, reason) => {
                            if (reason === "clear") {
                                setFormData({
                                    ...formData,
                                    assigned_to: "",
                                })
                            }
                            const selectedOption = newValue ? newValue.team_name : "";
                            if (!selectedOption) {
                                return;
                            }
                            setFormData({
                                ...formData,
                                assigned_to: selectedOption
                            });
                        }}
                        renderInput={(params) => <TextField required {...params} label="Assign to" />}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <DatePicker
                        label="appointment date"
                        name="appointment_date"
                        slotProps={{ textField: { fullWidth: true, required: true } }}
                        format="DD/MM/YYYY"
                        value={dayjs(formData.appointment_date, "YYYY-MM-DD")}
                        onChange={(newValue) => {
                            if (newValue) {
                                setFormData({
                                    ...formData,
                                    appointment_date: newValue.format('YYYY-MM-DD')
                                })
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TimePicker
                        slotProps={{ textField: { required: true, fullWidth: true } }}
                        ampm={false}
                        value={dayjs(formData.appointment_time, 'HH:mm')}
                        timeSteps={{
                            minutes: 1
                        }}
                        label="Appointment Time"
                        onChange={(newValue) => {
                            if (newValue) {
                                setFormData({
                                    ...formData,
                                    appointment_time: newValue.format('HH:mm')
                                })
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Autocomplete
                        options={CategoryOption}
                        getOptionLabel={(option) => option.name}
                        value={CategoryOption.find((category) => category.name === formData.item_category) || null}
                        onChange={(event, newValue, reason) => {
                            if (reason === "clear") {
                                setFormData({
                                    ...formData,
                                    item_category: ""
                                })
                            }
                            const selectedOption = newValue ? newValue.name : "";
                            if (!selectedOption) {
                                return;
                            }
                            setFormData({
                                ...formData,
                                item_category: selectedOption || ""
                            });

                        }}
                        renderInput={(params) => <TextField required {...params} label="Equipment" />}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <DateTimePicker
                        value={formData.due_by ? dayjs(formData.due_by, "YYYY-MM-DD HH:mm") : null}
                        label="Due Date"
                        ampm={false}
                        timeSteps={{
                            minutes: 1
                        }}
                        format="DD/MM/YYYY HH:mm"
                        slotProps={{
                            textField: {
                                fullWidth: true
                            }
                        }}
                        readOnly
                    />
                </Grid>
            </Grid>
            <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                <Button onClick={handleClose} variant="contained" color="warning">
                    Close
                </Button>
                <Button variant="contained" color="error" onClick={handleMailOpen}>
                    Send Open
                </Button>
                <Button variant="contained" color="error" onClick={handleSendAppointment}>
                    Send Appointment
                </Button>
                <Button type="submit" variant="contained" color="success" onClick={handleSubmit}>
                    Update
                </Button>
            </Stack>
        </>
    )
}