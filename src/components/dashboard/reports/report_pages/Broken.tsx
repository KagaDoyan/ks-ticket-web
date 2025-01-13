import { authClient } from "@/lib/auth/client";
import { IosShare, Refresh } from "@mui/icons-material";
import { Autocomplete, Box, Button, Card, Divider, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
import Loading from "./loading";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

// Interface for Shop details
interface broken {
    inc_no: string
    ticket_date: string
    ticket_time: string
    store_id: string
    store_name: string
    ticket_title: string
    category: string
    brand: string
    model: string
    serial: string
    warranty: string
    location: string
}

interface Customer {
    id: number;
    fullname: string;
    shortname: string;
}

export default function BrokenPartReportPage() {
    const [loading, setLoading] = React.useState(true);
    const currentDate = new Date();
    const sevenDaysBefore = new Date(currentDate);
    sevenDaysBefore.setDate(currentDate.getDate() - 7);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = React.useState<broken[]>([]);
    const [count, setCount] = React.useState(0);
    const [from, setFrom] = React.useState(dayjs(sevenDaysBefore).format("DD/MM/YYYY"));
    const [to, setTo] = React.useState(dayjs(currentDate).format("DD/MM/YYYY"));
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const [customer_name, setCustomer] = React.useState("");

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
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

    const fetchMAData = async () => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
        fetch(`${baseUrl}/api/report/sparebrokenpart?from=${dayjs(from, "DD/MM/YYYY").format("YYYY-MM-DD")}&to=${dayjs(to, "DD/MM/YYYY").format("YYYY-MM-DD")}&brand_name=${customer_name}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authClient.getToken()}`
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setRows(data.data.report)
                setLoading(false)
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

    useEffect(() => {
        fetchMAData();
        GetCustomer();
    }, [from, to, customer_name]);

    const exportToExcel = () => {


        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "MA");

        // Export the file
        XLSX.writeFile(workbook, `Broken-Part-Report.xlsx`);
    }
    return (
        <Box sx={{ mt: 2 }}>
            <Card sx={{ p: 2 }}>
                {/* Stack for alignment and spacing of inputs */}
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <DatePicker
                        label="Start Date"
                        value={dayjs(from, "DD/MM/YYYY")}
                        format="DD/MM/YYYY"
                        onChange={(newValue) => {
                            if (newValue) { setFrom(newValue.format('DD/MM/YYYY')) }
                        }}
                        slotProps={{ textField: { size: 'small' } }}
                    />
                    <DatePicker
                        label="End Date"
                        value={dayjs(to, "DD/MM/YYYY")}
                        format="DD/MM/YYYY"
                        onChange={(newValue) => {
                            if (newValue) { setTo(newValue.format('DD/MM/YYYY')) }
                        }}
                        slotProps={{ textField: { size: 'small' } }}
                    />
                    <Autocomplete
                        options={customers}
                        size="small"
                        sx={{ width: 150 }}
                        getOptionLabel={(option) => option.shortname}
                        value={customers.find((customer) => customer.fullname === customer_name) || null}
                        onChange={(event, newValue) => {
                            const selected = newValue ? newValue.fullname : "";
                            setCustomer(selected)
                        }}
                        renderInput={(params) => <TextField {...params} label="brand" />}
                    />
                    <Button variant="contained" startIcon={<Refresh />} onClick={fetchMAData}>Refresh</Button>
                    <Button variant="contained" startIcon={<IosShare />} color="warning" onClick={exportToExcel}>Export</Button>
                </Stack>

                <Box sx={{ overflowX: 'auto' }}>
                    {loading ? <Loading /> :
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>inc_no</TableCell>
                                    <TableCell>ticket_date</TableCell>
                                    <TableCell>ticket_time</TableCell>
                                    <TableCell>store_id</TableCell>
                                    <TableCell>store_name</TableCell>
                                    <TableCell>ticket_title</TableCell>
                                    <TableCell>item</TableCell>
                                    <TableCell>serial</TableCell>
                                    <TableCell>warranty</TableCell>
                                    <TableCell>location</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length > 0 ? rows.map((row) => (
                                    // Example Row: Uncomment and replace with your actual data structure
                                    <TableRow>
                                        <TableCell>{row.inc_no}</TableCell>
                                        <TableCell>{row.ticket_date}</TableCell>
                                        <TableCell>{row.ticket_time}</TableCell>
                                        <TableCell>{row.store_id}</TableCell>
                                        <TableCell>{row.store_name}</TableCell>
                                        <TableCell>{row.ticket_title}</TableCell>
                                        <TableCell>{row.category} {row.brand} {row.model}</TableCell>
                                        <TableCell>{row.serial}</TableCell>
                                        <TableCell>{row.warranty}</TableCell>
                                        <TableCell>{row.location}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">No data</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    }
                </Box>
                <Divider />
                <TablePagination
                    component="div"
                    count={rows.length}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </Card>
        </Box>
    );
}
