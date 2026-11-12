export interface User {
  id: string;
  name: string;
  phone: string;
  username: string;
  avatarColor: string;
  online: boolean;
  lastSeenAt: number;
}

export interface Contact extends User {
  blocked: boolean;
  starred: boolean;
}

export type AuthMethod = 'phone' | 'username';

export interface AuthSession {
  id: string;
  method: AuthMethod;
  identifier: string;
  signedInAt: number;
}
