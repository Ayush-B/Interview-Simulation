import jwt from "jsonwebtoken";

import type {
  NextFunction,
  Request,
  Response,
} from "express";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization ?? "";
  const parts = header.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res.status(401).json({
      error: "Missing or invalid Authorization header",
    });
    return;
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    next(new Error("JWT_SECRET is missing in .env"));
    return;
  }

  try {
    const payload = jwt.verify(token, secret);

    if (
      typeof payload === "string" ||
      typeof payload.userId !== "string"
    ) {
      res.status(401).json({
        error: "Invalid token payload",
      });
      return;
    }

    req.userId = payload.userId;

    next();
  } catch {
    res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}