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
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Button, Grid, IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { toast } from 'react-toastify';
import { Delete, Edit, Refresh } from '@mui/icons-material';
import { authClient } from '@/lib/auth/client';

interface priority_group {
    id: number;
    group_name: string;
    priorities: [{
        id: number
        name: string
        time_sec: number
    }]
}

export function PriorityGroupPage(): React.JSX.Element {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = React.useState<priority_group[]>([]);
    const [search, setSearch] = React.useState<string>('');
    const [count, setCount] = React.useState(0);
    const [prioritiesID, setprioritiesID] = React.useState(0);

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

    const fetchprioritiesData = async () => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
        fetch(`${baseUrl}/api/priorityGroup?page=${page + 1}&limit=${rowsPerPage}&search=${search}`,
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
                        setCount(data.total_rows);
                    })
                }
                console.log(rows);
                
            }).catch((err) => {
                // throw new Error(err);
                toast.error("Failed to fetch priorities data");
            });
    }

    const handleEditpriorities = (id: number) => {
        setprioritiesID(id)
        handleOpen()
    }

    const handleDeletepriorities = (id: number) => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/priorities/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        }).then((res) => {
            if (res.ok) {
                fetchprioritiesData();
                toast.success("priorities deleted successfully");
            } else {
                throw new Error("Failed to delete priorities");
            }
        }).catch((err) => {
            toast.error("Failed to delete priorities");
        });
    }

    React.useEffect(() => {
        fetchprioritiesData();
    }, [page, rowsPerPage, search])

    const HandleModalAddData = () => {
        handleOpen()
    }

    const handleModalClose = () => {
        setOpen(false)
        setprioritiesID(0)
    }

    return (
        <>
            <Stack direction="row" spacing={3}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h5">priorities</Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <OutlinedInput
                            defaultValue=""
                            fullWidth
                            placeholder="Search priorities"
                            startAdornment={
                                <InputAdornment position="start">
                                    <MagnifyingGlassIcon fontSize="12px" />
                                </InputAdornment>
                            }
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ maxWidth: '300px', height: '40px' }}
                        />
                        <Button color="inherit" startIcon={<Refresh />} sx={{ bgcolor: '#f6f9fc' }} onClick={fetchprioritiesData}>
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
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Card>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>group name</TableCell>
                                        <TableCell>priorities count</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.length > 0 ? rows.map((row) => {
                                        return (
                                            <TableRow hover key={row.id}>
                                                <TableCell>{row.group_name}</TableCell>
                                                <TableCell>{row.priorities.length}</TableCell>
                                                <TableCell>
                                                    <IconButton color='warning' onClick={() => handleEditpriorities(row.id)}>
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton color='error' onClick={() => handleDeletepriorities(row.id)}>
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) : <TableCell colSpan={2} sx={{ textAlign: 'center' }}>No data</TableCell>}
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
                </Grid>
            </Grid>
        </>
    );
}
