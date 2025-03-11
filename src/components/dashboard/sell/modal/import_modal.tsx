import React, { useState, useRef } from 'react';
import { Button, Modal, Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Stack } from '@mui/material';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { authClient } from '@/lib/auth/client';
import dayjs from 'dayjs';


const excelBaseDate = dayjs('1900-01-01');

// Function to convert Excel date numbers to formatted date strings
function formatExcelDate(excelNumber: number): string {
    const daysOffset = excelNumber - 2; // Adjust for Excel's leap year bug
    return excelBaseDate.add(daysOffset, 'day').format('DD-MM-YYYY'); // Customize format
}

interface ImportModalProps {
    open: boolean;
    onClose: () => void;
    fetchSellData: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ open, onClose, fetchSellData }) => {
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        p: 4,
        borderRadius: 1,
        boxShadow: 24,
    };

    const [sheetData, setSheetData] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                const validData: Array<{ brand: string; model: string; serial: string; warranty: string; sell_date: string; buyer_name: string; sell_price: number; base_price: number }> = [];
                const invalidData: any[] = [];
                jsonData.forEach((row: any) => {
                    if (row.brand && row.model && row.serial && row.warranty && row.sell_date && row.buyer_name && row.sell_price != null && row.base_price != null) {
                        validData.push({
                            brand: row.brand,
                            model: row.model,
                            serial: row.serial,
                            warranty: formatExcelDate(row.warranty), // Format warranty date
                            sell_date: formatExcelDate(row.sell_date), // Format sell date
                            buyer_name: row.buyer_name,
                            sell_price: row.sell_price,
                            base_price: row.base_price,
                        });
                    } else {
                        invalidData.push(row);
                    }
                });
                if (invalidData.length > 0) {
                    toast.warn('Some rows have invalid data and were not imported');
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                }

                setSheetData(validData);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleClear = () => {
        setSheetData([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const submitData = async () => {
        const formattedData = sheetData.map((element) => ({
            ...element,
            sell_date: dayjs(element.sell_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
            warranty: dayjs(element.warranty, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        }));

        const results = await Promise.all(formattedData.map((element) =>
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authClient.getToken()}`,
                },
                body: JSON.stringify(element),
            })
                .then((res) => res.ok)
                .catch(() => false)
        ));

        const successCount = results.filter((success) => success).length;
        const failCount = results.length - successCount;
        toast.success(`Imported ${successCount} successfully, ${failCount} failed`);

        setSheetData(sheetData.filter((_, index) => !results[index]));
        fetchSellData();
        if (failCount === 0) {
            onClose();
        }
    };

    return (
        <Modal open={open} onClose={onClose} >
            <Box sx={modalStyle}>
                <Typography variant="h6" component="h2">
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} ref={fileInputRef} />
                </Typography>
                {sheetData.length > 0 && (
                    <Table>
                        <TableHead>
                            <TableRow>
                                {Object.keys(sheetData[0]).map((key) => (
                                    <TableCell key={key}>{key}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sheetData.map((row, index) => (
                                <TableRow key={index}>
                                    {Object.values(row).map((value, idx) => (
                                        <TableCell key={idx}>{value as React.ReactNode}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={submitData}>Submit</Button>
                    <Button onClick={handleClear} variant='contained' color='error'>Clear</Button>
                </Stack>
            </Box>
        </Modal >
    );
};

export default ImportModal;