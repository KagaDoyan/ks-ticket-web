'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { navItems } from '../../../sidenav-item';
import { isNavItemActive } from '@/lib/is-nav-item-active';

// Style constants
const styles = {
  sideNav: {
    '--SideNav-background': 'var(--mui-palette-neutral-950)',
    '--SideNav-color': 'var(--mui-palette-common-white)',
    '--NavItem-color': 'var(--mui-palette-neutral-300)',
    '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
    '--NavItem-active-background': 'rgb(255, 163, 71)',
    '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
    '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
    '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
    '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
    '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
    bgcolor: '#ffffff',
    color: 'white',
    display: { xs: 'none', lg: 'flex' },
    flexDirection: 'column',
    height: '100%',
    left: 0,
    maxWidth: '100%',
    position: 'fixed',
    scrollbarWidth: 'none',
    top: 0,
    width: 'var(--SideNav-width)',
    zIndex: 'var(--SideNav-zIndex)',
    '&::-webkit-scrollbar': { display: 'none' },
    borderRight: '1px solid var(--mui-palette-divider)',
  },
  logoLink: { display: 'inline-flex' },
  navContent: { flex: '1 1 auto', p: '12px', overflowY: 'scroll' },
  groupTitle: { padding: 1, fontSize: '14px', color: 'var(--mui-palette-neutral-500)' },
  navList: { listStyle: 'none', m: 0, p: 0 },
  navItemBox: (active: boolean, disabled: boolean) => ({
    alignItems: 'center',
    borderRadius: 1,
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    flex: '0 0 auto',
    gap: 1,
    p: '6px 16px',
    position: 'relative',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    ...(disabled && {
      bgcolor: 'var(--NavItem-disabled-background)',
      color: 'white',
      cursor: 'not-allowed',
    }),
    ...(active && { bgcolor: 'var(--NavItem-active-background)', color: 'var(--NavItem-active-color)' }),
  }),
  navItemIcon: (active: boolean) => ({
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    flex: '0 0 auto',
    color: active ? 'white' : 'var(--mui-palette-neutral-500)',
  }),
  navItemText: (active: boolean) => ({
    color: active ? 'white' : 'var(--mui-palette-neutral-500)',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '28px',
  }),
};

const userData = JSON.parse(localStorage.getItem('user_info') || '{}');

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <Box sx={styles.sideNav}>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box component={RouterLink} href={paths.home} sx={styles.logoLink}>
          <img src='/assets/logo.png' alt='logo' height={80} width={250} />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: 'var(--mui-palette-divider)' }} />
      <Box component="nav" sx={styles.navContent}>
        {navItems.map((item) => (
          <React.Fragment key={item.key}>
            {item.group && (
              <>
                <Typography sx={styles.groupTitle}>
                  {item.group}
                </Typography>
              </>
            )}
            {renderNavItems({ items: item.items, pathname })}
          </React.Fragment>
        ))}
      </Box>
      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />
    </Box>
  );
}

function renderNavItems({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
  return (
    <Stack component="ul" spacing={1} sx={styles.navList}>
      {items
        .filter(item => item.role?.includes(userData.role)) // Filter by role
        .map((item) => (
        <NavItem pathname={pathname} {...item} />
      ))}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string;
}

function NavItem({ disabled, external, href, icon, pathname, title }: NavItemProps): React.JSX.Element {
  const active = isNavItemActive(pathname, href);
  const Icon = icon;

  return (
    <li>
      <Box
        {...(href
          ? {
            component: external ? 'a' : RouterLink,
            href,
            target: external ? '_blank' : undefined,
            rel: external ? 'noreferrer' : undefined,
          }
          : { role: 'button' })}
        sx={styles.navItemBox(active, false)}
      >
        <Box sx={styles.navItemIcon(active)}>
          {Icon && <Icon />}
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography component="span" sx={styles.navItemText(active)}>
            {title}
          </Typography>
        </Box>
      </Box>
    </li>
  );
}
