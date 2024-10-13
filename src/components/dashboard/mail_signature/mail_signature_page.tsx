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
import { Button, IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { toast } from 'react-toastify';
import { Delete, Edit, Refresh } from '@mui/icons-material';
import { authClient } from '@/lib/auth/client';
import Swal from 'sweetalert2';
import EmailSignatureModalForm from './modal/mail_signaute_modal';

function noop(): void {
    // do nothing
}

export interface email {
    id: number;
    customers_id: number;
    customer: {
        id: number;
        shortname: string;
        fullname: string;
    }
    signature_body: string;
    image?: string;
    upload_image?: File | null;
}

export function EmailSignaturePage(): React.JSX.Element {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [rows, setRows] = React.useState<email[]>([]);
    const [search, setSearch] = React.useState<string>('');
    const [count, setCount] = React.useState(0);
    const [emailID, setemailID] = React.useState(0);

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

    const fetchbrandData = async () => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';
        fetch(`${baseUrl}/api/mail_signature?page=${page + 1}&limit=${rowsPerPage}&search=${search}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authClient.getToken()}`
                }
            })
            .then((res) => {
                if (res.ok) {
                    res.json().then((data) => {
                        console.log(data.data.data);
                        
                        setRows(data.data.data);
                        setCount(data.data.total_rows);
                    })
                }
            }).catch((err) => {
                // throw new Error(err);
                toast.error("Failed to fetch signature data");
            });
    }

    const handleEditbrand = (id: number) => {
        setemailID(id)
        handleOpen()
    }

    const handleDeletebrand = (id: number) => {
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
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mail_signature/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authClient.getToken()}`
                    }
                }).then((res) => {
                    if (res.ok) {
                        fetchbrandData();
                        toast.success("email signature deleted successfully");
                    } else {
                        throw new Error("Failed to delete email signature");
                    }
                }).catch((err) => {
                    toast.error("Failed to delete email signature");
                });
            }
        })
    }

    React.useEffect(() => {
        fetchbrandData();
    }, [page, rowsPerPage, search])

    const HandleModalAddData = () => {
        handleOpen()
    }

    const handleModalClose = () => {
        setOpen(false)
        setemailID(0)
    }

    return (
        <>
            <EmailSignatureModalForm open={open} handleClose={handleModalClose} emailID={emailID} fetchbrandData={fetchbrandData} />
            <Stack direction="row" spacing={3}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h5">Email Signature</Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <OutlinedInput
                            defaultValue=""
                            fullWidth
                            placeholder="Search brand"
                            startAdornment={
                                <InputAdornment position="start">
                                    <MagnifyingGlassIcon fontSize="12px" />
                                </InputAdornment>
                            }
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ maxWidth: '300px', height: '40px' }}
                        />
                        <Button color="inherit" startIcon={<Refresh />} sx={{ bgcolor: '#f6f9fc' }} onClick={fetchbrandData}>
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
                                <TableCell>customer</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length > 0 ? rows.map((row) => {
                                return (
                                    <TableRow hover key={row.id}>
                                        <TableCell>{row.customer?.shortname}</TableCell>
                                        <TableCell>
                                            <IconButton color='warning' onClick={() => handleEditbrand(row.id)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton color='error' onClick={() => handleDeletebrand(row.id)}>
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
