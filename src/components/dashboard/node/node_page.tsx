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
import { Badge, Button, IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { toast } from 'react-toastify';
import { Delete, Edit, Key, Refresh } from '@mui/icons-material';
import { authClient } from '@/lib/auth/client';
import Swal from 'sweetalert2';
import NodeModalForm from './modal/node-form';

interface Node {
  id: number;
  name: string;
  created_at: string;
  created_by: number;
  deleted_at: string | null;
  node_on_province: NodeProvince[];
}

interface NodeProvince {
  node_time: number;
  province_id: number;
  node_id: number;
  provinces: {
    id: number;
    name: string;
    code: string;
    deleted_at: string | null;
    created_at: string;
    created_by: number;
  };
}

export function NodePage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState<Node[]>([]);
  const [search, setSearch] = React.useState<string>('');
  const [count, setCount] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [nodeID, setnodeID] = React.useState(0);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);

  const [openModal, setOpenModal] = React.useState(false);
  const handlePasswordModalOpen = () => setOpenModal(true);
  const handlePasswordModalClose = () => {
    setOpenModal(false)
    setnodeID(0)
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

  const fetchnodeData = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
    fetch(`${baseUrl}/api/node?page=${page + 1}&limit=${rowsPerPage}&search=${search}`,
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
            setTotalPages(data.data.total_page);
          })
        }
      }).catch((err) => {
        toast.error("Failed to fetch node data");
      });
  }

  const handleEditnode = (id: number) => {
    setnodeID(id)
    handleOpen()
  }

  const handleEditnodePassword = (id: number) => {
    setnodeID(id)
    handlePasswordModalOpen()
  }

  const handleDeletenode = (id: number) => {
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
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/node/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authClient.getToken()}`
          }
        }).then((res) => {
          if (res.ok) {
            fetchnodeData();
            toast.success("Node deleted successfully");
          } else {
            throw new Error("Failed to delete node");
          }
        }).catch((err) => {
          toast.error("Failed to delete node");
        });
      }
    })
  }

  React.useEffect(() => {
    fetchnodeData();
  }, [page, rowsPerPage, search])

  const HandleModalAddData = () => {
    handleOpen()
  }

  const handleModalClose = () => {
    setOpen(false)
    setnodeID(0)
  }

  return (
    <>
      <NodeModalForm open={open} handleClose={handleModalClose} nodeID={nodeID} fetchnodeData={fetchnodeData} />
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h5">Node</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <OutlinedInput
              defaultValue=""
              fullWidth
              placeholder="Search node"
              startAdornment={
                <InputAdornment position="start">
                  <MagnifyingGlassIcon fontSize="12px" />
                </InputAdornment>
              }
              onChange={(e) => setSearch(e.target.value)}
              sx={{ maxWidth: '300px', height: '40px' }}
            />
            <Button color="inherit" startIcon={<Refresh />} sx={{ bgcolor: '#f6f9fc' }} onClick={fetchnodeData}>
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
                <TableCell>Provinces</TableCell>
                <TableCell>Node Time</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? rows.map((row) => {
                const provinces = row.node_on_province.map(np => np.provinces.name).join(', ');
                const nodeTimes = row.node_on_province.map(np => np.node_time).join(', ');
                return (
                  <TableRow hover key={row.id}>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                        <Typography variant="subtitle2">{row.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{provinces || 'No provinces'}</TableCell>
                    <TableCell>{nodeTimes || 'N/A'}</TableCell>
                    <TableCell>{dayjs(row.created_at).format('YYYY-MM-DD HH:mm')}</TableCell>
                    <TableCell>
                      <IconButton color='warning' onClick={() => handleEditnode(row.id)}>
                        <Edit />
                      </IconButton>
                      <IconButton color='error' onClick={() => handleDeletenode(row.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              }) : <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center' }}>No data</TableCell></TableRow>}
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
