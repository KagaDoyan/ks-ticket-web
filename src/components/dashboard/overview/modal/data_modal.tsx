import React from 'react';
import { Modal, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, Badge } from '@mui/material';

interface DynamicTableModalProps {
    open: boolean;
    handleClose: () => void;
    data: any[];
}

const TableModal: React.FC<DynamicTableModalProps> = ({ open, handleClose, data }) => {
    const modalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: {
            xs: '90%', // 0-600
            sm: '80%', // 600-900
            md: '70%', // 900-1200
            lg: '50%', // 1200-1800
            xl: '40%', // 1800+
        },
        maxHeight: '80vh', // Dynamic height
        bgcolor: 'background.paper',
        p: 4,
        outline: 'none'
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-table-title"
            aria-describedby="modal-table-description"
        >
            <Box sx={modalStyle}>
                <TableContainer component={Card}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Ticket ID</TableCell>
                                <TableCell>Incident No</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Due By</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.ticket_number}</TableCell>
                                    <TableCell>{row.inc_number}</TableCell>
                                    <TableCell><Badge badgeContent={row.ticket_status} color={row.ticket_status === 'close' ? 'success' : 'error'} /></TableCell>
                                    <TableCell>{row.due_by}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Modal>
    );
};

export default TableModal;
