import { Box, Modal, Button, TextField, Typography, Stack } from "@mui/material";
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
export default function PriorityModalForm({ open, handleClose, prioritiesID, priority_group_id, fetchprioritiesData }: { open: boolean, handleClose: () => void, prioritiesID: number, priority_group_id: number, fetchprioritiesData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        name: "",
        time_sec: 0,
        priority_groups_id: priority_group_id,
    });

    const GetPriorityGroupData = () => {
        if (prioritiesID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/priority/${prioritiesID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        res.json().then((data) => {
                            setFormData({
                                name: data.data.name,
                                time_sec: data.data.time_sec,
                                priority_groups_id: data.data.priority_groups_id
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

    const clearFormData = () => {
        setFormData({
            name: "",
            time_sec: 0,
            priority_groups_id: priority_group_id,
        });
    }

    useEffect(() => {
        GetPriorityGroupData();
        if (prioritiesID == 0) {
            clearFormData()
        }
    }, [prioritiesID]);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prioritiesID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/priority/${prioritiesID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify({
                    ...formData,
                    priority_groups_id: priority_group_id,
                })
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("priority group updated successfully");
                        fetchprioritiesData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update priority group");
                    }
                }).catch((err) => {
                    toast.error("Failed to update priority group");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/priority`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify({
                    ...formData,
                    priority_groups_id: priority_group_id,
                })
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("priority group created successfully");
                        fetchprioritiesData();
                        handleClose();
                        clearFormData();
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
            onClose={handleClose}
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
                    <TextField
                        label="priority name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="time (in second format)"
                        name="time_sec"
                        type="number"
                        value={formData.time_sec}
                        onChange={handleChange}
                        required
                    />
                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={handleClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {prioritiesID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}