import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import { config } from '@/config';
import { UserTable } from '@/components/dashboard/users/user-table';
import { StoragePage } from '@/components/dashboard/storages/storage_page';

export const metadata = { title: `Customers | ${config.site.name}` } satisfies Metadata;
export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <StoragePage />
    </Stack>
  );
}
