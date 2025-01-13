import { authClient } from "@/lib/auth/client";
import { IosShare, Refresh } from "@mui/icons-material";
import { Autocomplete, Box, Button, Card, Divider, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField } from "@mui/material";
import useOnMount from "@mui/utils/useOnMount";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
import Loading from "./loading";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

// Main interface for Ticket data
interface MA {
    created_by: string;
    brand: string;
    ticketTitle: string;
    ticketDescription: string;
    incNo: string; // Incident Number
    ticketNumber: string;
    assignedTo: string;
    ticketopenDate: string; // Consider using Date type if you're handling date objects
    ticketopenTime: string; // Consider using Date type if you're handling time objects
    storeName: string;
    storeContactPhone: string;
    ticketStatus: string;
    ticketStatusDetail?: string; // Optional field, only for pending status
    ticketCloseTime?: string; // Optional if the ticket is not yet closed
    ticketCloseDate?: string; // Optional if the ticket is not yet closed
    engineerName: string;
    engineerNode?: string; // Optional if no notes are provided
    appointmentTime?: string; // Optional if no appointment is scheduled
    appointmentDate?: string; // Optional if no appointment is scheduled
    solution?: string | null; // Optional if no solution is provided yet
    slaPriorityGroup?: string;
    slaPriority: string; // SLA Priority
    slaPriorityTime: string; // Time when the SLA was reached
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
    returnDeviceBrand1?: string;
    returnDeviceModel1?: string;
    returnDeviceSerial1?: string;
    returnDeviceBrand2?: string;
    returnDeviceModel2?: string;
    returnDeviceSerial2?: string;
    returnDeviceBrand3?: string;
    returnDeviceModel3?: string;
    returnDeviceSerial3?: string;
    returnDeviceBrand4?: string;
    returnDeviceModel4?: string;
    returnDeviceSerial4?: string;
    returnDeviceBrand5?: string;
    returnDeviceModel5?: string;
    returnDeviceSerial5?: string;
}

interface Customer {
    id: number;
    fullname: string;
    shortname: string;
}


export default function MAReportPage() {
    const [userData, setUserData] = React.useState<{ role?: string, customer?: { shortname: string,fullname: string } } | null>(null);
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

    const [loading, setLoading] = React.useState(true);
    const [customers, setCustomers] = React.useState<Customer[]>([]);
    const currentDate = new Date();
    const sevenDaysBefore = new Date(currentDate);
    sevenDaysBefore.setDate(currentDate.getDate() - 7);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = React.useState<MA[]>([]);
    const [count, setCount] = React.useState(0);
    const [from, setFrom] = React.useState(dayjs(sevenDaysBefore).format("DD/MM/YYYY"));
    const [to, setTo] = React.useState(dayjs(currentDate).format("DD/MM/YYYY"));
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
        setLoading(false)
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
        let url = `${baseUrl}/api/report/ma?from=${dayjs(from, "DD/MM/YYYY").format("YYYY-MM-DD")}&to=${dayjs(to, "DD/MM/YYYY").format("YYYY-MM-DD")}&brand_name=${customer_name}`
        if (userData?.role === "Customer") {
            url = `${baseUrl}/api/report/ma?from=${dayjs(from, "DD/MM/YYYY").format("YYYY-MM-DD")}&to=${dayjs(to, "DD/MM/YYYY").format("YYYY-MM-DD")}&brand_name=${userData.customer?.fullname}`
        }
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authClient.getToken()}`
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setRows(data.data.report)
                setLoading(false);
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

    const exportToExcel = () => {
        const headers: (keyof MA)[] = [
            "created_by",
            "brand", "ticketTitle", "ticketDescription", "incNo", "ticketNumber", "assignedTo",
            "ticketopenDate", "ticketopenTime", "storeName", "storeContactPhone", "ticketStatus",
            "ticketCloseTime", "ticketCloseDate", "engineerName",
            "engineerNode", "appointmentTime", "appointmentDate", "solution", "slaPriorityGroup", "slaPriority", "slaPriorityTime",
            "recoveryTime", "slaOverdue", "action", "lastUpdated", "storeDeviceBrand1",
            "storeDeviceModel1", "storeDeviceSerial1", "storeDeviceBrand2", "storeDeviceModel2",
            "storeDeviceSerial2", "storeDeviceBrand3", "storeDeviceModel3", "storeDeviceSerial3",
            "storeDeviceBrand4", "storeDeviceModel4", "storeDeviceSerial4", "storeDeviceBrand5",
            "storeDeviceModel5", "storeDeviceSerial5", "spareDeviceBrand1", "spareDeviceModel1",
            "spareDeviceSerial1", "spareDeviceBrand2", "spareDeviceModel2", "spareDeviceSerial2",
            "spareDeviceBrand3", "spareDeviceModel3", "spareDeviceSerial3", "spareDeviceBrand4",
            "spareDeviceModel4", "spareDeviceSerial4", "spareDeviceBrand5", "spareDeviceModel5",
            "spareDeviceSerial5", "return_investigation", "return_solution", "return_time_in",
            "return_time_out", "returnDeviceBrand1", "returnDeviceModel1", "returnDeviceSerial1",
            "returnDeviceBrand2", "returnDeviceModel2", "returnDeviceSerial2", "returnDeviceBrand3",
            "returnDeviceModel3", "returnDeviceSerial3", "returnDeviceBrand4", "returnDeviceModel4",
            "returnDeviceSerial4", "returnDeviceBrand5", "returnDeviceModel5", "returnDeviceSerial5",
        ];
        const orderedRows = rows.map(row => {
            const orderedRow: Partial<MA> = {};
            headers.forEach(header => {
                //for data field change format as dd/mm/yyyy
                const dateFields = ['ticketopenDate', 'ticketCloseDate', 'lastUpdated'];
                if (dateFields.includes(header)) {
                    orderedRow[header] = row[header] ? dayjs(row[header]).format('DD/MM/YYYY') : '';
                } else {
                    orderedRow[header] = row[header] ?? ''; // Assign an empty string if field is missing
                }
            });
            return orderedRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(orderedRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "MA");
        // Export the file
        XLSX.writeFile(workbook, `MA-${from}-${to}.xlsx`);
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
                    {userData?.role !== "Customer" && (
                        <Autocomplete
                            options={customers}
                            size="small"
                            sx={{ width: 150 }}
                            getOptionLabel={(option) => option.shortname}
                            value={customers.find((customer) => customer.shortname === customer_name) || null}
                            onChange={(event, newValue) => {
                                const selected = newValue ? newValue.fullname : "";
                                setCustomer(selected)
                            }}
                            renderInput={(params) => <TextField {...params} label="brand" />}
                        />
                    )}
                    <Button variant="contained" startIcon={<Refresh />} onClick={fetchMAData}>Refresh</Button>
                    <Button variant="contained" startIcon={<IosShare />} color="warning" onClick={() => exportToExcel()}>Export</Button>
                </Stack>

                <Box sx={{ overflowX: 'auto' }}>
                    {loading ? <Loading /> :
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
            </Card >
        </Box >
    );
}
