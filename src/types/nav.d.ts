export interface NavItemConfig {
  key: string;
  title?: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  icon?: React.ElementType;
  href?: string;
  items?: NavItemConfig[];
  matcher?: { type: 'startsWith' | 'equals'; href: string };
  group?: string; // Added property for grouping
}
