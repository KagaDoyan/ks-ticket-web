'use client'

import { Avatar, Box, Card, CardContent, Grid, Stack, Table, TableBody, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import { Receipt } from "@mui/icons-material";
import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import AlertModal from "./modal/alert_modal";
import { authClient } from "@/lib/auth/client";
import useOnMount from "@mui/utils/useOnMount";
import dayjs from "dayjs";

interface TicketData {
    ticket_status: string;
    customer: { shortname: string };
}

export default function DashboardPage(): React.JSX.Element {
    const [ticketData, setTickets] = useState<TicketData[]>([]);
    const [series, setSeries] = useState<any[]>([]);
    const [startdata, setStartDate] = useState<string>(dayjs(Date.now() - 7 * 24 * 60 * 60 * 1000).format('YYYY-MM-DD'));
    const [enddata, setEndDate] = useState<string>(dayjs(Date.now()).format('YYYY-MM-DD'));
    const [customers, setCustomers] = useState<string[]>([]);
    const [modal_open, setModalOpen] = useState(false);

    const handleModalClose = () => setModalOpen(false);

    useEffect(() => {
        fetchCustomer();
        fetchTicketByDate();
    }, [startdata, enddata]);

    useEffect(() => {
        const initialSeries: { name: string, data: number[] }[] = ["open", "pending", "spare", "close"].map(status => (
            {
                name: status.charAt(0).toUpperCase() + status.slice(1),
                data: []
            }
        ));
        customers.forEach((customer) => {
            const seriesIndexOpen = initialSeries.findIndex(series => series.name.toLowerCase() === 'open');
            const seriesIndexPending = initialSeries.findIndex(series => series.name.toLowerCase() === 'pending');
            const seriesIndexSpare = initialSeries.findIndex(series => series.name.toLowerCase() === 'spare');
            const seriesIndexClosed = initialSeries.findIndex(series => series.name.toLowerCase() === 'close');
            initialSeries[seriesIndexOpen].data.push(ticketData.filter((ticket) => ticket.ticket_status === 'open' && ticket.customer.shortname === customer).length);
            initialSeries[seriesIndexPending].data.push(ticketData.filter((ticket) => ticket.ticket_status === 'pending' && ticket.customer.shortname === customer).length);
            initialSeries[seriesIndexSpare].data.push(ticketData.filter((ticket) => ticket.ticket_status === 'spare' && ticket.customer.shortname === customer).length);
            initialSeries[seriesIndexClosed].data.push(ticketData.filter((ticket) => ticket.ticket_status === 'close' && ticket.customer.shortname === customer).length);
        });
        setSeries(initialSeries);
    }, [ticketData]);

    const fetchCustomer = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/option`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        }).then((res) => {
            if (res.ok) {
                res.json().then((data) => {
                    const customersList = data.data.map((customer: any) => customer.shortname);
                    setCustomers(customersList);
                });
            }
        }).catch(err => {
            console.error("Failed to fetch customers:", err);
        });
    };

    const fetchTicketByDate = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/dashboard?start=${startdata}&end=${enddata}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        }).then((res) => {
            if (res.ok) {
                res.json().then((data) => {
                    setTickets(data.data);
                });
            }
        })
    };

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));

    const mocktikcets = [
        {
            id: 1,
            title: 'pos pc broken',
            ticket_id: "12345",
            incident_no: "inc_12345",
            status: "open",
            due_by: "2024-07-18 21:00:00",
        },
        {
            id: 1,
            title: 'pos pc broken',
            ticket_id: "123456",
            incident_no: "inc_123456",
            status: "open",
            due_by: "2024-07-18 21:30:00",
        }
    ];

    interface CountdownProps {
        dueDate: string;
    }

    interface TimeLeft {
        hours: number;
        minutes: number;
        seconds: number;
    }

    const Countdown: React.FC<CountdownProps> = ({ dueDate }) => {
        const calculateTimeLeft = (): TimeLeft => {
            const difference = +new Date(dueDate) - +new Date();
            let timeLeft: TimeLeft;

            if (difference > 0) {
                timeLeft = {
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            } else {
                timeLeft = {
                    hours: 0,
                    minutes: 0,
                    seconds: 0
                };
            }
            return timeLeft;
        };

        const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

        useEffect(() => {
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft());
            }, 1000);

            return () => clearInterval(timer);
        }, [dueDate]);

        useEffect(() => {
            const showAlert = () => {
                setModalOpen(true);
            };

            const intervalId = setInterval(() => {
                showAlert();
            }, 100000000);

            return () => clearInterval(intervalId);
        }, []);

        return (
            <p style={{ color: 'red' }}>
                {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </p>
        );
    };

    return (
        <>
            <AlertModal modal_open={modal_open} handleModalClose={handleModalClose} />
            <Grid container spacing={2}>
                <Grid item lg={12} md={12} xs={12}>
                    <Typography variant="h6" color={'text.secondary'}>Dashboard</Typography>
                </Grid>
                <Grid item lg={3} md={6} xs={12}>
                    <Card sx={{
                        width: '100%',
                        height: '100%',
                    }}>
                        <CardContent>
                            <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
                                <Stack spacing={1}>
                                    <Typography color="text.secondary" variant="overline">
                                        Open
                                    </Typography>
                                    <Typography variant="h4">2</Typography>
                                </Stack>
                                <Avatar sx={{ backgroundColor: 'rgb(240, 128, 128)', height: '56px', width: '56px' }}>
                                    <Receipt sx={{ fontSize: 'var(--icon-fontSize-lg)' }} />
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item lg={3} md={6} xs={12}>
                    <Card sx={{
                        width: '100%',
                        height: '100%',
                    }}>
                        <CardContent>
                            <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
                                <Stack spacing={1}>
                                    <Typography color="text.secondary" variant="overline">
                                        Pending
                                    </Typography>
                                    <Typography variant="h4">5</Typography>
                                </Stack>
                                <Avatar sx={{ backgroundColor: 'rgb(255, 153, 153)', height: '56px', width: '56px' }}>
                                    <Receipt sx={{ fontSize: 'var(--icon-fontSize-lg)' }} />
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item lg={3} md={6} xs={12}>
                    <Card sx={{
                        width: '100%',
                        height: '100%',
                    }}>
                        <CardContent>
                            <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
                                <Stack spacing={1}>
                                    <Typography color="text.secondary" variant="overline">
                                        Spare
                                    </Typography>
                                    <Typography variant="h4">3</Typography>
                                </Stack>
                                <Avatar sx={{ backgroundColor: 'rgb(255, 204, 153)', height: '56px', width: '56px' }}>
                                    <Receipt sx={{ fontSize: 'var(--icon-fontSize-lg)' }} />
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item lg={3} md={6} xs={12}>
                    <Card sx={{
                        width: '100%',
                        height: '100%',
                    }}>
                        <CardContent>
                            <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
                                <Stack spacing={1}>
                                    <Typography color="text.secondary" variant="overline">
                                        Closed
                                    </Typography>
                                    <Typography variant="h4">10</Typography>
                                </Stack>
                                <Avatar sx={{ backgroundColor: 'rgb(153, 255, 153)', height: '56px', width: '56px' }}>
                                    <Receipt sx={{ fontSize: 'var(--icon-fontSize-lg)' }} />
                                </Avatar>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography color={'text.secondary'} variant="h6" component="div">
                                Ticket Status Overview by Customer
                            </Typography>
                            <Chart
                                options={{
                                    chart: {
                                        toolbar: {
                                            tools: {
                                                download: false,
                                                selection: true,
                                            },
                                        },
                                        animations: {
                                            enabled: false, // Disable animations
                                        },
                                        id: "basic-bar",
                                        events: {
                                            dataPointSelection: (event, chartContext, config) => {
                                                const { seriesIndex, dataPointIndex } = config;
                                                const selectedSeriesName = config.w.config.series[seriesIndex].name;
                                                const selectedCategory = config.w.config.xaxis.categories[dataPointIndex];

                                                // Alert the category and series name
                                                alert(`Category: ${selectedCategory}\nSeries: ${selectedSeriesName}`);
                                            },
                                        },
                                    },
                                    xaxis: {
                                        categories: customers, // Set customers as categories
                                        title: {
                                            text: "Customers",
                                        },
                                    },
                                    yaxis: {
                                        title: {
                                            text: "Ticket Status Count",
                                        },
                                    },
                                    colors: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
                                    plotOptions: {
                                        bar: {
                                            dataLabels: {
                                                position: 'top',
                                            }
                                        }
                                    },
                                    dataLabels: {
                                        enabled: true,
                                        offsetY: -20,
                                        style: {
                                            fontSize: '12px',
                                            colors: ["#304758"]
                                        }
                                    },
                                }}
                                series={series}
                                type="bar"
                                width="100%"
                                height="400px"
                            />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color={'text.secondary'} component="div">
                                Tickets
                            </Typography>
                            <Box overflow="auto">
                                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>Ticket ID</StyledTableCell>
                                            <StyledTableCell align="right">Incident No</StyledTableCell>
                                            <StyledTableCell align="right">Status</StyledTableCell>
                                            <StyledTableCell align="right">Due By</StyledTableCell>
                                            <StyledTableCell align="right">Time Left</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {mocktikcets.map((row) => (
                                            <StyledTableRow key={row.ticket_id}>
                                                <StyledTableCell component="th" scope="row">
                                                    {row.ticket_id}
                                                </StyledTableCell>
                                                <StyledTableCell align="right">{row.incident_no}</StyledTableCell>
                                                <StyledTableCell align="right">{row.status}</StyledTableCell>
                                                <StyledTableCell align="right">{row.due_by}</StyledTableCell>
                                                <StyledTableCell align="right"><Countdown dueDate={row.due_by} /></StyledTableCell>
                                            </StyledTableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
}
