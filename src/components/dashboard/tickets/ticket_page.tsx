'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Autocomplete, Button, IconButton, InputAdornment, OutlinedInput, TextField } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { toast } from 'react-toastify';
import { Delete, Edit, Refresh } from '@mui/icons-material';
import { authClient } from '@/lib/auth/client';
import CreateTicketModalForm from './modal/ticket-form';
import TicketProcessModalForm from './modal/ticket-process';
import Swal from 'sweetalert2';

interface User {
  id: number;
  deleted_at: string | null;
  created_at: string;
  email: string;
  fullname: string;
  password: string;
  first_login: boolean;
  role: string;
}

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

interface ticket {
  id: number;
  inc_number: string;
  ticket_number: string;
  customer_id: number;
  store_id: number;
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
  created_user: User;
  engineer: Engineer;
  shop: {
    id: number;
    shop_name: string;
    shop_number: string;
  }
}

interface Customer {
  id: number;
  fullname: string;
  shortname: string;
}

export function TicketPage(): React.JSX.Element {
  const [userData, setUserData] = React.useState<{ role?: string } | null>(null);
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
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState<ticket[]>([]);
  const [search, setSearch] = React.useState<string>('');
  const [count, setCount] = React.useState(0);
  const [ticketID, setticketID] = React.useState(0);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [selectedcustomer_id, setSelectedcustomer_id] = React.useState("");
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
  React.useEffect(() => {
    GetCustomer();
  }, [])

  const [open, setOpen] = React.useState(false);
  const [openProcess, setOpenProcess] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleProcessOpen = () => setOpenProcess(true);

  const [selectStatus, setSelectStatus] = React.useState("");
  const status = ["open", "pending", "close", "spare", "oncall", "cancel", "claim"]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'rgb(255, 47, 47)';
      case 'pending':
        return 'rgb(251, 106, 58)';
      case 'spare':
        return 'rgb(255, 204, 153)';
      case 'close':
        return 'rgb(153, 255, 153)';
      case 'oncall':
        return 'rgb(57, 156, 255)';
      case 'cancel':
        return 'rgb(158, 158, 158)';
      case 'claim':
        return 'rgb(255, 204, 153)';
      default:
        return 'info';
    }
  }

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

  const fetchticketData = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
    fetch(`${baseUrl}/api/ticket?page=${page + 1}&limit=${rowsPerPage}&search=${search}&brand_name=${selectedcustomer_id}&status=${selectStatus}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authClient.getToken()}`
        }
      })
      .then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            setRows(data.data.data);
            setCount(data.data.total_rows);
          })
        }
      }).catch((err) => {
        // throw new Error(err);
        toast.error("Failed to fetch ticket data");
      });
  }

  const handleEditticket = (id: number) => {
    setticketID(id)
    handleProcessOpen()
  }

  const handleDeleteticket = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticket/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authClient.getToken()}`
          }
        }).then((res) => {
          if (res.ok) {
            fetchticketData();
            toast.success("ticket deleted successfully");
          } else {
            throw new Error("Failed to delete ticket");
          }
        }).catch((err) => {
          toast.error("Failed to delete ticket");
        });
      }
    })
  }

  React.useEffect(() => {
    fetchticketData();
  }, [page, rowsPerPage, search, selectedcustomer_id, selectStatus]);

  const HandleModalAddData = () => {
    handleOpen()
  }

  const handleModalClose = () => {
    setOpen(false)
    setticketID(0)
  }

  const handleProcessModalClose = () => {
    setOpenProcess(false)
    setticketID(0)
  }

  return (
    <>
      <CreateTicketModalForm open={open} handleClose={handleModalClose} ticketID={ticketID} fetchticketData={fetchticketData} />
      <TicketProcessModalForm open={openProcess} handleClose={handleProcessModalClose} ticketID={ticketID} fetchticketData={fetchticketData} />
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h5">Ticket</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <OutlinedInput
              defaultValue=""
              fullWidth
              placeholder="Search ticket"
              startAdornment={
                <InputAdornment position="start">
                  <MagnifyingGlassIcon fontSize="12px" />
                </InputAdornment>
              }
              onChange={(e) => setSearch(e.target.value)}
              sx={{ maxWidth: '300px', height: '40px' }}
            />
            <Autocomplete
              sx={{ minWidth: '200px' }}
              size="small"
              options={customers}
              getOptionLabel={(option) => option.fullname}
              value={customers.find((customer: any) => customer.id === Number(selectedcustomer_id)) || null}
              onChange={(event, newValue) => {
                const selectedId = newValue ? String(newValue.id) : "";
                setSelectedcustomer_id(selectedId);
              }}
              renderInput={(params) => <TextField {...params} label="Customer" />}
            />
            <Autocomplete
              sx={{ minWidth: '200px' }}
              size="small"
              options={status}
              getOptionLabel={(option) => option}
              value={selectStatus || null}
              onChange={(event, newValue) => {
                setSelectStatus(newValue || '');
              }}
              renderInput={(params) => <TextField {...params} label="Status" />}
            />
            <Button color="inherit" startIcon={<Refresh />} sx={{ bgcolor: '#f6f9fc' }} onClick={fetchticketData}>
              refresh
            </Button>
          </Stack>
        </Stack>
        <div>
          <Button onClick={HandleModalAddData} startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
            Add
          </Button>
        </div>
      </Stack>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Ticket number</TableCell>
                <TableCell>Incident number</TableCell>
                <TableCell>Ticket title</TableCell>
                <TableCell>Shop</TableCell>
                <TableCell>Created by</TableCell>
                <TableCell>Created at</TableCell>
                <TableCell>Due date</TableCell>
                <TableCell>Engineer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ?
                rows.map((row) => {
                  return (
                    <TableRow hover key={row.id}>
                      <TableCell>{row.ticket_number}</TableCell>
                      <TableCell>{row.inc_number}</TableCell>
                      <TableCell>{row.title}</TableCell>
                      <TableCell>{row.shop.shop_number + ' - ' + row.shop.shop_name}</TableCell>
                      <TableCell>{row.created_user.fullname}</TableCell>
                      <TableCell>{dayjs(row.created_at).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>{dayjs(row.due_by).format('DD/MM/YYYY hh:mm:ss')}</TableCell>
                      <TableCell>{row.engineer.name + ' ' + row.engineer.lastname}</TableCell>
                      <TableCell><Box sx={{ bgcolor: getStatusColor(row.ticket_status), display: 'inline-block', height: '10', width: '10', borderRadius: '5px', marginRight: '5px', padding: '5px', color: 'white' }}>{row.ticket_status}</Box></TableCell>
                      <TableCell>
                        <IconButton color='warning' onClick={() => handleEditticket(row.id)}>
                          <Edit />
                        </IconButton>
                        {userData?.role === 'Admin' || userData?.role === 'SuperAdmin' || userData?.role === 'User' ? <IconButton color='error' onClick={() => handleDeleteticket(row.id)}> <Delete /> </IconButton> : null}
                      </TableCell>
                    </TableRow>
                  );
                })
                :
                <TableCell colSpan={7} sx={{ textAlign: 'center' }}>
                  No data
                </TableCell>}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={count}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>
    </>
  );
}
