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
    const [rows, setRows] = React.useState<any>([]);
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
        fetch(`${baseUrl}/api/inventory/report?from=${from}&to=${to}&search=${customer_name}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authClient.getToken()}`
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setRows(data.data)
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

    const exportToExcel = () => {
        

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "MA");

        // Export the file
        XLSX.writeFile(workbook, `Sell-${from}/${to}.xlsx`);
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
                    <TextField
                        label="Search"
                        variant="outlined"
                        size="small"
                        onChange={(e) => setCustomer(e.target.value)}
                        value={customer_name}
                    />
                    <Button variant="contained" startIcon={<Refresh />} onClick={fetchMAData}>Refresh</Button>
                    <Button variant="contained" startIcon={<IosShare />} color="warning" onClick={() => exportToExcel()}>Export</Button>
                </Stack>

                <Box sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 800, }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Serial</TableCell>
                                <TableCell>Brand</TableCell>
                                <TableCell>Model</TableCell>
                                <TableCell>warranty</TableCell>
                                <TableCell>sell date</TableCell>
                                <TableCell>buyer name</TableCell>
                                <TableCell>sell price</TableCell>
                                <TableCell>base price</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows?.length > 0 ?
                                rows.map((ticket: any) => (
                                    <TableRow>
                                        <TableCell>{ticket.serial}</TableCell>
                                        <TableCell>{ticket.brand}</TableCell>
                                        <TableCell>{ticket.model}</TableCell>
                                        <TableCell>{ticket.warranty}</TableCell>
                                        <TableCell>{ticket.sell_date}</TableCell>
                                        <TableCell>{ticket.buyer_name}</TableCell>
                                        <TableCell>{ticket.sell_price}</TableCell>
                                        <TableCell>{ticket.base_price}</TableCell>
                                    </TableRow>

                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">No data</TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                    </Table>
                </Box>
                <Divider />
                <TablePagination
                    component="div"
                    count={rows?.length}
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
