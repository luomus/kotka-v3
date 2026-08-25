import { Person } from '@luomus/laji-schema';

declare module 'express' {
  interface Request {
    user?: {
      profile: Person,
      personToken: string;
    }
  }
}
