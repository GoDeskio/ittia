import { Request } from 'express';

export interface AuthRequest extends Omit<Request, 'user'> {
  user?: {
    id: string;
    email: string;
    role: string;
  };
} 