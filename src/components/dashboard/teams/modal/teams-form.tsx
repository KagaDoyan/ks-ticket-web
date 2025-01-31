import { Box, Modal, Button, TextField, Typography, Stack, Autocomplete } from "@mui/material";
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
const roles = ["Admin", "team"];
interface Customer {
    id: number;
    fullname: string;
    shortname: string;
}
export default function TeamModalForm({ open, handleClose, teamID, fetchteamData }: { open: boolean, handleClose: () => void, teamID: number, fetchteamData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        team_name: "",
        customers_id: 0,
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
    useEffect(() => {
        GetCustomer();
    }, [])

    const getteamData = () => {
        if (teamID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team/${teamID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        res.json().then((data) => {
                            setFormData({
                                team_name: data.team_name,
                                customers_id: data.customers_id
                            });
                        })
                    } else {
                        throw new Error("Failed to fetch team data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch team data");
                });
        }
    }

    const clearFormData = () => {
        setFormData({
            team_name: "",
            customers_id: 0,
        });
    }

    useEffect(() => {
        getteamData();
        if (teamID == 0) {
            clearFormData()
        }
    }, [teamID]);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (teamID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team/${teamID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("team updated successfully");
                        fetchteamData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update team");
                    }
                }).catch((err) => {
                    toast.error("Failed to update team");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("team created successfully");
                        fetchteamData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create team");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create team");
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
                    team Form
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
                        label="Team Name"
                        name="team_name"
                        value={formData.team_name}
                        onChange={handleChange}
                        required
                    />
                    <Autocomplete
                        options={customers}
                        getOptionLabel={(option) => option.fullname}
                        value={customers.find((customer: any) => customer.id === formData.customers_id) || null}
                        onChange={(event, newValue) => {
                            const selectedId = newValue ? newValue.id : 0;
                            setFormData({
                                ...formData,
                                customers_id: selectedId
                            })
                        }}
                        renderInput={(params) => <TextField {...params} label="Customer" />}
                    />
                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={handleClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {teamID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}