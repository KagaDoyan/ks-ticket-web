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
import ModelModalForm from './modal/model-form';

function noop(): void {
  // do nothing
}

export interface Model {
  id: number;
  name: string;
  created_at: Date;
}

export function ModelPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState<Model[]>([]);
  const [search, setSearch] = React.useState<string>('');
  const [count, setCount] = React.useState(0);
  const [ModelID, setModelID] = React.useState(0);

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

  const fetchModelData = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
    fetch(`${baseUrl}/api/model?page=${page + 1}&limit=${rowsPerPage}&search=${search}`,
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
        toast.error("Failed to fetch Model data");
      });
  }

  const handleEditModel = (id: number) => {
    setModelID(id)
    handleOpen()
  }

  const handleDeleteModel = (id: number) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/model/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authClient.getToken()}`
      }
    }).then((res) => {
      if (res.ok) {
        fetchModelData();
        toast.success("Model deleted successfully");
      } else {
        throw new Error("Failed to delete Model");
      }
    }).catch((err) => {
      toast.error("Failed to delete Model");
    });
  }

  React.useEffect(() => {
    fetchModelData();
  }, [page, rowsPerPage, search])

  const HandleModalAddData = () => {
    handleOpen()
  }

  const handleModalClose = () => {
    setOpen(false)
    setModelID(0)
  }

  return (
    <>
      <ModelModalForm open={open} handleClose={handleModalClose} ModelID={ModelID} fetchModelData={fetchModelData} />
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h5">Model</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <OutlinedInput
              defaultValue=""
              fullWidth
              placeholder="Search Model"
              startAdornment={
                <InputAdornment position="start">
                  <MagnifyingGlassIcon fontSize="12px" />
                </InputAdornment>
              }
              onChange={(e) => setSearch(e.target.value)}
              sx={{ maxWidth: '300px' ,height: '40px'}}
            />
            <Button color="inherit" startIcon={<Refresh />} sx={{ bgcolor: '#f6f9fc' }} onClick={fetchModelData}>
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
                <TableCell>Model name</TableCell>
                <TableCell>Created at</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? rows.map((row) => {
                return (
                  <TableRow hover key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{dayjs(row.created_at).format('MMM D, YYYY')}</TableCell>
                    <TableCell>
                      <IconButton color='warning' onClick={() => handleEditModel(row.id)}>
                        <Edit />
                      </IconButton>
                      <IconButton color='error' onClick={() => handleDeleteModel(row.id)}>
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
