import { Box, Modal, Button, TextField, Typography, Stack, Autocomplete, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth/client";
import ReactQuill from 'react-quill'; // Rich text editor
import 'react-quill/dist/quill.snow.css'; // Quill CSS
import useOnMount from "@mui/utils/useOnMount";
import { maxHeight } from "@mui/system";

const style = {
    position: 'absolute' as 'absolute',
    padding: 10,
    borderRadius: 3,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    maxHeight: '80%',
    overflow: 'scroll',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

interface Customer {
    id: number;
    fullname: string;
    shortname: string;
}

interface FormData {
    signature_body: string;
    customer_id: number;
    image_path: string;
}

interface EmailSignatureModalFormProps {
    open: boolean;
    handleClose: () => void;
    emailID: number;
    fetchbrandData: () => void;
}

const roles = ["Admin", "brand"];

export default function EmailSignatureModalForm({
    open,
    handleClose,
    emailID,
    fetchbrandData
}: EmailSignatureModalFormProps): React.JSX.Element {
    const [formData, setFormData] = useState<FormData>({
        signature_body: "",
        customer_id: 0,
        image_path: "",
    });
    const [upload_image, setUploadImage] = useState<File | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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
                    });
                }
            });
    };

    const handleCloseModal = () => {
        setFormData({
            signature_body: "",
            customer_id: 0,
            image_path: "",
        });
        setUploadImage(null);
        setPreviewImage(null);
        handleClose();
    };

    const getbrandData = () => {
        if (emailID) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mail_signature/${emailID}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
                .then((res) => {
                    if (res.ok) {
                        res.json().then((data) => {
                            setFormData({
                                signature_body: data.data.signature_body,
                                customer_id: data.data.customers_id,
                                image_path: data.data.image
                            });
                        });
                    } else {
                        throw new Error("Failed to fetch email recipient data");
                    }
                }).catch((err) => {
                    toast.error("Failed to fetch email recipient data");
                });
        }
    };

    const clearFormData = () => {
        setFormData({
            signature_body: "",
            customer_id: 0,
            image_path: "",
        });
        setUploadImage(null);
        setPreviewImage(null);
    };

    useEffect(() => {
        getbrandData();
        if (emailID == 0) {
            clearFormData();
        }
    }, [emailID]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formDataToSubmit = new FormData();
        formDataToSubmit.append('signature_body', formData.signature_body);
        formDataToSubmit.append('customer_id', formData.customer_id.toString());
        formDataToSubmit.append('image_path', formData.image_path);
        if (upload_image) {
            formDataToSubmit.append('upload_image', upload_image);
        }
        const method = emailID ? 'PUT' : 'POST';
        const url = emailID
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/mail_signature/${emailID}`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/mail_signature`;

        fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`,
            },
            body: formDataToSubmit
        })
            .then((res) => {
                if (res.ok) {
                    const successMessage = emailID
                        ? "Email signature updated successfully"
                        : "Email signature created successfully";
                    toast.success(successMessage);
                    fetchbrandData();
                    handleClose();
                    clearFormData();
                } else {
                    throw new Error("Failed to save email signature");
                }
            }).catch((err) => {
                toast.error("Failed to save email signature");
            });
    };

    useOnMount(() => {
        GetCustomer();
    });

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
        if (event.target.files) {
            setUploadImage(event.target.files[0]);
            setPreviewImage(URL.createObjectURL(event.target.files[0]));
        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Email Signature Form
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
                    <Autocomplete
                        options={customers}
                        getOptionLabel={(option) => option.fullname}
                        value={customers.find((customer) => customer.id === formData.customer_id) || null}
                        onChange={(event, newValue) => {
                            const selectedId = newValue ? newValue.id : 0;
                            setFormData({
                                ...formData,
                                customer_id: selectedId
                            });
                        }}
                        renderInput={(params) => <TextField {...params} label="Customer" />}
                    />

                    <Typography variant="subtitle1">Signature Body:</Typography>
                    <ReactQuill
                        style={{ height: '200px' }}
                        theme="snow"
                        value={formData.signature_body}

                        onChange={(value: any) => setFormData({ ...formData, signature_body: value })}
                    />

                    <Typography variant="subtitle1"></Typography>
                    <Typography variant="subtitle1"></Typography>
                    <Typography variant="subtitle1">Upload Image</Typography>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                    />

                    {formData.image_path && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">Current Image:</Typography>
                            <img
                                src={process.env.NEXT_PUBLIC_API_URL + "/image/" + formData.image_path}
                                alt="Current Signature"
                                style={{ width: '100px', maxHeight: '100px', objectFit: 'contain' }}
                            />
                        </Grid>
                    )}

                    {/* Display Preview Image */}
                    {previewImage && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">Image Preview:</Typography>
                            <img
                                src={previewImage}
                                alt="Preview Signature"
                                style={{ width: '100px', maxHeight: '100px', objectFit: 'contain' }}
                            />
                        </Grid>
                    )}

                    <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                        <Button onClick={handleCloseModal} variant="contained" color="warning">
                            Close
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            {emailID ? "Update" : "Add"}
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Modal>
    );
}
