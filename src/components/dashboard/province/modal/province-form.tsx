import { Box, Modal, Button, TextField, Typography, Stack, Select, FormControl, InputLabel, MenuItem, SelectChangeEvent, Autocomplete } from "@mui/material";
import { useEffect, useState} from "react";
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
interface priorityGroup {
    id: number
    group_name: string
}
export default function ProvinceModalForm({ open, handleClose, provinceID, fetchprovinceData }: { open: boolean, handleClose: () => void, provinceID: number, fetchprovinceData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        priority_group_id: 0,
    });
    const [priorityGroupOption, setPriorityGroupOption] = useState<priorityGroup[]>([]);

    const getprovinceData = () => {
        if (provinceID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/province/${provinceID}`, {
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
                                code: data.data.code,
                                priority_group_id: data.data.priority_group_id
                            });
                        })
                    } else {
                        throw new Error("Failed to fetch province data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch province data");
                });
        }
    }

    const getPriorityGroupOption = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/priorityGroup/option`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setPriorityGroupOption(data.data);
                        console.log(data.data);

                    })
                } else {
                    throw new Error("Failed to fetch priority group data");
                }
            }).catch((err) => {
                toast.error("Failed to fetch priority group data");
            })

    }

    const clearFormData = () => {
        setFormData({
            name: "",
            code: "",
            priority_group_id: 0,
        });
    }

    useEffect(() => {
        getprovinceData();
        if (provinceID == 0) {
            clearFormData()
        }
    }, [provinceID]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (provinceID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/province/${provinceID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("province updated successfully");
                        fetchprovinceData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update province");
                    }
                }).catch((err) => {
                    toast.error("Failed to update province");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/province`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("province created successfully");
                        fetchprovinceData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create province");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create province");
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
        getPriorityGroupOption();
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
                    province Form
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
                        label="province Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="province Code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                    />
                    <Autocomplete
                        id="group-select"
                        options={priorityGroupOption}
                        getOptionLabel={(option) => option.group_name} // specify the label property here
                        value={priorityGroupOption.find((group) => group.id === formData.priority_group_id) || null}
                        onChange={(event, newValue) => {
                            const selectedOption = newValue ? newValue.id : 0;
                            setFormData({
                                ...formData,
                                priority_group_id: selectedOption
                            });
                            console.log(formData);
                        }}
                        renderInput={(params) => <TextField required {...params} label="Priority group" />}
                    />
                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={handleClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {provinceID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}