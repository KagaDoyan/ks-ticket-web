'use client'

import { Avatar, Box, Card, CardContent, Grid, Stack, Table, TableBody, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import { Receipt } from "@mui/icons-material";
import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import { toast } from "react-toastify";
import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import AlertModal from "./modal/alert_modal";
export default function DashboardPage(): React.JSX.Element {
    const [modal_open, setModalOpen] = useState(false)
    const handleModalClose = () => setModalOpen(false)

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
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));
    const options: ApexOptions = {
        chart: {
            toolbar: {
                tools: {
                    download: false,
                    selection: true,
                },
            },
            id: "basic-bar",
            events: {
                dataPointSelection: (event, chartContext, config) => {
                    const { dataPointIndex, seriesIndex } = config;
                    const category = options.xaxis?.categories[dataPointIndex];
                    const seriesName = series[seriesIndex].name;
                    const value = series[seriesIndex].data[dataPointIndex];
                    // alert(`Category: ${category}\nSeries: ${seriesName}\nValue: ${value}`);
                    toast.info(`Category: ${category}\nSeries: ${seriesName}\nValue: ${value}`);
                }
            }
        },
        xaxis: {
            categories: ['KFC', 'Pizza', 'OKJ']
        },
        colors: ['rgb(240, 128, 128)', 'rgb(255, 153, 153)', 'rgb(255, 204, 153)', 'rgb(153, 255, 153)'], // Custom colors for Open, Pending, Spare, Close
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
            },
        },
        dataLabels: {
            enabled: true,
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent'],
        },
        fill: {
            opacity: 1,
        }
    }

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
    ]

    const series = [
        {
            name: 'Open',
            data: [10, 5, 2],
        },
        {
            name: 'Pending',
            data: [6, 7, 3],
        },
        {
            name: 'Spare',
            data: [8, 6, 2],
        },
        {
            name: 'Closed',
            data: [3, 7, 2],
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
            // Function to show the alert
            const showAlert = () => {
              setModalOpen(true);
            };
        
            // Set up the interval
            const intervalId = setInterval(() => {
              showAlert();
            }, 100000000);

            // Clean up the interval on component unmount
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
                                options={options}
                                series={series}
                                type="bar"
                                width="100%"
                                height={350}
                            />
                        </CardContent>
                    </Card>

                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ticket number</TableCell>
                                    <TableCell>incident no</TableCell>
                                    <TableCell>title</TableCell>
                                    <TableCell>status</TableCell>
                                    <TableCell>due_by</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {mocktikcets.map((row) => (
                                    <StyledTableRow
                                        key={row.ticket_id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <StyledTableCell>{row.ticket_id}</StyledTableCell>
                                        <StyledTableCell>{row.incident_no}</StyledTableCell>
                                        <StyledTableCell>{row.title}</StyledTableCell>
                                        <StyledTableCell><Box sx={{ bgcolor: "rgb(240, 128, 128)", display: 'inline-block', height: '10', width: '10', borderRadius: '5px', marginRight: '5px', padding: '5px', color: 'white' }}>{row.status}</Box></StyledTableCell>
                                        <StyledTableCell sx={{ width: '200px' }}><Countdown dueDate={row.due_by} /></StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
}