
import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import { config } from '@/config';
import { TicketPage } from '@/components/dashboard/tickets/ticket_page';

export const metadata = { title: `Ticket | ${config.site.name}` } satisfies Metadata;
export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <TicketPage/>
    </Stack>
  );
}
