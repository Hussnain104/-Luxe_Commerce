import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../src/types.ts';
import { db } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'luxe_commerce_jwt_secret_dev_key_2026_super_secure';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role_slug: user.role_slug,
      first_name: user.first_name,
      last_name: user.last_name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // continue as guest
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return next(); // invalid token, continue as guest
    }
    const user = db.users.find((u) => u.id === decoded.id);
    if (user && user.is_active) {
      req.user = user;
    }
    next();
  });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role_slug)) {
      return res.status(403).json({ success: false, message: 'Insufficient authorization permissions' });
    }
    next();
  };
}
