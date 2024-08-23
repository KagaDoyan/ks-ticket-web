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
import { Delete, Edit, PersonAddAlt1Outlined, PersonRemoveAlt1Outlined, Refresh } from '@mui/icons-material';
import { authClient } from '@/lib/auth/client';
import ItemModalForm from './modal/item-form';
import EngineerSelectionModal from './modal/engineer_select';
import Swal from 'sweetalert2';

export interface item {
  id: number;
  model_id: string;
  created_at: Date;
  waranty_expiry_date: Date;
  serial_number: string;
  status: string;
  model: {
    id: number;
    name: string;
    brand_id: number;
  };
  brand: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  engineers_id: number;
  engineer: {
    id: number;
    name: string;
  } | null;
}

export function ItemPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState<item[]>([]);
  const [search, setSearch] = React.useState<string>('');
  const [count, setCount] = React.useState(0);
  const [itemID, setitemID] = React.useState(0);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);

  const [eopen, seteOpen] = React.useState(false);
  const handleEOpen = (id: number) => {
    setitemID(id);
    seteOpen(true);
  };
  const handleEClose = () => seteOpen(false);

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

  const fetchitemData = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
    fetch(`${baseUrl}/api/item?page=${page + 1}&limit=${rowsPerPage}&search=${search}`,
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
        toast.error("Failed to fetch item data");
      });
  }

  const handleEdititem = (id: number) => {
    setitemID(id)
    handleOpen()
  }

  const handleDeleteitem = (id: number) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authClient.getToken()}`
      }
    }).then((res) => {
      if (res.ok) {
        fetchitemData();
        toast.success("item deleted successfully");
      } else {
        throw new Error("Failed to delete item");
      }
    }).catch((err) => {
      toast.error("Failed to delete item");
    });
  }

  const handleRemoveEngineer = (id: number) => {
    Swal.fire({
      title: 'please confirm',
      text: 'Are you sure you want to return the item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/engineer/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authClient.getToken()}`
          },
          body: JSON.stringify({
            engineer_id: null
          })
        }).then((res) => {
          if (res.ok) {
            fetchitemData();
            toast.success("Engineer removed successfully");
          } else {
            throw new Error("Failed to remove engineer");
          }
        }).catch((err) => {
          toast.error("Failed to remove engineer");
        });
      }
    })
  }

  React.useEffect(() => {
    fetchitemData();
  }, [page, rowsPerPage, search])

  const HandleModalAddData = () => {
    handleOpen()
  }

  const handleModalClose = () => {
    setOpen(false)
    setitemID(0)
  }

  return (
    <>
      <EngineerSelectionModal open={eopen} handleClose={handleEClose} itemID={itemID} fetchitemData={fetchitemData}/>
      <ItemModalForm open={open} handleClose={handleModalClose} itemID={itemID} fetchitemData={fetchitemData} />
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h5">Item</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <OutlinedInput
              defaultValue=""
              fullWidth
              placeholder="Search item"
              startAdornment={
                <InputAdornment position="start">
                  <MagnifyingGlassIcon fontSize="12px" />
                </InputAdornment>
              }
              onChange={(e) => setSearch(e.target.value)}
              sx={{ maxWidth: '300px', height: '40px' }}
            />
            <Button color="inherit" startIcon={<Refresh />} sx={{ bgcolor: '#f6f9fc' }} onClick={fetchitemData}>
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
                <TableCell>serial number</TableCell>
                <TableCell>category</TableCell>
                <TableCell>brand</TableCell>
                <TableCell>model</TableCell>
                <TableCell>location</TableCell>
                <TableCell>waranty expiry date</TableCell>
                <TableCell>status</TableCell>
                <TableCell>Created at</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? rows.map((row) => {
                return (
                  <TableRow hover key={row.id}>
                    <TableCell>{row.serial_number}</TableCell>
                    <TableCell>{row.category.name}</TableCell>
                    <TableCell>{row.brand.name}</TableCell>
                    <TableCell>{row.model.name}</TableCell>
                    <TableCell><Badge badgeContent={row.engineer?.name ? row.engineer.name : 'WareHouse'} color={row.engineer?.name ? 'primary' : 'warning'} /></TableCell>
                    <TableCell>{dayjs(row.waranty_expiry_date).format('MMM D, YYYY')}</TableCell>
                    <TableCell><Badge badgeContent={row.status} color={row.status === 'in_stock' ? 'success' : 'warning'} /></TableCell>
                    <TableCell>{dayjs(row.created_at).format('MMM D, YYYY')}</TableCell>
                    <TableCell>
                      <IconButton color='warning' onClick={() => handleEdititem(row.id)}>
                        <Edit />
                      </IconButton>
                      {row.engineers_id === null || row.engineers_id === 0 ? <IconButton color='primary' onClick={() => handleEOpen(row.id)}>
                        <PersonAddAlt1Outlined />
                      </IconButton> : <IconButton color='error' onClick={() => handleRemoveEngineer(row.id)}>
                        <PersonRemoveAlt1Outlined />
                      </IconButton>}
                      <IconButton color='error' onClick={() => handleDeleteitem(row.id)}>
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
