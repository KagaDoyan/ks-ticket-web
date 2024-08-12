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
const roles = ["Admin", "category"];
export default function CategoryModalForm({ open, handleClose, categoryID, fetchcategoryData }: { open: boolean, handleClose: () => void, categoryID: number, fetchcategoryData: () => void }): React.JSX.Element {
    const [formData, setFormData] = useState({
        name: "",
    });

    const getcategoryData = () => {
        if (categoryID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/${categoryID}`, {
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
                            });
                        })
                    } else {
                        throw new Error("Failed to fetch category data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch category data");
                });
        }
    }

    const clearFormData = () => {
        setFormData({
            name: "",
        });
    }

    useEffect(() => {
        getcategoryData();
        if (categoryID == 0) {
            clearFormData()
        }
    }, [categoryID]);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (categoryID) {
            //update
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/${categoryID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("category updated successfully");
                        fetchcategoryData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to update category");
                    }
                }).catch((err) => {
                    toast.error("Failed to update category");
                });

        } else {
            //create
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
                body: JSON.stringify(formData)
            })
                .then((res) => {
                    if (res.ok) {
                        toast.success("category created successfully");
                        fetchcategoryData();
                        handleClose();
                        clearFormData();
                    } else {
                        throw new Error("Failed to create category");
                    }
                })
                .catch((err) => {
                    toast.error("Failed to create category");
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
                    category Form
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
                        label="category Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={handleClose} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {categoryID ? "Update" : "Add"}
                        </Button>
                    </Stack>

                </Box>
            </Box>
        </Modal>
    )
}