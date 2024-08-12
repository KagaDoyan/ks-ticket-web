
import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import { PriorityGroupPage } from '@/components/dashboard/priority_group/priority-group-page';
import { config } from '@/config';

export const metadata = { title: `Customers | Dashboard | ${config.site.name}` } satisfies Metadata;
export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <PriorityGroupPage />
    </Stack>
  );
}
