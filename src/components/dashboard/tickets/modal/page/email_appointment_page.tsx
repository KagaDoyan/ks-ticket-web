import { authClient } from "@/lib/auth/client";
import { EmailOutlined, SendAndArchiveOutlined } from "@mui/icons-material";
import { Box, Button, Divider, Modal, Stack, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function EmailAppointmentPage({ open, handleClose, ticketID, ticketData }: { open: boolean, handleClose: () => void, ticketID: number, ticketData: any }): React.JSX.Element {
    const [remark, setRemark] = useState("");

    function formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const minutesDisplay = minutes > 0 ? `${minutes}m ` : '';
        const secondsDisplay = remainingSeconds > 0 ? `${remainingSeconds}s` : '';

        return `${hours}h ${minutesDisplay}${secondsDisplay}`.trim();
    }
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
        <>
            <Modal onClose={handleClose} open={open} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ width: { xs: '90%', md: '50%', lg: '40%', xl: '40%' }, bgcolor: 'background.paper', p: 3, borderRadius: 3 }}>
                    <Stack spacing={3}>
                        <Typography variant="h6">Email Preview</Typography>
                    </Stack>
                    <div>
                        <p>Open Case {ticketData.inc_number === "n/a" ? ticketData.ticket_number : ticketData.inc_number}</p>
                        <p>Title: {ticketData.title}</p>
                        <p>Cases Number: {ticketData.ticket_number}</p>
                        <p>Store ID: {ticketData.shop?.shop_number}</p>
                        <p>Store Name: {ticketData.shop?.shop_name}</p>
                        <p>Province: {ticketData.shop?.province?.name}</p>
                        <p>Contact Name: {ticketData.contact_name}</p>
                        <p>Contact Phone: {ticketData.contact_tel}</p>
                        <p>
                            Priority: {ticketData.sla_priority_level} {formatTime(parseInt(ticketData.prioritie?.time_sec || "0"))}
                        </p>
                        <p>Engineer: {ticketData.engineer?.name} {ticketData.engineer?.lastname}</p>
                        <p>Appointment: {dayjs(ticketData.appointment_date).format('DD-MM-YYYY')} {ticketData.appointment_time}</p>
                        <br />
                        <p>
                            ช่างนัดหมายสาขาวันที่ {dayjs(ticketData.appointment_date).format('DD-MM-YYYY')} {ticketData.appointment_time}{" "}
                            {remark || "เนื่องจากสาขาสะดวกให้เข้าเวลาดังกล่าว"}
                        </p>
                    </div>
                    <TextField
                        fullWidth
                        name="remark"
                        label="Remark (optional)"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                    />
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
        </>
    );
}
