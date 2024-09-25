import React, { useEffect, useState } from 'react';
import { Modal, Box, List, ListItem, ListItemButton, ListItemText, TextField, Pagination } from '@mui/material';
import { authClient } from '@/lib/auth/client';
import useOnMount from '@mui/utils/useOnMount';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

interface engineer {
    id: number;
    name: string;
    lastname: string;
}

const ITEMS_PER_PAGE = 5;

function EngineerSelectionModal({ open, handleClose, itemID,fetchitemData }: { open: boolean, handleClose: () => void, itemID: number ,fetchitemData: () => void }) {
    const [selectedItem, setSelectedItem] = useState<engineer | null>(null);
    const [total_pages, setTotalPages] = useState<number>(0);
    const [engineers, setengineers] = useState<engineer[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);

    const handleItemSelect = (engineer: engineer) => {
        Swal.fire({
            title: 'please confirm',
            text: 'Are you sure you want to assign this engineer to this item?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/item/engineer/${itemID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authClient.getToken()}`
                    },
                    body: JSON.stringify({
                        engineer_id: engineer.id
                    })
                }).then((res) => {
                    if (res.ok) {
                        fetchitemData();
                        toast.success("Engineer assigned successfully");
                        handleClose();
                    }
                })
            }
        })
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };

    const fetchEngineer = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/engineer/?limit=${ITEMS_PER_PAGE}&page=${currentPage}&search=${searchTerm}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authClient.getToken()}`
            }
        }).then((res) => {
            if (res.ok) {
                res.json().then((data) => {
                    setTotalPages(data.data.total_page);
                    setengineers(data.data.data);                    
                })
            }
        }).catch((err) => {
            toast.error("Failed to fetch engineer data");
        })
    }

    useEffect(() => {
        fetchEngineer()
    }, [currentPage, searchTerm, itemID])

    // useOnMount(() => {
    //     fetchEngineer()
    // })

    return (
        <Modal open={open} onClose={handleClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: {
                        xs: '90%', // Mobile
                        sm: '80%', // Tablet
                        md: '60%', // Small desktop
                        lg: '60%', // Large desktop
                    },
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search engineer..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ mb: 2 }}
                />
                <List>
                    {engineers.length > 0 ? (
                        engineers.map((item) => (
                            <ListItem key={item.id} disablePadding>
                                <ListItemButton onClick={() => handleItemSelect(item)}>
                                    <ListItemText primary={item.name + ' ' + item.lastname} />
                                </ListItemButton>
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="No items found" />
                        </ListItem>
                    )}
                </List>
                <Box mt={2} display="flex" justifyContent="center">
                    <Pagination
                        count={total_pages}
                        page={currentPage}
                        onChange={handlePageChange}
                    />
                </Box>
            </Box>
        </Modal>
    );
}

export default EngineerSelectionModal;
