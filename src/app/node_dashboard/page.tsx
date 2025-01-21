
import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import { NodeDashboardPage } from '@/components/dashboard/node_dashboard/node-dashboard-page';
import { config } from '@/config';

export const metadata = { title: `Customers | Dashboard | ${config.site.name}` } satisfies Metadata;
export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <NodeDashboardPage />
    </Stack>
  );
}
