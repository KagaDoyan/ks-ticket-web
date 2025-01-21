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
interface Province {
    id: number;
    name: string;
    code: string;
}
export default function NodeModalForm({ open, handleClose, nodeID, fetchnodeData }: { open: boolean, handleClose: () => void, nodeID: number, fetchnodeData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        name: "",
        province_id: [] as number[],
        node_time: null as number | null
    });
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

    const getnodeData = () => {
        if (nodeID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/node/${nodeID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        res.json().then((data) => {
                            const array_of_provinceID = data.data.province.map((p: Province) => p.id);
                            setFormData({
                                name: data.data.name,
                                province_id: array_of_provinceID,
                                node_time: data.data.node_time
                            });
                        })
                    } else {
                        throw new Error("Failed to fetch node data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch node data");
                });
        }
    }

    const clearFormData = () => {
        setFormData({
            name: "",
            province_id: [],
            node_time: null
        });
    }

    useEffect(() => {
        getnodeData();
        if (nodeID == 0) {
            clearFormData()
        }
    }, [nodeID]);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nodeID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/node/${nodeID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("node updated successfully");
                        fetchnodeData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update node");
                    }
                }).catch((err) => {
                    toast.error("Failed to update node");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/node`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("node created successfully");
                        fetchnodeData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create node");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create node");
                });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleChangeProvince = (event: React.SyntheticEvent, value: Province[]) => {
        setFormData({
            ...formData,
            province_id: value.map((province) => province.id)
        });
    };

    useOnMount(() => {
        getProvinceData();
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
                    Node Form
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
                        name="name"
                        label="Node Name"
                        variant="outlined"
                        value={formData.name}
                        onChange={handleChange}
                    />
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

                    <TextField
                        name="node_time"
                        label="Node Time"
                        variant="outlined"
                        value={formData.node_time}
                        onChange={handleChange}
                    />

                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={handleClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {nodeID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}