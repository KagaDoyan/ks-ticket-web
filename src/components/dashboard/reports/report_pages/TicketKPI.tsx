import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    Container,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Paper,
    Chip,
    Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { authClient } from '@/lib/auth/client';
import { toast } from 'react-toastify';
import { IosShare, Refresh } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import Loading from './loading';

interface TicketKPI {
    ticket_date: string;
    ticket_time: string;
    ticket_number: string;
    inc_number: string;
    ticket_title: string;
    category: string;
    shop_name: string;
    send_appointment: string;
    send_mail: string;
    time_in: string;
    time_out: string;
    kpi_sla: string;
    kpi_sla_status: string;
    kpi_mail_appointment: any;
    kpi_mail_appointment_status: string;
    kpi_appointment: any;
    kpi_appointment_status: string;
    kpi_arrival: any;
    kpi_arrival_status: string;
    kpi_solving_under_90min: any;
    kpi_solving_under_90min_status: string;
    kpi_document_and_close_under_10min: any;
    kpi_document_and_close_under_10min_status: string;
}

interface Customer {
    id: number;
    fullname: string;
    shortname: string;
}

export default function TicketKPIReportPage() {
    const currentDate = new Date();
    const sevenDaysBefore = new Date(currentDate);
    sevenDaysBefore.setDate(currentDate.getDate() - 7);

    const [startDate, setStartDate] = useState<string>(dayjs(sevenDaysBefore).format("DD/MM/YYYY"));
    const [endDate, setEndDate] = useState<string>(dayjs(currentDate).format("DD/MM/YYYY"));
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [data, setData] = useState<TicketKPI[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [brandName, setBrandName] = useState<string>("");

    const fetchData = async () => {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
        let url = `${baseUrl}/api/report/ticketkpi?from=${dayjs(startDate, "DD/MM/YYYY").format("YYYY-MM-DD")}&to=${dayjs(endDate, "DD/MM/YYYY").format("YYYY-MM-DD")}&brand_name=${brandName}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`
                },
            });
            const data = await response.json();
            if (data.status === 'success') {
                setData(data.data.report);
            }
        } catch (error) {
            toast.error('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

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
                    })
                }
            })
    }

    const handleExport = () => {
        const exportData = data.map(item => ({
            'ticket_date': item.ticket_date,
            'ticket_time': item.ticket_time,
            'ticket_number': item.ticket_number,
            'inc_number': item.inc_number,
            'ticket_title': item.ticket_title,
            'category': item.category,
            'shop_name': item.shop_name,
            'send_appointment': item.send_appointment,
            'send_mail': item.send_mail,
            'time_in': item.time_in,
            'time_out': item.time_out,
            'kpi_sla': item.kpi_sla,
            'kpi_sla_status': item.kpi_sla_status,
            'kpi_mail_appointment': item.kpi_mail_appointment,
            'kpi_mail_appointment_status': item.kpi_mail_appointment_status,
            'kpi_appointment': item.kpi_appointment,
            'kpi_appointment_status': item.kpi_appointment_status,
            'kpi_arrival': item.kpi_arrival,
            'kpi_arrival_status': item.kpi_arrival_status,
            'kpi_solving_under_90min': item.kpi_solving_under_90min,
            'kpi_solving_under_90min_status': item.kpi_solving_under_90min_status,
            'kpi_document_and_close_under_10min': item.kpi_document_and_close_under_10min,
            'kpi_document_and_close_under_10min_status': item.kpi_document_and_close_under_10min_status,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ticket KPI Report');
        XLSX.writeFile(wb, `Ticket_KPI_Report_${startDate}_to_${endDate}.xlsx`);
    };

    useEffect(() => {
        fetchData();
        GetCustomer();
    }, [startDate, endDate, brandName]);

    const getStatusColor = (status: string) => {
        return status === 'PASS' ? 'success' : 'error';
    };

    return (
        <Card>
            <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1}>
                        <DatePicker
                            label="Start Date"
                            value={dayjs(startDate, "DD/MM/YYYY")}
                            format="DD/MM/YYYY"
                            onChange={(newValue) => {
                                if (newValue) { setStartDate(newValue.format('DD/MM/YYYY')) }
                            }}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                        <DatePicker
                            label="End Date"
                            value={dayjs(endDate, "DD/MM/YYYY")}
                            format="DD/MM/YYYY"
                            onChange={(newValue) => {
                                if (newValue) { setEndDate(newValue.format('DD/MM/YYYY')) }
                            }}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                        <Autocomplete
                            options={customers}
                            size="small"
                            sx={{ width: 150 }}
                            getOptionLabel={(option) => option.shortname}
                            value={customers.find((customer) => customer.fullname === brandName) || null}
                            onChange={(event, newValue) => {
                                const selected = newValue ? newValue.fullname : "";
                                setBrandName(selected)
                            }}
                            renderInput={(params) => <TextField {...params} label="brand" />}
                        />
                        <Button
                            startIcon={<Refresh />}
                            variant="contained"
                            onClick={fetchData}
                        >
                            Refresh
                        </Button>
                        <Button
                            startIcon={<IosShare />}
                            variant="contained"
                            onClick={handleExport}
                            disabled={data.length === 0}
                        >
                            Export
                        </Button>
                    </Stack>
                </Stack>

                {loading ? (
                    <Loading />
                ) : (
                    <Box sx={{ minWidth: 800 }}>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 1400 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date/Time</TableCell>
                                        <TableCell>Ticket/INC</TableCell>
                                        <TableCell>Title</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Shop</TableCell>
                                        <TableCell>Time In/Out</TableCell>
                                        <TableCell>SLA</TableCell>
                                        <TableCell align="center">Mail & Appointment</TableCell>
                                        <TableCell align="center">Appointment</TableCell>
                                        <TableCell align="center">Arrival</TableCell>
                                        <TableCell align="center">Solving</TableCell>
                                        <TableCell align="center">Document & Close</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {row.ticket_date}<br />
                                                {row.ticket_time}
                                            </TableCell>
                                            <TableCell>
                                                {row.ticket_number}<br />
                                                {row.inc_number}
                                            </TableCell>
                                            <TableCell>{row.ticket_title}</TableCell>
                                            <TableCell>{row.category}</TableCell>
                                            <TableCell>{row.shop_name}</TableCell>
                                            <TableCell>
                                                {row.time_in}<br />
                                                {row.time_out}
                                            </TableCell>
                                            <TableCell align='center'>
                                                {row.kpi_sla} <br />
                                                <Chip
                                                    label={row.kpi_sla_status}
                                                    color={getStatusColor(row.kpi_sla_status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {row.kpi_mail_appointment}<br />
                                                <Chip
                                                    label={row.kpi_mail_appointment_status}
                                                    color={getStatusColor(row.kpi_mail_appointment_status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {row.kpi_appointment}<br />
                                                <Chip
                                                    label={row.kpi_appointment_status}
                                                    color={getStatusColor(row.kpi_appointment_status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {/* if arrival is minus set as early */}
                                                {row.kpi_arrival}<br />

                                                <Chip
                                                    label={row.kpi_arrival_status}
                                                    color={getStatusColor(row.kpi_arrival_status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {row.kpi_solving_under_90min}<br />
                                                <Chip
                                                    label={row.kpi_solving_under_90min_status}
                                                    color={getStatusColor(row.kpi_solving_under_90min_status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {row.kpi_document_and_close_under_10min}<br />
                                                <Chip
                                                    label={row.kpi_document_and_close_under_10min_status}
                                                    color={getStatusColor(row.kpi_document_and_close_under_10min_status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Box>
        </Card>
    );
}
