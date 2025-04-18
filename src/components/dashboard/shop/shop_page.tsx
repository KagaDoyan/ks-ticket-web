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
import ShopModalForm from './modal/shop-form';
import Swal from 'sweetalert2';
import useOnMount from '@mui/utils/useOnMount';

export interface shop {
  id: number,
  shop_name: string,
  shop_number: string,
  phone: string,
  email: string,
  latitude: string,
  longitude: string,
  province_id: number,
  created_at: Date,
  customer: Customer,
  province: province,
}

interface Customer {
  id: number;
  fullname: string;
  shortname: string;
}

interface province {
  id: number,
  name: string,
  code: string,
}

export function ShopPage(): React.JSX.Element {
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
  const [rows, setRows] = React.useState<shop[]>([]);
  const [search, setSearch] = React.useState<string>('');
  const [count, setCount] = React.useState(0);
  const [shopID, setshopID] = React.useState(0);


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
  const handleOpen = () => setOpen(true);

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

  const fetchshopData = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
    fetch(`${baseUrl}/api/shop?page=${page + 1}&limit=${rowsPerPage}&search=${search}&customer_id=${selectedcustomer_id}`,
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
        toast.error("Failed to fetch shop data");
      });
  }

  const handleEditshop = (id: number) => {
    setshopID(id)
    handleOpen()
  }

  const handleDeleteshop = (id: number) => {
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
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shop/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authClient.getToken()}`
          }
        }).then((res) => {
          if (res.ok) {
            fetchshopData();
            toast.success("shop deleted successfully");
          } else {
            throw new Error("Failed to delete shop");
          }
        }).catch((err) => {
          toast.error("Failed to delete shop");
        });
      }
    })
  }

  React.useEffect(() => {
    fetchshopData();
  }, [page, rowsPerPage, search, selectedcustomer_id]);

  const HandleModalAddData = () => {
    handleOpen()
  }

  const handleModalClose = () => {
    setOpen(false)
    setshopID(0)
  }

  return (
    <>
      <ShopModalForm open={open} handleClose={handleModalClose} shopID={shopID} fetchshopData={fetchshopData} />
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h5">Shop</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <OutlinedInput
              defaultValue=""
              fullWidth
              placeholder="Search shop"
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
            <Button color="inherit" startIcon={<Refresh />} sx={{ bgcolor: '#f6f9fc' }} onClick={fetchshopData}>
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
                <TableCell>Shop number</TableCell>
                <TableCell>Shop name</TableCell>
                <TableCell>phone</TableCell>
                <TableCell>email</TableCell>
                <TableCell>customer</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? rows.map((row) => {
                return (
                  <TableRow hover key={row.id}>
                    <TableCell>{row.shop_number}</TableCell>
                    <TableCell>{row.shop_name}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.customer.shortname}</TableCell>
                    <TableCell>{row.latitude}, {row.longitude}</TableCell>
                    <TableCell>
                      {userData?.role === "Admin" || userData?.role === "SuperAdmin" ? <div>
                        <IconButton color='warning' onClick={() => handleEditshop(row.id)}>
                          <Edit />
                        </IconButton>
                        <IconButton color='error' onClick={() => handleDeleteshop(row.id)}>
                          <Delete />
                        </IconButton>
                      </div>
                        : ""}
                    </TableCell>
                  </TableRow>
                );
              }) : <TableCell colSpan={5} sx={{ textAlign: 'center' }}>No data</TableCell>}
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
