import { authClient } from "@/lib/auth/client";
import { IosShare, Refresh } from "@mui/icons-material";
import { Box, Button, Card, Divider, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

// Interface for Shop details
interface Shop {
    id: number;
    deleted_at: string | null;
    created_at: string;
    created_by: number;
    shop_number: string;
    shop_name: string;
    phone: string;
    email: string;
    latitude: string;
    longitude: string;
    province_id: number;
    customers_id: number;
}

// Interface for Engineer details
interface Engineer {
    id: number;
    name: string;
    lastname: string;
    phone: string;
    line_name: string;
    latitude: string;
    longitude: string;
    node: string;
    password: string;
    deleted_at: string | null;
    created_at: string;
    created_by: number;
}

// Main interface for Ticket data
interface Ticket {
    id: number;
    inc_number: string;
    ticket_number: string;
    customer_id: number;
    shop_id: number;
    open_date: string;
    open_time: string;
    close_date: string | null;
    close_time: string | null;
    title: string;
    description: string;
    due_by: string;
    sla_priority_level: string;
    contact_name: string;
    contact_tel: string;
    assigned_to: string;
    created_by: number;
    updated_by: number;
    ticket_status: string;
    appointment_date: string;
    appointment_time: string;
    engineer_id: number;
    solution: string | null;
    investigation: string | null;
    close_description: string | null;
    item_brand: string | null;
    item_category: string | null;
    item_model: string | null;
    item_sn: string | null;
    warranty_exp: string | null;
    resolve_status: string | null;
    resolve_remark: string | null;
    action: string | null;
    time_in: string | null;
    time_out: string | null;
    deleted_at: string | null;
    created_at: string;
    shop: Shop;
    engineer: Engineer;
    store_item: any[]; // Assuming `store_item` and `spare_item` are arrays, replace `any` with specific type if known
    spare_item: any[];
    SLA_overdue: string;
}

export default function InventoryReportPage() {
    const currentDate = new Date();
    const sevenDaysBefore = new Date(currentDate);
    sevenDaysBefore.setDate(currentDate.getDate() - 7);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = React.useState<Ticket[]>([]);
    const [count, setCount] = React.useState(0);
    const [from, setFrom] = React.useState(formatDate(sevenDaysBefore));
    const [to, setTo] = React.useState(formatDate(currentDate));

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
        fetch(`${baseUrl}/api/report/ma?from=${from}&to=${to}`, {
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

    useEffect(() => {
        fetchMAData();
    }, [from, to]);

    return (
        <Box sx={{ mt: 2 }}>
            <Card sx={{ p: 2 }}>
                {/* Stack for alignment and spacing of inputs */}
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    {/* <TextField
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
                    /> */}
                    <Button variant="contained" startIcon={<Refresh />} onClick={fetchMAData}>Refresh</Button>
                    <Button variant="contained" startIcon={<IosShare />} color="warning">Export</Button>
                </Stack>

                <Box sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Province Name</TableCell>
                                <TableCell>Code</TableCell>
                                <TableCell>Group</TableCell>
                                <TableCell align="right">
                                    <Button variant="contained">Export</Button>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length > 0 ? rows.map((row) => (
                                // Example Row: Uncomment and replace with your actual data structure
                                // <TableRow key={row.id}>
                                //     <TableCell>{row.province_name}</TableCell>
                                //     <TableCell>{row.province_code}</TableCell>
                                //     <TableCell>{row.group}</TableCell>
                                //     <TableCell align="right">
                                //         <Button>Edit</Button>
                                //     </TableCell>
                                // </TableRow>
                                <></>
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
