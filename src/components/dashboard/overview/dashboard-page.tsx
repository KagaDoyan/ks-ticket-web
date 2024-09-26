'use client'

import { Avatar, Badge, Box, Card, CardContent, Grid, Stack, Table, TableBody, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import { Receipt } from "@mui/icons-material";
import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import AlertModal from "./modal/alert_modal";
import { authClient } from "@/lib/auth/client";
import dayjs from "dayjs";
import TextField from '@mui/material/TextField';
import TableModal from "./modal/data_modal";

interface TicketData {
    id: number;
    ticket_status: string;
    customer: { shortname: string };
    due_by: string;
    inc_number: string;
    ticket_number: string;
}

export default function DashboardPage(): React.JSX.Element {
    const [ticketData, setTickets] = useState<TicketData[]>([]);
    const [series, setSeries] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState<[string, string]>([
        dayjs(Date.now() - 7 * 24 * 60 * 60 * 1000).format('YYYY-MM-DD'),
        dayjs(Date.now()).format('YYYY-MM-DD')
    ]);
    const [chart_table_data, setChartTableData] = useState<any[]>([]);
    const [table_modal_open, setTableModalOpen] = useState(false);
    const handleTableModalClose = () => setTableModalOpen(false);
    const handleTableModalOpen = () => setTableModalOpen(true);

    const [customers, setCustomers] = useState<string[]>([]);
    const [modal_open, setModalOpen] = useState(false);

    const handleModalClose = () => setModalOpen(false);

    useEffect(() => {
        fetchCustomer();
        fetchTicketByDate();
    }, [dateRange]);

    useEffect(() => {
        if (chart_table_data.length > 0) {
            handleTableModalOpen();
        }
    }, [chart_table_data]);

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
        const [start, end] = dateRange;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/dashboard?start=${start}&end=${end}`, {
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
        }).catch(err => {
            console.error("Failed to fetch tickets:", err);
        });
    };

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
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

    const Countdown: React.FC<{ dueDate: string }> = ({ dueDate }) => {
        const calculateTimeLeft = () => {
            const difference = +new Date(dueDate) - +new Date();
            return difference > 0
                ? {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                }
                : { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

        useEffect(() => {
            const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
            return () => clearInterval(timer);
        }, [dueDate]);

        useEffect(() => {
            const showAlert = () => setModalOpen(true);
            const intervalId = setInterval(showAlert, 100000000);
            return () => clearInterval(intervalId);
        }, []);

        const isOverdue = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

        return (
            <p style={{ color: 'red' }}>
                {isOverdue
                    ? 'Overdue'
                    : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
            </p>
        );
    };

    return (
        <>
            <TableModal open={table_modal_open} handleClose={handleTableModalClose} data={chart_table_data} />
            <AlertModal modal_open={modal_open} handleModalClose={handleModalClose} />
            <Grid container spacing={2}>
                <Grid item lg={12} md={12} xs={12}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" color={'text.secondary'}>
                            Dashboard
                        </Typography>

                    </Stack>
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
                                    <Typography variant="h4">{ticketData.filter((ticket) => ticket.ticket_status === 'open').length}</Typography>
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
                                    <Typography variant="h4">{ticketData.filter((ticket) => ticket.ticket_status === 'pending').length}</Typography>
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
                                    <Typography variant="h4">{ticketData.filter((ticket) => ticket.ticket_status === 'spare').length}</Typography>
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
                                    <Typography variant="h4">{ticketData.filter((ticket) => ticket.ticket_status === 'close').length}</Typography>
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

                                                const filteredData = ticketData.filter(
                                                    (ticket) =>
                                                        ticket.customer.shortname === selectedCategory &&
                                                        ticket.ticket_status.toLowerCase() === selectedSeriesName.toLowerCase()
                                                );

                                                // Set chart table data first, then the modal will open via the useEffect
                                                setChartTableData(filteredData);
                                                handleTableModalOpen();
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
                                Open Tickets
                            </Typography>
                            <Box overflow="auto">
                                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                                    <TableHead style={{ borderRadius: "8px 8px 0 0" }}>
                                        <TableRow>
                                            <StyledTableCell>Ticket ID</StyledTableCell>
                                            <StyledTableCell align="right">Incident No</StyledTableCell>
                                            <StyledTableCell align="right">Status</StyledTableCell>
                                            <StyledTableCell align="right">Due By</StyledTableCell>
                                            <StyledTableCell align="right">Time Left</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {ticketData.filter((ticket) => ticket.ticket_status == 'open').map((row) => (
                                            <StyledTableRow key={row.id}>
                                                <StyledTableCell component="th" scope="row">
                                                    {row.ticket_number}
                                                </StyledTableCell>
                                                <StyledTableCell align="right">{row.inc_number}</StyledTableCell>
                                                <StyledTableCell align="right"><Badge color={row.ticket_status === 'Closed' ? 'success' : 'error'} badgeContent={row.ticket_status} /></StyledTableCell>
                                                <StyledTableCell align="right">{row.due_by}</StyledTableCell>
                                                <StyledTableCell sx={{ maxWidth: "100px" }} align="right"><Countdown dueDate={row.due_by} /></StyledTableCell>
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
