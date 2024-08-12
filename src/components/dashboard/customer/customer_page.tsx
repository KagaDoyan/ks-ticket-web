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
import { Button, IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { toast } from 'react-toastify';
import { Delete, Edit, Refresh } from '@mui/icons-material';
import { authClient } from '@/lib/auth/client';
import CustomerModalForm from './modal/customer-form';

function noop(): void {
  // do nothing
}

export interface Customer {
  id: number;
  fullname: string;
  shortname: string;
  created_at: Date;
}

export function CustomerPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState<Customer[]>([]);
  const [search, setSearch] = React.useState<string>('');
  const [count, setCount] = React.useState(0);
  const [customerID, setcustomerID] = React.useState(0);

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

  const fetchcustomerData = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
    fetch(`${baseUrl}/api/customer?page=${page + 1}&limit=${rowsPerPage}&search=${search}`,
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
        toast.error("Failed to fetch customer data");
      });
  }

  const handleEditcustomer = (id: number) => {
    setcustomerID(id)
    handleOpen()
  }

  const handleDeletecustomer = (id: number) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authClient.getToken()}`
      }
    }).then((res) => {
      if (res.ok) {
        fetchcustomerData();
        toast.success("customer deleted successfully");
      } else {
        throw new Error("Failed to delete customer");
      }
    }).catch((err) => {
      toast.error("Failed to delete customer");
    });
  }

  React.useEffect(() => {
    fetchcustomerData();
  }, [page, rowsPerPage, search])

  const HandleModalAddData = () => {
    handleOpen()
  }

  const handleModalClose = () => {
    setOpen(false)
    setcustomerID(0)
  }

  return (
    <>
      <CustomerModalForm open={open} handleClose={handleModalClose} customerID={customerID} fetchcustomerData={fetchcustomerData} />
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h5">Customer</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <OutlinedInput
              defaultValue=""
              fullWidth
              placeholder="Search customer"
              startAdornment={
                <InputAdornment position="start">
                  <MagnifyingGlassIcon fontSize="12px" />
                </InputAdornment>
              }
              onChange={(e) => setSearch(e.target.value)}
              sx={{ maxWidth: '300px' ,height: '40px'}}
            />
            <Button color="inherit" startIcon={<Refresh />} sx={{ bgcolor: '#f6f9fc' }} onClick={fetchcustomerData}>
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
                <TableCell>Full name</TableCell>
                <TableCell>Short name</TableCell>
                <TableCell>Created at</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? rows.map((row) => {
                return (
                  <TableRow hover key={row.id}>
                    <TableCell>{row.fullname}</TableCell>
                    <TableCell>{row.shortname}</TableCell>
                    <TableCell>{dayjs(row.created_at).format('MMM D, YYYY')}</TableCell>
                    <TableCell>
                      <IconButton color='warning' onClick={() => handleEditcustomer(row.id)}>
                        <Edit />
                      </IconButton>
                      <IconButton color='error' onClick={() => handleDeletecustomer(row.id)}>
                        <Delete />
                      </IconButton>
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
