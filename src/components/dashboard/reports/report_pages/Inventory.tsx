import { authClient } from "@/lib/auth/client";
import { IosShare, Refresh } from "@mui/icons-material";
import { Autocomplete, Box, Button, Card, Divider, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

// Interface for Shop details
interface inventory {
    category: string
    brand: string
    model: string
    serial: string
    owner: string
    condition: string
    location: string
    status: string
    used_by: string
    inc_no: string
    ticket_no: string
    remark: string
}

interface Customer {
    id: number;
    fullname: string;
    shortname: string;
}

export default function InventoryReportPage() {
    const currentDate = new Date();
    const sevenDaysBefore = new Date(currentDate);
    sevenDaysBefore.setDate(currentDate.getDate() - 7);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = React.useState<inventory[]>([]);
    const [count, setCount] = React.useState(0);
    const [from, setFrom] = React.useState(formatDate(sevenDaysBefore));
    const [to, setTo] = React.useState(formatDate(currentDate));
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

    const fetchMAData = async () => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
        fetch(`${baseUrl}/api/report/inventory?brand_name=${customer_name}`, {
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


    const exportToExcel = () => {
        console.log(rows);

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "MA");

        // Export the file
        XLSX.writeFile(workbook, `Inventory-Report.xlsx`);
    }

    useEffect(() => {
        fetchMAData();
        GetCustomer();
    }, [customer_name]);

    return (
        <Box sx={{ mt: 2 }}>
            <Card sx={{ p: 2 }}>
                {/* Stack for alignment and spacing of inputs */}
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
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
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>item</TableCell>
                                <TableCell>serial</TableCell>
                                <TableCell>owner</TableCell>
                                <TableCell>condition</TableCell>
                                <TableCell>location</TableCell>
                                <TableCell>status</TableCell>
                                <TableCell>use_by</TableCell>
                                <TableCell>inc_no</TableCell>
                                <TableCell>ticket_no</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length > 0 ? rows.map((row) => (
                                // Example Row: Uncomment and replace with your actual data structure
                                <TableRow>
                                    <TableCell>{row.category} {row.brand} {row.model}</TableCell>
                                    <TableCell>{row.serial}</TableCell>
                                    <TableCell>{row.owner}</TableCell>
                                    <TableCell>{row.condition}</TableCell>
                                    <TableCell>{row.location}</TableCell>
                                    <TableCell>{row.status}</TableCell>
                                    <TableCell>{row.used_by}</TableCell>
                                    <TableCell>{row.inc_no}</TableCell>
                                    <TableCell>{row.ticket_no}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No data</TableCell>
                                </TableRow>
                            )}
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
            </Card>
        </Box>
    );
}
