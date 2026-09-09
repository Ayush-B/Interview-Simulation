import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";

import { prisma } from "../config/prisma";

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    { userId },
    secret,
    { expiresIn: "7d" }
  );
}

export const signup: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({
        error: "email and password are required",
      });
      return;
    }

    if (String(password).length < 8) {
      res.status(400).json({
        error: "password must be at least 8 characters",
      });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      res.status(409).json({
        error: "email already in use",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    });

    const token = signToken(user.id);

    res.status(201).json({
      token,
      user,
    });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };

    if (prismaError.code === "P2002") {
      res.status(409).json({
        error: "email already in use",
      });
      return;
    }

    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({
        error: "email and password are required",
      });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      res.status(401).json({
        error: "invalid credentials",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      res.status(401).json({
        error: "invalid credentials",
      });
      return;
    }

    const token = signToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};