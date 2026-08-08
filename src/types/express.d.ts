export interface UserPayload {
  id: string;
  email: string;
  role: 'super_admin' | 'hr_manager' | 'employee';
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
