import { authClient } from "@/lib/auth/client";
import { EmailOutlined, SendAndArchiveOutlined } from "@mui/icons-material";
import { Box, Button, Divider, Modal, Stack, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function EmailPreviewPage({ open, handleClose, ticketData }: { open: boolean, handleClose: () => void, ticketData: any }): React.JSX.Element {

    const BodyData = ({ ticketData }: { ticketData: any }) => {
        return (
            <div>
                <h3 id="mail-header">แจ้งปิดงาน | {ticketData.inc_number === "n/a" ? ticketData.ticket_number : ticketData.inc_number}</h3><br />
                <h3 style={{ marginBottom: '20px' }}>Service Detail</h3><br />
                <table style={{ width: '100%', textAlign: 'left' }}>
                    <tbody>
                        <tr>
                            <th style={{ verticalAlign: 'top' }}>Service Number</th>
                            <td style={{ verticalAlign: 'top' }} id="ticket-id">{ticketData.ticket_number}</td>
                        </tr>
                        <tr>
                            <th style={{ verticalAlign: 'top' }}>Engineer</th>
                            <td style={{ verticalAlign: 'top' }} id="engineer-name">{ticketData.engineer ? ticketData.engineer.name + " " + ticketData.engineer.lastname : "n/a"}</td>
                        </tr>
                        <tr>
                            <th style={{ verticalAlign: 'top' }}>Equipment</th>
                            <td style={{ verticalAlign: 'top' }} id="equipment">{ticketData.item_category + " " + ticketData.brand + " " + ticketData.model}</td>
                        </tr>
                        <tr>
                            <th style={{ verticalAlign: 'top' }}>Investigation</th>
                            <td style={{ verticalAlign: 'top' }} id="problem">{ticketData.investigation}</td>
                        </tr>
                        <tr>
                            <th style={{ verticalAlign: 'top' }}>Solution</th>
                            <td style={{ verticalAlign: 'top' }}>
                                <div id="solution">{ticketData.solution}</div>
                                <div id="device-list">{ticketData.spare_item ? ticketData.spare_item.map((item: any, index: number) => <p key={index}>• {item.category} {item.model} S/N: {item.serial_number} เก่า</p>) : ""}</div>
                                <div id="replace-device-list">{ticketData.store_item ? ticketData.store_item.map((item: any, index: number) => <p key={index}>• {item.category} {item.model} S/N: {item.serial_number} ใหม่</p>) : ""}</div>
                            </td>
                        </tr>
                        <tr>
                            <th style={{ verticalAlign: 'top' }}>Appointment Time</th>
                            <td style={{ verticalAlign: 'top' }} id="appointment-time">{ticketData.appointment_date + " " + ticketData.appointment_time}</td>
                        </tr>
                        <tr>
                            <th style={{ verticalAlign: 'top' }}>Time Start</th>
                            <td style={{ verticalAlign: 'top' }} id="time-start">{ticketData.time_in}</td>
                        </tr>
                        <tr>
                            <th style={{ verticalAlign: 'top' }}>Time Finish</th>
                            <td style={{ verticalAlign: 'top' }} id="time-finish">{ticketData.time_out}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    };

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
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/mail/${ticketData.id}`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${authClient.getToken()}`,
                        },
                    }).then((response) => {
                        // Check if the response is ok (status code in the range 200-299)
                        if (!response.ok) {
                            throw new Error('Failed to send mail');
                        }
                        return response.json(); // Or return response, based on your needs
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
                </Stack>
                <Divider />
                <Box>
                    <BodyData ticketData={ticketData} />
                </Box>
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
