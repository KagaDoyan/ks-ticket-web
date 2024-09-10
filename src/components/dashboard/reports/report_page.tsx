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
import { Button, IconButton, InputAdornment, OutlinedInput, Tab, Tabs } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { toast } from 'react-toastify';
import { Delete, Edit, Refresh } from '@mui/icons-material';
import { authClient } from '@/lib/auth/client';
import MAReportPage from './report_pages/MA';
import BrokenPartReportPage from './report_pages/Broken';
import InventoryReportPage from './report_pages/Inventory';

export function ReportPage(): React.JSX.Element {
  const [active_tabs, setValue] = React.useState("MA");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  return (
    <>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h5">{active_tabs} Report</Typography>
        </Stack>
      </Stack>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={active_tabs} onChange={handleChange} aria-label="report">
          <Tab value="MA" label="MA Report" />
          <Tab value="Inventory" label="Inventory Report" />
          <Tab value="BrokenPart" label="Broken Part Report" />
        </Tabs>
        {active_tabs === "MA" && (
          <>
            <MAReportPage />
          </>
        )}
        {active_tabs === "Inventory" && (
          <>
            <InventoryReportPage />
          </>
        )}
        {active_tabs === "BrokenPart" && (
          <>
            <BrokenPartReportPage />
          </>
        )}
      </Box>
    </>
  );
}
