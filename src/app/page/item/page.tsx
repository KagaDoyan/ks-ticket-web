
import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import { config } from '@/config';
import { ItemPage } from '@/components/dashboard/item/item_page';

export const metadata = { title: `Customers | Dashboard | ${config.site.name}` } satisfies Metadata;
export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <ItemPage />
    </Stack>
  );
}
