import type { RequestHandler } from "express";
import { prisma } from "../config/prisma";

export const getRandomQuestion: RequestHandler = async (req, res, next) => {
  try {
    const role = String(req.query.role ?? "").toUpperCase();
    const type = String(req.query.type ?? "").toLowerCase();

    if (!role || !type) {
      res.status(400).json({
        error: "role and type query params are required"
      });
      return;
    }

    const where = {
      role,
      type,
      isActive: true
    };

    const count = await prisma.question.count({ where });

    if (count === 0) {
      res.status(404).json({
        error: "no questions found"
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * count);

    const question = await prisma.question.findFirst({
      where,
      skip: randomIndex,
      select: {
        id: true,
        prompt: true
      }
    });

    if (!question) {
      res.status(404).json({
        error: "no questions found"
      });
      return;
    }

    res.json({
      id: question.id,
      question_text: question.prompt
    });
  } catch (error) {
    next(error);
  }
};