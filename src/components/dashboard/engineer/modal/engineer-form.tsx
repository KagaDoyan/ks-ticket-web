import { Box, Modal, Button, TextField, Typography, Stack, IconButton, InputAdornment, Grid, InputLabel, Autocomplete, Chip } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth/client";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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

interface node {
    id: number;
    name: string;
}

export default function EngineerModalForm({ open, handleClose, engineerID, fetchengineerData }: { open: boolean, handleClose: () => void, engineerID: number, fetchengineerData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        name: "",
        lastname: "",
        phone: "",
        line_name: "",
        latitude: "",
        longitude: "",
        province_id: [] as number[],
        node: "",
        node_id: 0,
        email: "",
        password: ""
    });

    const [nodes, setNodes] = useState<node[]>([]);

    const [showPassword, setShowPassword] = useState(false);
    const [provinceData, setProvinceData] = useState<Province[]>([]);

    const handleChangeProvince = (event: React.SyntheticEvent, value: Province[]) => {
        setFormData({
            ...formData,
            province_id: value.map((province) => province.id)
        });
    };

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

    const getNodedata = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/node/option`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setNodes(data.data);
                    })
                } else {
                    throw new Error("Failed to fetch node data");
                }
            }).catch((err) => {
                toast.error("Failed to fetch node data");
            });
    };

    const getEngineerData = () => {
        if (engineerID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/engineer/${engineerID}`, {
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
                                lastname: data.data.lastname,
                                phone: data.data.phone,
                                line_name: data.data.line_name,
                                latitude: data.data.latitude,
                                longitude: data.data.longitude,
                                province_id: array_of_provinceID,
                                node: data.data.node,
                                email: data.data.email,
                                node_id: data.data.node_id,
                                password: ""
                            });
                        })
                    } else {
                        throw new Error("Failed to fetch engineer data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch engineer data");
                });
        }
    };

    const clearFormData = () => {
        setFormData({
            name: "",
            lastname: "",
            phone: "",
            line_name: "",
            latitude: "",
            longitude: "",
            province_id: [],
            node: "",
            node_id: 0,
            email: "",
            password: ""
        });
    };

    useEffect(() => {
        getEngineerData();
        if (engineerID == 0) {
            clearFormData();
        }
    }, [engineerID]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (engineerID) {
            // update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/engineer/${engineerID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("Engineer updated successfully");
                        fetchengineerData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update engineer");
                    }
                }).catch((err) => {
                    toast.error("Failed to update engineer");
                });

        } else {
            // create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/engineer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("Engineer created successfully");
                        fetchengineerData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create engineer");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create engineer");
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

    useOnMount(() => {
        getProvinceData();
        getNodedata();
    });

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Engineer Form
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
                                label="First Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Last Name"
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleChange}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Line Name"
                                name="line_name"
                                value={formData.line_name}
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
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={nodes}
                                getOptionLabel={(option) => option.name}
                                value={nodes.find((node) => node.id === formData.node_id) || null}
                                onChange={(event, newValue) => {
                                    const selectedId = newValue ? newValue.id : 0;
                                    setFormData({
                                        ...formData,
                                        node_id: selectedId
                                    })
                                }}
                                renderInput={(params) => <TextField {...params} label="Node" />}
                            />
                        </Grid>
                        {
                            engineerID ?
                                ""
                                :
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
                        }
                        {
                            engineerID ?
                                ""
                                :
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        fullWidth
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={togglePasswordVisibility}
                                                    >
                                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                        }
                    </Grid>
                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={handleClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {engineerID ? "Update" : "Add"}
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Modal>
    );
}
