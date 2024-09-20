import { authClient } from "@/lib/auth/client";
import { EmailOutlined, SendAndArchiveOutlined } from "@mui/icons-material";
import { Box, Button, Divider, Modal, Stack, TextField, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function EmailAppointmentPage({ open, handleClose, ticketID }: { open: boolean, handleClose: () => void, ticketID: number }): React.JSX.Element {
    const [remark, setRemark] = useState("");
    const handleSendMail = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, send it!'
        }).then((result) => {
            if (result.isConfirmed) {
                // make a toast loading waiting for fetch reponse
                toast.promise(
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/appointmentMail/${ticketID}`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${authClient.getToken()}`,
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({ remark: remark }),
                    }).then((res) => {
                        if (res.ok) {
                            handleClose();
                        }
                    }),
                    {
                        pending: 'Sending mail, please wait...',  // Message shown while the promise is pending
                        success: 'Mail sent successfully!',       // Message shown if the promise resolves
                        error: 'Failed to send mail. Please try again.', // Message shown if the promise rejects
                    }
                );
            }
        })
    }

    return (
        <Modal onClose={handleClose} open={open} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ width: { xs: '90%', md: '50%', lg: '40%', xl: '40%' }, bgcolor: 'background.paper', p: 3, borderRadius: 3 }}>
                <Stack spacing={3}>
                    <Typography variant="h6">Email Preview</Typography>
                    <TextField
                        fullWidth
                        name="remark"
                        label="Remark (optional)"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                    />
                </Stack>
                <Divider />
                <Stack justifyContent={"flex-end"} direction="row" spacing={2}>
                    <Button onClick={handleClose} variant="contained" color="warning">
                        Close
                    </Button>
                    <Button startIcon={<EmailOutlined />} variant="contained" color="error" onClick={handleSendMail}>
                        Send
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
}
