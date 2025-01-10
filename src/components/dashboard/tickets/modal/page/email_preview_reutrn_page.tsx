import { authClient } from "@/lib/auth/client";
import { EmailOutlined, SendAndArchiveOutlined } from "@mui/icons-material";
import { Box, Button, Divider, Modal, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function ReturnEmailPreviewPage({ open, handleClose, ticketData }: { open: boolean, handleClose: () => void, ticketData: any }): React.JSX.Element {

    const status_title = "Return Case";

    const deviceListClean = ticketData?.return_item.filter((element: any) => element.item_type == "spare" && (element.status == "return" || element.status == "replace"));
    const replaceDeviceListClean = ticketData?.return_item.filter((element: any) => element.item_type == "store" && (element.status == "return" || element.status == "replace"));

    const oldDeviceLabel = "   เก่า<br>";
    const newDeviceLabel = "   ใหม่<br>";

    const deviceListCleanMapped = deviceListClean?.map((element: any) => `• ${element.category} ${element.brand} ${element.model} s/n: ${element.serial_number} ${oldDeviceLabel}`);
    const replaceDeviceListCleanMapped = replaceDeviceListClean?.map((element: any) => `• ${element.category} ${element.brand} ${element.model} s/n: ${element.serial_number} ${newDeviceLabel}`);

    const deviceStr = deviceListCleanMapped?.join('');
    const replaceDeviceStr = replaceDeviceListCleanMapped?.join('');
    const incNumber = ticketData?.inc_number === "n/a" ? ticketData?.ticket_number : ticketData?.inc_number;

    const mailHeader = `แจ้งปิดงาน | ${incNumber ? incNumber : ticketData?.ticket_number}`;

    const htmlString = `
    <h3>${mailHeader}</h3><br>
    <h3>Service Detail</h3><br>
    <table style="width:100%;text-align:left;">
        <tr><th style="vertical-align:top">Service Number</th><td style="vertical-align:top">${ticketData?.ticket_number}</td></tr>
        <tr><th style="vertical-align:top">Engineer</th><td style="vertical-align:top">${ticketData?.return_ticket?.engineer.name} ${ticketData?.return_ticket?.engineer.lastname}</td></tr>
        <tr><th style="vertical-align:top">Equipment</th><td style="vertical-align:top">${ticketData?.return_ticket?.item_category}</td></tr>
        <tr><th style="vertical-align:top">Investigation</th><td style="vertical-align:top">${ticketData?.return_ticket?.investigation}</td></tr>
        <tr><th style="vertical-align:top">Solution</th><td style="vertical-align:top">${ticketData?.return_ticket?.solution}<br>${deviceStr}${replaceDeviceStr}</td></tr>
        <tr><th style="vertical-align:top">Appointment Time</th><td style="vertical-align:top">${dayjs(ticketData?.appointment_date).format('DD-MM-YYYY')} ${ticketData?.appointment_time}</td></tr>
        <tr><th style="vertical-align:top">Time Start</th><td style="vertical-align:top">${dayjs(ticketData?.return_ticket?.time_in).format('DD-MM-YYYY HH:mm')}</td></tr>
        <tr><th style="vertical-align:top">Time Finish</th><td style="vertical-align:top">${dayjs(ticketData?.return_ticket?.time_out).format('DD-MM-YYYY HH:mm')}</td></tr>
    </table>`;

    const BodyData = ({ ticketData }: { ticketData: any }) => {
        return (
            <div dangerouslySetInnerHTML={{ __html: htmlString }}>

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
                toast.promise(
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/return_mail/${ticketData.id}`, {
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
            <Box sx={{ width: { xs: '90%', md: '50%', lg: '40%', xl: '40%' }, maxHeight: '90%', overflow: "scroll", bgcolor: 'background.paper', p: 3, borderRadius: 3 }}>
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
