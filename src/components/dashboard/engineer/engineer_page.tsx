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
import EngineerModalForm from './modal/engineer-form';
import Swal from 'sweetalert2';

interface engineer {
  id: number;
  name: string;
  lastname: string;
  phone: string;
  line_name: string;
  latitude: string;
  longitude: string;
  node: {
    id: number;
    name: string
  };
  province: provinces[]
  deleted_at: Date;
  created_at: Date;
  created_by: number;
  out_source: boolean;
}

interface node {
  id: number;
  name: string
}

interface provinces {
  id: number;
  name: string;
  code: string;
}

export function EngineerPage(): React.JSX.Element {
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
  const [rows, setRows] = React.useState<engineer[]>([]);
  const [search, setSearch] = React.useState<string>('');
  const [count, setCount] = React.useState(0);
  const [engineerID, setengineerID] = React.useState(0);
  const [nodes, setNodes] = React.useState<node[]>([]);
  const [selected_node, setSelected_node] = React.useState('');

  const GetNode = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/node/option`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authClient.getToken()}`
      }
    })
      .then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            setNodes(data.data);
          })
        }
      })
  }

  React.useEffect(() => {
    GetNode();
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

  const fetchengineerData = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
    fetch(`${baseUrl}/api/engineer?page=${page + 1}&limit=${rowsPerPage}&search=${search}&node_id=${selected_node}`,
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
        toast.error("Failed to fetch engineer data");
      });
  }

  const handleEditengineer = (id: number) => {
    setengineerID(id)
    handleOpen()
  }

  const handleDeleteengineer = (id: number) => {
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
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/engineer/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authClient.getToken()}`
          }
        }).then((res) => {
          if (res.ok) {
            fetchengineerData();
            toast.success("engineer deleted successfully");
          } else {
            throw new Error("Failed to delete engineer");
          }
        }).catch((err) => {
          toast.error("Failed to delete engineer");
        });
      }
    })
  }

  React.useEffect(() => {
    fetchengineerData();
  }, [page, rowsPerPage, search, selected_node]);

  const HandleModalAddData = () => {
    handleOpen()
  }

  const handleModalClose = () => {
    setOpen(false)
    setengineerID(0)
  }

  return (
    <>
      <EngineerModalForm open={open} handleClose={handleModalClose} engineerID={engineerID} fetchengineerData={fetchengineerData} />
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h5">Engineer</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <OutlinedInput
              defaultValue=""
              fullWidth
              placeholder="Search engineer"
              startAdornment={
                <InputAdornment position="start">
                  <MagnifyingGlassIcon fontSize="12px" />
                </InputAdornment>
              }
              onChange={(e) => setSearch(e.target.value)}
              sx={{ maxWidth: '300px', height: '40px' }}
            />
            <Autocomplete
              options={nodes}
              sx={{ minWidth: '200px' }}
              size='small'
              getOptionLabel={(option) => option.name}
              value={nodes.find((node) => node.id === Number(selected_node)) || null}
              onChange={(event, newValue) => {
                const selectedId = newValue ? String(newValue.id) : '';
                setSelected_node(selectedId);
              }}
              renderInput={(params) => <TextField {...params} label="Node" />}
            />
            <Button color="inherit" startIcon={<Refresh />} sx={{ bgcolor: '#f6f9fc' }} onClick={fetchengineerData}>
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
                <TableCell>Lastname</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Line Name</TableCell>
                <TableCell>Node</TableCell>
                <TableCell>Location </TableCell>
                <TableCell>Outsource</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? rows.map((row) => {
                return (
                  <TableRow hover key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.lastname}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.line_name}</TableCell>
                    <TableCell>{row.node.name}</TableCell>
                    <TableCell>{row.latitude}, {row.longitude}</TableCell>
                    <TableCell>{row.out_source ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      {userData?.role === "Admin" || userData?.role === "SuperAdmin" ? <div>
                        <IconButton color='warning' onClick={() => handleEditengineer(row.id)}>
                          <Edit />
                        </IconButton>
                        <IconButton color='error' onClick={() => handleDeleteengineer(row.id)}>
                          <Delete />
                        </IconButton>
                      </div> : ""}
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
