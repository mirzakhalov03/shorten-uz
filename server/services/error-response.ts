import { Response } from "express";

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