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
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { toast } from 'react-toastify';
import UserModalForm from './modal/user-form';
import { Delete, Edit, Refresh } from '@mui/icons-material';
import { authClient } from '@/lib/auth/client';
import { bgcolor } from '@mui/system';

function noop(): void {
  // do nothing
}

export interface Customer {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  role: string;
  created_at: Date;
}

export function UserTable(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState<Customer[]>([]);
  const [search, setSearch] = React.useState<string>('');
  const [count, setCount] = React.useState(0);
  const [UserID, setUserID] = React.useState(0);

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

  const fetchUserData = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
    fetch(`${baseUrl}/api/user?page=${page + 1}&limit=${rowsPerPage}&search=${search}`,
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
        toast.error("Failed to fetch user data");
      });
  }

  const handleEditUser = (id: number) => {
    setUserID(id)
    handleOpen()
  }

  const handleDeleteUser = (id: number) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authClient.getToken()}`
      }
    }).then((res) => {
      if (res.ok) {
        fetchUserData();
        toast.success("User deleted successfully");
      } else {
        throw new Error("Failed to delete user");
      }
    }).catch((err) => {
      toast.error("Failed to delete user");
    });
  }

  React.useEffect(() => {
    fetchUserData();
  }, [page, rowsPerPage, search])

  const HandleModalAddData = () => {
    handleOpen()
  }

  const handleModalClose = () => {
    setOpen(false)
    setUserID(0)
  }

  return (
    <>
      <UserModalForm open={open} handleClose={handleModalClose} userID={UserID} fetchUserData={fetchUserData} />
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h5">Users</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <OutlinedInput
              defaultValue=""
              fullWidth
              placeholder="Search user"
              startAdornment={
                <InputAdornment position="start">
                  <MagnifyingGlassIcon fontSize="12px" />
                </InputAdornment>
              }
              onChange={(e) => setSearch(e.target.value)}
              sx={{ maxWidth: '300px', height: '40px' }}
            />
            <Button color="inherit" startIcon={<Refresh />} sx={{ bgcolor: '#f6f9fc' }} onClick={fetchUserData}>
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
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created at</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? rows.map((row) => {
                return (
                  <TableRow hover key={row.id}>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        <Typography variant="subtitle2">{row.fullname}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>{dayjs(row.created_at).format('MMM D, YYYY')}</TableCell>
                    <TableCell>
                      <IconButton color='warning' onClick={() => handleEditUser(row.id)}>
                        <Edit />
                      </IconButton>
                      <IconButton color='error' onClick={() => handleDeleteUser(row.id)}>
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
