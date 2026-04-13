import { Response } from "express";
import { AppError } from "./app-error";

interface SendErrorOptions {
  devMessage?: string;
  code?: string;
}

const isProduction = process.env.NODE_ENV === "production";

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown server error";
};

export const sendError = (
  res: Response,
  statusCode: number,
  userMessage: string,
  options: SendErrorOptions = {}
) => {
  const payload: {
    success: false;
    error: string;
    message: string;
    code?: string;
    devMessage?: string;
  } = {
    success: false,
    error: userMessage,
    message: userMessage,
  };

  if (options.code) {
    payload.code = options.code;
  }

  if (!isProduction && options.devMessage) {
    payload.devMessage = options.devMessage;
  }

  return res.status(statusCode).json(payload);
};

export const sendCaughtError = (
  res: Response,
  error: unknown,
  fallbackUserMessage: string
) => {
  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.message, {
      code: error.code,
      devMessage: error.devMessage,
    });
  }

  console.error(error);
  return sendError(res, 500, fallbackUserMessage, {
    devMessage: getErrorMessage(error),
    code: "INTERNAL_ERROR",
  });
};