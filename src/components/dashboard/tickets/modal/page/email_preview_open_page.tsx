import { authClient } from "@/lib/auth/client";
import { EmailOutlined, SendAndArchiveOutlined } from "@mui/icons-material";
import { Box, Button, Divider, Modal, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function OpenEmailPreviewPage({ open, handleClose, ticketData }: { open: boolean, handleClose: () => void, ticketData: any }): React.JSX.Element {


    function formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const minutesDisplay = minutes > 0 ? `${minutes}m ` : '';
        const secondsDisplay = remainingSeconds > 0 ? `${remainingSeconds}s` : '';

        return `${hours}h ${minutesDisplay}${secondsDisplay}`.trim();
    }
    const BodyData = ({ ticket }: { ticket: any }) => {
        return (
            <div dir="ltr">
                <p className="MsoNormal">
                    <b>
                        <span >
                            Ticket Number (<span lang="TH">เลขที่ใบแจ้งงาน</span>):&nbsp;
                        </span>
                    </b>
                    <span style={{}}>
                        {ticket.ticket_number}
                    </span>
                </p>



                <p className="MsoNormal" style={{ margin: '0cm', }}>
                    <b>
                        <span >
                            Contact (<span lang="TH">ผู้แจ้ง</span>)
                        </span>
                    </b>
                    <span lang="TH" >
                        : {ticket.contact_name}
                    </span>
                </p>



                <p className="MsoNormal" style={{ margin: '0cm', }}>
                    <b>
                        <span >
                            Phone (<span lang="TH">เบอร์โทร</span>)
                        </span>
                    </b>
                    <span lang="TH" >:&nbsp;</span>
                    <span style={{}}>
                        {ticket?.contact_tel}
                    </span>
                </p>



                <p className="MsoNormal" style={{ margin: '0cm', }}>
                    <b>
                        <span >
                            Store (<span lang="TH">สาขา</span>):&nbsp;
                        </span>
                    </b>
                    <span style={{}}>
                        {ticket.shop.shop_number}-{ticket.shop.shop_name}
                    </span>
                </p>



                <p className="MsoNormal" style={{ margin: '0cm', }}>
                    <b>
                        <span >
                            Description (<span lang="TH">รายละเอียด</span>):&nbsp;
                        </span>
                    </b>
                    <span style={{}}>
                        {ticket.description}
                    </span>
                </p>



                <p className="MsoNormal" style={{ margin: '0cm', }}>
                    <b>
                        <span >
                            Incident open date/time (<span lang="TH">วันและเวลาที่เปิดงาน</span>):&nbsp;
                        </span>
                    </b>
                    <span >
                        {dayjs(ticket.open_date).format('DD/MM/YYYY')} {ticket.open_time}
                    </span>
                </p>



                <p className="MsoNormal" style={{ margin: '0cm', }}>
                    <b>
                        <span >
                            Estimate Resolving Time (เวลาแก้ไขโดยประมาณ):&nbsp;
                        </span>
                    </b>
                    <span >
                        {ticket.prioritie?.name} {formatTime(parseInt(ticket.prioritie?.time_sec!))}
                    </span>
                </p>



                <p className="MsoNormal" style={{ margin: '0cm', }}>
                    <b>
                        <span >
                            DueBy Date (<span lang="TH">วันและเวลาที่ครบกำหนด</span>):&nbsp;
                        </span>
                    </b>
                    <span style={{}}>
                        {dayjs(ticket.due_by).format('DD/MM/YYYY hh:mm')}
                    </span>
                </p>



                <p className="MsoNormal" style={{ margin: '0cm', color: 'gray' }}>
                    <b>
                        <span >
                            --
                        </span>
                    </b>
                </p>
                <p className="MsoNormal" style={{ margin: '0cm', color: 'gray' }}>
                    <b>
                        <span >
                            IT Helpdesk
                        </span>
                    </b>
                </p>
                <p className="MsoNormal" style={{ margin: '0cm', color: 'gray' }}>
                    <b>
                        <span >
                            Advice IT Infinite Public Company Limited
                        </span>
                    </b>
                </p>
                <p className="MsoNormal" style={{ margin: '0cm', color: 'gray' }}>
                    <b>
                        <span >
                            Mobile: 02-4609281
                        </span>
                    </b>
                </p>
                <img
                    src="https://ci3.googleusercontent.com/meips/ADKq_NYL6cddsWyQInr61nMcO_OyGtQq11kCk0jN2o2yHPpPQK7Pof66Bez1rWvC6Fh_jLa9WU6_AkUxZJ-ft0yfTGiyZp5DeoYPdStDzDiO_8Gyf1fQQehbricff1bWWOekRsBpg74=s0-d-e1-ft#https://img.advice.co.th/images_nas/advice/oneweb/assets/images/logo-color.png"
                    width="96"
                    height="43"
                    style={{ filter: 'grayscale(100%)' }}
                    alt="Company Logo"
                />


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
                const toastID = toast.loading('Sending mail, please wait...');
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/open_mail/${ticketData.id}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${authClient.getToken()}`,
                    }
                }).then((res) => {
                    if (res.ok) {
                        toast.update(toastID, {
                            render: 'Mail sent successfully',
                            type: 'success',
                            isLoading: false,
                            autoClose: 2000,
                        })
                    } else {
                        toast.update(toastID, {
                            render: 'Failed to send mail',
                            type: 'error',
                            isLoading: false,
                            autoClose: 2000,
                        })
                    }
                })

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
                    <BodyData ticket={ticketData} />
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
