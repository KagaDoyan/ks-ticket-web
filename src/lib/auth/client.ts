'use client';

import type { User } from '@/types/user';
import { log } from 'console';
import { use } from 'react';

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  fullname: 'Sofia',
  email: 'sofia@devias.io',
  role: "",
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3030';

class AuthClient {

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;
    try {
      const response = await fetch(`${baseUrl}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // If the response status is not in the range 200-299
        const errorData = await response.json();
        return { error: errorData.message || 'Invalid credentials' };
      }

      const data = await response.json();
      let token = null;
      if (data.status === "success") {
        token = data.data.data.access_token;
      }

      if (token) {
        if (typeof token === 'string') {
          localStorage.setItem('custom-auth-token', token);
          fetch(`${baseUrl}/api/user/whoami`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.data) {
                localStorage.setItem('user_info', JSON.stringify(data.data));
              }
          })
        }
      } else {
        return { error: 'No token received' };
      }

      return {};
    } catch (error) {
      return { error: `An error occurred during login` };
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {

    // We do not handle the API, so just check if we have a token in localStorage.
    const token = this.getToken();
    if (!token) {
      return { data: null };
    }
    return { data: user };
  }

  getToken() {
    return localStorage.getItem('custom-auth-token');
  }

  UserInfo() {
    return user;
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user_info');
    return {};
  }
}

export const authClient = new AuthClient();
