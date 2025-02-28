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
    storage: '/page/storage',
    node: '/page/node',
    sell: '/page/sell',
    report_sell: '/page/report_sell',
    team: '/page/team',
    email: '/page/email',
    mail_signature: '/page/mail_signature',
    mailer: '/page/mailer',
    node_dashboard: '/node_dashboard',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
