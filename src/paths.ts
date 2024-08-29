import { custom } from "zod";

export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    users: '/page/users',
    report: '/page/report',
    ticket: '/page/ticket',
    customer: '/page/customer',
    shop: '/page/shop',
    brand: '/page/brand',
    category: '/page/category',
    model: '/page/model',
    engineer: '/page/engineer',
    item: '/page/item',
    move_item: '/page/move-item',
    province: '/page/province',
    priorities: '/page/priorities',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
