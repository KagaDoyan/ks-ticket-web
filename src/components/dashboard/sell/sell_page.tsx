'use client';

import { useState } from "react";
import SellModalForm from "./modal/sell_modal";
import { Box, Button, Card, Divider, IconButton, InputAdornment, OutlinedInput, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Delete, Edit, Key, Refresh } from "@mui/icons-material";
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { authClient } from "@/lib/auth/client";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import React from "react";
import useOnMount from "@mui/utils/useOnMount";

export function SellPage(): React.JSX.Element {

    const [search, setSearch] = useState("");
    const [SellID, setSellID] = useState(0);
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [count, setCount] = useState(0);

    const handleClose = () => {
        setSellID(0);
        setOpen(false);
    };

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

    const handleEditSell = (id: number) => {
        setSellID(id);
        setOpen(true);
    }
    const fetchSellData = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory?page=${page}&limit=${rowsPerPage}&search=${search}`,
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
                toast.error("Failed to fetch sell data");
            });
    }

    const HandleModalAddData = () => {
        setOpen(true)
    }

    const handleDeleteSell = (id: number) => {
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
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authClient.getToken()}`
                    }  
                }).then((res) => {
                    if (res.ok) {
                        fetchSellData();
                        toast.success("Sell deleted successfully");
                    } else {
                        throw new Error("Failed to delete sell");
                    }
                }).catch((err) => {
                    toast.error("Failed to delete sell");
                });
            }
        })
    }

    useOnMount(() => {
        fetchSellData();
    })
    
    return (
        <>
            <SellModalForm open={open} handleClose={handleClose} SellID={SellID} fetchsellData={fetchSellData} />
            <Stack direction="row" spacing={3}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                    <Typography variant="h5">Sell</Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <OutlinedInput
                            defaultValue=""
                            fullWidth
                            placeholder="Search user"
                            startAdornment={
                                <InputAdornment position="start">
                                    <MagnifyingGlass fontSize="12px" />
                                </InputAdornment>
                            }
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ maxWidth: '300px', height: '40px' }}
                        />
                        <Button color="inherit" startIcon={<Refresh />} sx={{ bgcolor: '#f6f9fc' }} onClick={fetchSellData}>
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
                                <TableCell>brand</TableCell>
                                <TableCell>model</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>warranty</TableCell>
                                <TableCell>sell date</TableCell>
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
                                                <Typography variant="subtitle2">{row.brand}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{row.model}</TableCell>
                                        <TableCell>{row.buyer_name}</TableCell>
                                        <TableCell>{dayjs(row.warranty_expire_date).format('DD-MM-YYYY')}</TableCell>
                                        <TableCell>{dayjs(row.sell_date).format('DD-MM-YYYY')}</TableCell>
                                        <TableCell>{dayjs(row.created_at).format('DD-MM-YYYY')}</TableCell>
                                        <TableCell>
                                            <IconButton color='warning' onClick={() => handleEditSell(row.id)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton color='error' onClick={() => handleDeleteSell(row.id)}>
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