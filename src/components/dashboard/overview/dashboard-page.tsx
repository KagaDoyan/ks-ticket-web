'use client'

import { Autocomplete, Avatar, Badge, Box, Card, CardContent, Grid, Stack, Table, TableBody, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { Receipt } from "@mui/icons-material";
import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import AlertModal from "./modal/alert_modal";
import { authClient } from "@/lib/auth/client";
import dayjs from "dayjs";
import TableModal from "./modal/data_modal";
import React from "react";
import { DatePicker } from "@mui/x-date-pickers";

interface TicketData {
    id: number;
    ticket_status: string;
    customer: { shortname: string };
    due_by: string;
    inc_number: string;
    ticket_number: string;
    title: string;
    shop: {
        shop_number: string;
        shop_name: string;
    }
}
interface Customer {
    id: number;
    fullname: string;
    shortname: string;
}

export default function DashboardPage(): React.JSX.Element {
    const [userData, setUserData] = React.useState<{ role?: string, customer?: { shortname: string, fullname: string } } | null>(null);
    React.useEffect(() => {
        const storedUserData = JSON.parse(localStorage.getItem('user_info') || '{}');
        setUserData(storedUserData);

        const handleStorageChange = () => {
            const updatedUserData = JSON.parse(localStorage.getItem('user_info') || '{}');
            setUserData(updatedUserData);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);


    const [customersOption, setCustomersOption] = useState<Customer[]>([]);
    const [customer_name, setCustomerName] = useState<string[]>([]);
    const [ticketData, setTickets] = useState<TicketData[]>([]);
    const [series, setSeries] = useState<any[]>([]);
    const [select_customer, setSelectCustomer] = useState("");
    const [select_status, setSelectStatus] = useState("");
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
    const [start_date, setStart] = useState(dayjs(Date.now() - 7 * 24 * 60 * 60 * 1000).format('DD/MM/YYYY'))
    const [end_date, setEnd] = useState(dayjs(Date.now()).format('DD/MM/YYYY'))

    const handleModalClose = () => setModalOpen(false);

    useEffect(() => {
        fetchCustomer();
        GetCustomerOption();
        fetchTicketByDate();
    }, [start_date, end_date, customer_name]);

    useEffect(() => {
        if (userData?.customer?.shortname) {
            setCustomerName([userData?.customer?.shortname]);
            setCustomers(customers.filter((customer) => customer_name.includes(userData?.customer?.shortname || '')));
        }
    }, [userData]);

    useEffect(() => {
        setCustomers(customers.filter((customer) => customer_name.includes(customer)));
    }, [customer_name]);

    useEffect(() => {
        if (chart_table_data.length > 0) {
            handleTableModalOpen();
        }
    }, [chart_table_data]);

    const GetCustomerOption = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        setCustomersOption(data.data);
                    })
                }
            })
    }

    useEffect(() => {
        const initialSeries: { name: string, data: number[] }[] = ["open", "pending", "oncall", "spare", "close", "cancel"].map(status => (
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
            const seriesIndexOnCall = initialSeries.findIndex(series => series.name.toLowerCase() === 'oncall');
            const seriesIndexCancel = initialSeries.findIndex(series => series.name.toLowerCase() === 'cancel');
            initialSeries[seriesIndexOpen].data.push(ticketData.filter((ticket) => ticket.ticket_status === 'open' && ticket.customer.shortname === customer).length);
            initialSeries[seriesIndexPending].data.push(ticketData.filter((ticket) => ticket.ticket_status === 'pending' && ticket.customer.shortname === customer).length);
            initialSeries[seriesIndexSpare].data.push(ticketData.filter((ticket) => ticket.ticket_status === 'spare' && ticket.customer.shortname === customer).length);
            initialSeries[seriesIndexClosed].data.push(ticketData.filter((ticket) => ticket.ticket_status === 'close' && ticket.customer.shortname === customer).length);
            initialSeries[seriesIndexOnCall].data.push(ticketData.filter((ticket) => ticket.ticket_status === 'oncall' && ticket.customer.shortname === customer).length);
            initialSeries[seriesIndexCancel].data.push(ticketData.filter((ticket) => ticket.ticket_status === 'cancel' && ticket.customer.shortname === customer).length);
        });
        setSeries(initialSeries);
    }, [ticketData, customers]);

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
                    if (customer_name.length > 0) {
                        setCustomers(customersList.filter((customer: any) => customer_name.includes(customer)));
                    } else {
                        setCustomers(customersList);
                    }
                });
            }
        }).catch(err => {
            console.error("Failed to fetch customers:", err);
        });
    };

    const fetchTicketByDate = () => {
        console.log(userData);
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/ticket/dashboard?start=${dayjs(start_date, "DD/MM/YYYY").format("YYYY-MM-DD")}&end=${dayjs(end_date, "DD/MM/YYYY").format("YYYY-MM-DD")}&brand_name=${customer_name}`
        if (userData?.role === "Customer") {
            console.log("Customer");

            url = `${process.env.NEXT_PUBLIC_API_URL}/api/ticket/dashboard?start=${dayjs(start_date, "DD/MM/YYYY").format("YYYY-MM-DD")}&end=${dayjs(end_date, "DD/MM/YYYY").format("YYYY-MM-DD")}&brand_name=${userData.customer?.shortname}`
        }
        fetch(url, {
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

    const handlechangeCustomer = (event: React.SyntheticEvent, value: Customer[]) => {
        setCustomerName(value.map((customer) => customer.shortname));
    };

    return (
        <>
            <TableModal open={table_modal_open} handleClose={handleTableModalClose} data={ticketData} customer={select_customer} status={select_status} />
            <AlertModal modal_open={modal_open} handleModalClose={handleModalClose} />
            <Grid container spacing={2}>
                <Grid item lg={12} md={6} xs={6}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" color={'text.secondary'}>
                            Dashboard
                        </Typography>
                    </Stack>
                </Grid>
                <Grid item lg={12} md={12} xs={12}>
                    <Box>
                        <Card sx={{ p: 2 }}>
                            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                <DatePicker
                                    label="Start Date"
                                    value={dayjs(start_date, "DD/MM/YYYY")}
                                    format="DD/MM/YYYY"
                                    onChange={(newValue) => {
                                        if (newValue) { setStart(newValue.format('DD/MM/YYYY')) }
                                    }}
                                    slotProps={{ textField: { size: 'small' } }}
                                />
                                <DatePicker
                                    label="End Date"
                                    value={dayjs(end_date, "DD/MM/YYYY")}
                                    format="DD/MM/YYYY"
                                    onChange={(newValue) => {
                                        if (newValue) { setEnd(newValue.format('DD/MM/YYYY')) }
                                    }}
                                    slotProps={{ textField: { size: 'small' } }}
                                />
                                {/* <Autocomplete
                                    options={customersOption}
                                    size="small"
                                    sx={{ width: 150 }}
                                    getOptionLabel={(option) => option.shortname}
                                    value={customersOption.find((customer) => customer.id === customer_name) || null}
                                    onChange={(event, newValue) => {
                                        const selected = newValue ? newValue.id : 0;
                                        setCustomerName(selected)
                                    }}
                                    renderInput={(params) => <TextField {...params} label="brand" />}
                                /> */}
                                <Autocomplete
                                    multiple
                                    sx={{ width: 300 }}
                                    size="small"
                                    id="province-select"
                                    options={customersOption}
                                    getOptionLabel={(option) => option.shortname}
                                    value={customersOption.filter(customer => userData?.role === "Customer" ? customer.shortname === userData.customer?.shortname : customer_name.includes(customer.shortname))}
                                    onChange={handlechangeCustomer}
                                    renderInput={(params) => (
                                        <TextField {...params} label="brand" variant="outlined" />
                                    )}
                                    isOptionEqualToValue={(option, value) => option.shortname === value.shortname}
                                    disabled={userData?.role === "Customer"}
                                />
                            </Stack>
                        </Card>
                    </Box>
                </Grid>

                <Grid item lg={3} md={6} xs={3}>
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
                                                setSelectCustomer(selectedCategory);
                                                setSelectStatus(selectedSeriesName.toLowerCase());
                                                // Set chart table data first, then the modal will open via the useEffect
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
                                    colors: ["rgb(255, 47, 47)", "rgb(251, 132, 58)", "rgb(60, 190, 255)", "rgb(255, 204, 153)", "rgb(153, 255, 153)", "rgb(158, 158, 158)", "#4BC0C0", "#9966FF", "#808080"],
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
                                            <StyledTableCell align="right">Title</StyledTableCell>
                                            <StyledTableCell align="right">Shop</StyledTableCell>
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
                                                <StyledTableCell align="right">{row.title}</StyledTableCell>
                                                <StyledTableCell align="right">{row.shop.shop_number} - {row.shop.shop_name}</StyledTableCell>
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
