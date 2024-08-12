export interface User {
  id: string;
  fullname?: string;
  avatar?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}
