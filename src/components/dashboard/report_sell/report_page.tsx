'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MAReportPage from './report_pages/MA';
import { Tab, Tabs } from '@mui/material';

export function SellReportPage(): React.JSX.Element {
  const [active_tabs, setValue] = React.useState("Sell");

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
          <Tab value="Sell" label="Sell Report" />
        </Tabs>
        {active_tabs === "Sell" && (
          <>
            <MAReportPage />
          </>
        )}
      </Box>
    </>
  );
}
