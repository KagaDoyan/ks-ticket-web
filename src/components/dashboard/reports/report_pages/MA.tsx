import { authClient } from "@/lib/auth/client";
import { IosShare, Refresh } from "@mui/icons-material";
import { Autocomplete, Box, Button, Card, Divider, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField } from "@mui/material";
import useOnMount from "@mui/utils/useOnMount";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

// Main interface for Ticket data
interface MA {
    brand: string;
    ticketTitle: string;
    ticketDescription: string;
    incNo: string; // Incident Number
    ticketNumber: string;
    assignedTo: string;
    ticketDate: string; // Consider using Date type if you're handling date objects
    ticketTime: string; // Consider using Date type if you're handling time objects
    storeName: string;
    storeContactPhone: string;
    ticketStatus: string;
    ticketStatusDetail?: string; // Optional field, only for pending status
    ticketCloseTime?: string; // Optional if the ticket is not yet closed
    ticketCloseDate?: string; // Optional if the ticket is not yet closed
    engineerName: string;
    engineerNote?: string; // Optional if no notes are provided
    appointmentTime?: string; // Optional if no appointment is scheduled
    appointmentDate?: string; // Optional if no appointment is scheduled
    solution?: string | null; // Optional if no solution is provided yet
    slaPriority: string; // SLA Priority
    recoveryTime: string; // Deadline for SLA (could also be Date if preferred)
    slaOverdue: string; // Whether it was closed within SLA (Yes/No as boolean)
    action: string;
    lastUpdated?: string; // Date when the ticket was last updated
    storeDeviceBrand1?: string;
    storeDeviceModel1?: string;
    storeDeviceSerial1?: string;
    storeDeviceBrand2?: string;
    storeDeviceModel2?: string;
    storeDeviceSerial2?: string;
    storeDeviceBrand3?: string;
    storeDeviceModel3?: string;
    storeDeviceSerial3?: string;
    storeDeviceBrand4?: string;
    storeDeviceModel4?: string;
    storeDeviceSerial4?: string;
    storeDeviceBrand5?: string;
    storeDeviceModel5?: string;
    storeDeviceSerial5?: string;
    spareDeviceBrand1?: string;
    spareDeviceModel1?: string;
    spareDeviceSerial1?: string;
    spareDeviceBrand2?: string;
    spareDeviceModel2?: string;
    spareDeviceSerial2?: string;
    spareDeviceBrand3?: string;
    spareDeviceModel3?: string;
    spareDeviceSerial3?: string;
    spareDeviceBrand4?: string;
    spareDeviceModel4?: string;
    spareDeviceSerial4?: string;
    spareDeviceBrand5?: string;
    spareDeviceModel5?: string;
    spareDeviceSerial5?: string;
    return_investigation?: string;
    return_solution?: string;
    return_time_in?: string;
    return_time_out?: string;
}

interface Customer {
    id: number;
    fullname: string;
    shortname: string;
}


export default function MAReportPage() {
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const currentDate = new Date();
    const sevenDaysBefore = new Date(currentDate);
    sevenDaysBefore.setDate(currentDate.getDate() - 7);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = React.useState<MA[]>([]);
    const [count, setCount] = React.useState(0);
    const [from, setFrom] = React.useState(formatDate(sevenDaysBefore));
    const [to, setTo] = React.useState(formatDate(currentDate));
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
        fetch(`${baseUrl}/api/report/ma?from=${from}&to=${to}&brand_name=${customer_name}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authClient.getToken()}`
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setRows(data.data.report)
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

    const exportToExcel = () => {
        console.log(rows);

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "MA");

        // Export the file
        XLSX.writeFile(workbook, `MA-${from}/${to}.xlsx`);
    }
    useEffect(() => {
        fetchMAData();
    }, [from, to, customer_name]);

    useOnMount(() => {
        GetCustomer();
    });

    return (
        <Box sx={{ mt: 2 }}>
            <Card sx={{ p: 2 }}>
                {/* Stack for alignment and spacing of inputs */}
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <TextField
                        label="Start Date"
                        type="date"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined"
                        size="small"
                        onChange={(e) => setFrom(e.target.value)}
                        value={from}
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined"
                        size="small"
                        onChange={(e) => setTo(e.target.value)}
                        value={to}
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
                    <Button variant="contained" startIcon={<IosShare />} color="warning" onClick={() => exportToExcel()}>Export</Button>
                </Stack>

                <Box sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 800, }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Incident Number</TableCell>
                                <TableCell>Ticket Number</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Assigned To</TableCell>
                                <TableCell>Engineer</TableCell>
                                <TableCell>Shop</TableCell>
                                <TableCell>Due By</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length > 0 ?
                                rows.map((ticket) => (
                                    <TableRow>
                                        <TableCell>{ticket.incNo}</TableCell>
                                        <TableCell>{ticket.ticketNumber}</TableCell>
                                        <TableCell>{ticket.ticketTitle}</TableCell>
                                        <TableCell>{ticket.ticketStatus}</TableCell>
                                        <TableCell>{ticket.assignedTo}</TableCell>
                                        <TableCell>{ticket.engineerName}</TableCell>
                                        <TableCell>{ticket.storeName}</TableCell>
                                        <TableCell>{ticket.recoveryTime}</TableCell>
                                        <TableCell>{ticket.action}</TableCell>
                                    </TableRow>

                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">No data</TableCell>
                                    </TableRow>
                                )},
                        </TableBody>
                    </Table>
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
            </Card >
        </Box >
    );
}
