import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminUser } from '../models/adminUser';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AdminAuthRequest extends Request {
  admin?: {
    id: string;
    username: string;
    role: 'god' | 'admin';
  };
}

export const authenticateAdmin = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const admin = await AdminUser.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.admin = {
      id: admin._id,
      username: admin.username,
      role: admin.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireGodMode = (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  if (req.admin?.role !== 'god') {
    return res.status(403).json({ error: 'God mode access required' });
  }
  return next();
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req.user as any)?.id);
    if (!user || !user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Error checking admin privileges' });
  }
}; 