import type { Request, Response } from "express";

export const healthController = (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "Backend Sistem Pakar Padi CBR berjalan",
  });
};
