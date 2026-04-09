import { NextFunction, Request, Response } from "express";
import { getErrorMessage, sendError } from "../services/error-response";

export const notFoundHandler = (req: Request, res: Response) => {
  sendError(res, 404, "The requested endpoint was not found.", {
    devMessage: `No route matched ${req.method} ${req.originalUrl}`,
    code: "NOT_FOUND",
  });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  sendError(res, 500, "Something went wrong. Please try again later.", {
    devMessage: getErrorMessage(err),
    code: "INTERNAL_ERROR",
  });
};