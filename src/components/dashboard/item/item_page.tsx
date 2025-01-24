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
import { Badge, Button, IconButton, InputAdornment, OutlinedInput, TextField, Autocomplete } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { toast } from 'react-toastify';
import { Delete, Edit, PersonAddAlt1Outlined, PersonRemoveAlt1Outlined, Refresh } from '@mui/icons-material';
import { authClient } from '@/lib/auth/client';
import ItemModalForm from './modal/item-form';
import EngineerSelectionModal from './modal/engineer_select';
import Swal from 'sweetalert2';
import useOnMount from '@mui/utils/useOnMount';
import { url } from 'inspector';

export interface item {
  shop_number: string;
  item_type: string;
  id: number;
  model_id: string;
  created_at: Date;
  warranty_expiry_date: Date;
  serial_number: string;
  status: string;
  inc_number: string;
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
    node: {
      id: number;
      name: string;
    }
  } | null;
  storage_id: number;
  storage: {
    id: number;
    name: string;
  }
  Remark: string;
  condition: string;
}

interface storage {
  id: number;
  name: string;
}

export function ItemPage(): React.JSX.Element {
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
  const [rows, setRows] = React.useState<item[]>([]);
  const [search, setSearch] = React.useState<string>('');
  const [searchFilters, setSearchFilters] = React.useState<{
    engineer?: string;
    shop?: string;
    storage?: string;
    default?: string;
  }>({});
  const [categoryFilter, setCategoryFilter] = React.useState<number>(0);
  const [conditionFilter, setConditionFilter] = React.useState<string>('');
  const [typeFilter, setTypeFilter] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [statusOptions, setStatusOptions] = React.useState<string[]>([]);
  const [count, setCount] = React.useState(0);
  const [itemID, setitemID] = React.useState(0);
  const [storage, setStorage] = React.useState<storage[]>([]);
  const [categories, setCategories] = React.useState<{ id: number; name: string }[]>([]);
  const [locationIndicators, setLocationIndicators] = React.useState<{ label: string; value: string }[]>([]);
  const [selectedIndicator, setSelectedIndicator] = React.useState<{ label: string; value: string } | null>(null);
  const [locationSearchValue, setLocationSearchValue] = React.useState<string>('');

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

  const GetStorage = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/option`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authClient.getToken()}`
      }
    })
      .then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            setStorage(data.data);
          })
        }
      })
  }

  const fetchCategories = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category/option`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authClient.getToken()}`
      }
    })
      .then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            setCategories(data.data);
          })
        }
      })
  }

  const fetchStatusOptions = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authClient.getToken()}`
      }
    })
      .then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            setStatusOptions(data.data);
          })
        }
      })
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const filters: typeof searchFilters = {};

    // Parse indicator-based search
    const indicatorMatches = inputValue.match(/(\w+):([^:\s]+)/g);
    if (indicatorMatches) {
      indicatorMatches.forEach(match => {
        const [indicator, value] = match.split(':');
        switch (indicator) {
          case 'engineer':
            filters.engineer = value;
            break;
          case 'shop':
            filters.shop = value;
            break;
          case 'storage':
            filters.storage = value;
            break;
        }
      });

      // Remove indicator parts from the search string
      filters.default = inputValue.replace(/(\w+):([^:\s]+)\s*/g, '').trim();
    } else {
      // If no indicators, use the entire input as default search
      filters.default = inputValue;
    }

    setSearch(inputValue);
    setSearchFilters(filters);
  };

  const fetchitemData = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
    const params = new URLSearchParams({
      page: (page + 1).toString(),
      limit: rowsPerPage.toString(),
      ...(searchFilters.default && { search: searchFilters.default }),
      ...(categoryFilter && { category: categoryFilter.toString() }),
      ...(searchFilters.engineer && { engineer: encodeURIComponent(searchFilters.engineer) }),
      ...(searchFilters.shop && { shop: encodeURIComponent(searchFilters.shop) }),
      ...(searchFilters.storage && { storage: encodeURIComponent(searchFilters.storage) }),
      ...(conditionFilter && { condition: conditionFilter }),
      ...(typeFilter && { type: typeFilter }),
      ...(statusFilter && { status: statusFilter }),
      ...(selectedIndicator && locationSearchValue && { location: `${selectedIndicator.value}:${locationSearchValue}` }),
    });

    fetch(`${baseUrl}/api/item?${params}`,
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
            setCount(data.data.total);
          })
        }
      })
      .catch((error) => {
        console.error('Error fetching item data:', error);
        toast.error('Failed to fetch items');
      });
  };

  const handleEdititem = (id: number) => {
    setitemID(id)
    handleOpen()
  }

  const handleDeleteitem = (id: number) => {
    Swal.fire({
      title: 'please confirm',
      text: 'Are you sure you want to delete the item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.isConfirmed) {
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
    })
  }

  const handleRemoveEngineer = (id: number) => {
    Swal.fire({
      title: 'please confirm',
      text: 'Are you sure you want to return the item?',
      input: 'select',
      inputPlaceholder: "Select where to return the item",
      inputOptions: storage.reduce<Record<string, string>>((acc, { id, name }) => {
        acc[id] = name;
        return acc;
      }, {}),
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value != "") {
            resolve();
          } else {
            resolve("You need to select where to return the item");
          }
        });
      },
      preConfirm: () => {
        // Get the selected value from the select element
        const selectedOption = Swal.getInput()?.value as string;
        return selectedOption;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const selectedOption = result.value as string;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/engineer/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authClient.getToken()}`
          },
          body: JSON.stringify({
            engineer_id: null,
            storage_id: parseInt(selectedOption)
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
    });
  }

  const handleLocationSearch = () => {
    fetchitemData();
  }

  React.useEffect(() => {
    fetchitemData();
  }, [page, rowsPerPage, searchFilters, categoryFilter, conditionFilter, typeFilter, statusFilter, selectedIndicator, locationSearchValue])

  useOnMount(() => {
    GetStorage()
    fetchCategories()
    fetchStatusOptions()
    setLocationIndicators([
      { label: 'Engineer', value: 'engineer' },
      { label: 'Shop', value: 'shop' },
      { label: 'Storage', value: 'storage' },
    ])
  })
  const HandleModalAddData = () => {
    handleOpen()
  }

  const handleModalClose = () => {
    setOpen(false)
    setitemID(0)
  }

  const location = (row: item) => {
    //if status is reuturn, spare, or replace, return location
    var location = row.status === "return" || row.status === "spare" || row.status === "replace" ? row.shop_number : row.engineer?.name ? row.engineer.name + "-" + row.engineer.node.name : row.storage?.name
    return location
  }

  const switchStatusColor = (status: string) => {
    switch (status) {
      case 'repair':
        return 'error';
      case 'replace':
        return 'success';
      case 'in_stock':
        return 'info';
      default:
        return 'warning';
    }
  }

  return (
    <>
      <EngineerSelectionModal open={eopen} handleClose={handleEClose} itemID={itemID} fetchitemData={fetchitemData} />
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
              onChange={handleSearchChange}
              sx={{ maxWidth: '300px', height: '40px' }}
            />
            <Box sx={{ minWidth: 120 }}>
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.name}
                value={categories.find(cat => cat.id === categoryFilter) || null}
                onChange={(_, newValue) => setCategoryFilter(newValue ? newValue.id : 0)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Category"
                    size="small"
                    sx={{ height: '40px' }}
                  />
                )}
                size="small"
              />
            </Box>
            <TextField
              select
              size="small"
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              sx={{ width: '120px', height: '40px' }}
              SelectProps={{ native: true }}
            >
              <option value="">Condition</option>
              <option value="good">Good</option>
              <option value="broken">Broken</option>
            </TextField>
            <TextField
              select
              size="small"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ width: '120px', height: '40px' }}
              SelectProps={{ native: true }}
            >
              <option value="">Type</option>
              <option value="spare">Spare</option>
              <option value="brand">Brand</option>
              <option value="replacement">Replacement</option>
            </TextField>
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ width: '120px', height: '40px' }}
              SelectProps={{ native: true }}
            >
              <option value="">Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </TextField>
            <Button color="inherit" startIcon={<Refresh />} sx={{ bgcolor: '#f6f9fc' }} onClick={fetchitemData}>
              refresh
            </Button>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Autocomplete
              options={locationIndicators}
              getOptionLabel={(option) => option.label}
              value={selectedIndicator}
              onChange={(event, newValue) => setSelectedIndicator(newValue)}
              renderInput={(params) => <TextField {...params} label="Location Indicator" variant="outlined" />}
              sx={{ width: 150 }}
            />
            <TextField
              label="Location search"
              variant="outlined"
              value={locationSearchValue}
              onChange={(e) => setLocationSearchValue(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleLocationSearch}
              disabled={!selectedIndicator || !locationSearchValue}
            >
              Search
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
                <TableCell>incident number</TableCell>
                <TableCell>location</TableCell>
                <TableCell>waranty expiry date</TableCell>
                <TableCell>status</TableCell>
                <TableCell>condition</TableCell>
                <TableCell>type</TableCell>
                <TableCell sx={{ minWidth: '50px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  remark
                </TableCell>
                {/* <TableCell>Created at</TableCell> */}
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
                    <TableCell>{(row.status != "in_stock" ? row.inc_number : "")}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          border: '1px solid',
                          borderColor: 'primary.main',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          display: 'inline-block',
                          backgroundColor: 'background.paper'
                        }}
                      >
                        {location(row)}
                      </Box>
                    </TableCell>
                    <TableCell>{row.warranty_expiry_date ? dayjs(row.warranty_expiry_date).format('MMM D, YYYY') : 'ไม่ระบุ'}</TableCell>
                    {/* status color replace as green repair as red */}
                    <TableCell><Badge badgeContent={row.status} color={switchStatusColor(row.status)} /></TableCell>
                    {/* <TableCell>{dayjs(row.created_at).format('MMM D, YYYY')}</TableCell> */}
                    <TableCell sx={{ textAlign: 'center' }}><Badge badgeContent={row.condition} color={row.condition === 'good' ? 'success' : 'warning'} /></TableCell>
                    <TableCell sx={{ textAlign: 'center' }}><Badge badgeContent={row.item_type} color={row.item_type === 'replacement' || row.item_type === 'spare' ? 'success' : 'error'} /></TableCell>
                    <TableCell
                      sx={{
                        maxWidth: '150px',
                        overflow: 'auto', // Allows scrolling
                        whiteSpace: 'nowrap', // Keeps text in one line
                        textOverflow: 'ellipsis' // Adds "..." for truncated text
                      }}
                    >
                      {row.Remark}
                    </TableCell>
                    <TableCell>
                      <IconButton color='warning' onClick={() => handleEdititem(row.id)}>
                        <Edit />
                      </IconButton>
                      {row.engineers_id === null || row.engineers_id === 0 ? <IconButton color='primary' onClick={() => handleEOpen(row.id)}>
                        <PersonAddAlt1Outlined />
                      </IconButton> : <IconButton color='error' onClick={() => handleRemoveEngineer(row.id)}>
                        <PersonRemoveAlt1Outlined />
                      </IconButton>}
                      {userData?.role === "Admin" || userData?.role === "SuperAdmin" ? <IconButton color='error' onClick={() => handleDeleteitem(row.id)}> <Delete /> </IconButton> : null}
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
