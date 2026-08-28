import type { IUser } from "./types";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};