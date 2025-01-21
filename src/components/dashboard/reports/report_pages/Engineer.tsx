import { authClient } from "@/lib/auth/client";
import { IosShare, Refresh } from "@mui/icons-material";
import { Autocomplete, Box, Button, Card, Divider, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from 'xlsx';
import Loading from "./loading";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";

interface EngineerReport {
  ticket_date: string;
  appointment_date: string;
  time_in: string;
  time_out: string;
  engineer: string;
  node: string;
  ticket_number: string;
  inc_number: string;
  ticket_title: string;
  shop_name: string;
}

interface Customer {
  id: number;
  fullname: string;
  shortname: string;
}

export function EngineerReportPage(): React.JSX.Element {
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

  const [loading, setLoading] = React.useState(true);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const currentDate = new Date();
  const sevenDaysBefore = new Date(currentDate);
  sevenDaysBefore.setDate(currentDate.getDate() - 7);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState<EngineerReport[]>([]);
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

  const fetchData = async () => {
    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
    let url = `${baseUrl}/api/report/engineerkpi?from=${dayjs(from, "DD/MM/YYYY").format("YYYY-MM-DD")}&to=${dayjs(to, "DD/MM/YYYY").format("YYYY-MM-DD")}&brand_name=${customer_name}`;
    if (userData?.role === "Customer") {
      url = `${baseUrl}/api/report/engineerkpi?from=${dayjs(from, "DD/MM/YYYY").format("YYYY-MM-DD")}&to=${dayjs(to, "DD/MM/YYYY").format("YYYY-MM-DD")}&brand_name=${userData.customer?.fullname}`;
    }

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
        setRows(data.data.report);
      }
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    GetCustomer();
}, [from, to, customer_name]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Engineer Report");
    XLSX.writeFile(workbook, `Engineer_Report_${from}_${to}.xlsx`);
  };

  React.useEffect(() => {
    GetCustomer();
  }, []);

  return (
    <Card>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1}>
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
          </Stack>
          <Stack direction="row" spacing={1}>
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
              onClick={exportToExcel}
            >
              Export
            </Button>
          </Stack>
        </Stack>

        {loading ? (
          <Loading />
        ) : (
          <Box sx={{ minWidth: 800 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ticket Date</TableCell>
                  <TableCell>Appointment Date</TableCell>
                  <TableCell>Time In</TableCell>
                  <TableCell>Time Out</TableCell>
                  <TableCell>Engineer</TableCell>
                  <TableCell>Node</TableCell>
                  <TableCell>Ticket Number</TableCell>
                  <TableCell>INC Number</TableCell>
                  <TableCell>Ticket Title</TableCell>
                  <TableCell>Shop Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.ticket_date}</TableCell>
                    <TableCell>{row.appointment_date}</TableCell>
                    <TableCell>{row.time_in}</TableCell>
                    <TableCell>{row.time_out}</TableCell>
                    <TableCell>{row.engineer}</TableCell>
                    <TableCell>{row.node}</TableCell>
                    <TableCell>{row.ticket_number}</TableCell>
                    <TableCell>{row.inc_number}</TableCell>
                    <TableCell>{row.ticket_title}</TableCell>
                    <TableCell>{row.shop_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={count}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        )}
      </Box>
    </Card>
  );
}
