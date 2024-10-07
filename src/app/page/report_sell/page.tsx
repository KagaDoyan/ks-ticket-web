import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import { config } from '@/config';
import { SellReportPage } from '@/components/dashboard/report_sell/report_page';

export const metadata = { title: `Report | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
    return (
        <Stack spacing={3}>
            <SellReportPage />
        </Stack>
    );
}