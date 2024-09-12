import { authClient } from "@/lib/auth/client";
import { IosShare, Refresh } from "@mui/icons-material";
import { Box, Button, Card, Divider, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

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
    solution: string;
    investigation: string;
    close_description: string | null;
    item_brand: string;
    item_category: string;
    item_model: string;
    item_sn: string;
    warranty_exp: string;
    resolve_status: boolean;
    resolve_remark: string | null;
    action: string;
    time_in: string;
    time_out: string;
    deleted_at: string | null;
    created_at: string;
    engineer: string;
    engineer_node: string;
    shop: string;
    SLA_overdue: string;
}

export default function MAReportPage() {
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
    }, [from, to]);

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
                                    <TableRow key={ticket.id}>
                                        <TableCell>{ticket.inc_number}</TableCell>
                                        <TableCell>{ticket.ticket_number}</TableCell>
                                        <TableCell>{ticket.title}</TableCell>
                                        <TableCell>{ticket.ticket_status}</TableCell>
                                        <TableCell>{ticket.assigned_to}</TableCell>
                                        <TableCell>{ticket.engineer}</TableCell>
                                        <TableCell>{ticket.shop}</TableCell>
                                        <TableCell>{ticket.due_by}</TableCell>
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
