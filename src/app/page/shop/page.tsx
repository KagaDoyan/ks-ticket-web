
import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import { config } from '@/config';
import { ShopPage } from '@/components/dashboard/shop/shop_page';

export const metadata = { title: `Shop | ${config.site.name}` } satisfies Metadata;
export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <ShopPage />
    </Stack>
  );
}
