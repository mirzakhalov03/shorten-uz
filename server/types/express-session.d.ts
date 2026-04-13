import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      email: string;
      passwordHash: string;
      fullName: string | null;
    };
  }
}
