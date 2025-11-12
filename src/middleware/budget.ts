import { Request, Response, NextFunction } from "express";
import Budget from "../models/Budget";

declare global {
  namespace Express {
    interface Request {
      budget?: Budget;
    }
  }
}

export const validateBudgetExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { budgetId } = req.params;
    const budget = await Budget.findByPk(budgetId);
    if (!budget)
      return res.status(404).json({ error: "Presupuesto no encontrado" });

    req.budget = budget;

    next();
    return;
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ error: "Hubo un error en el presupuesto" });
  }
};

export const hashAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.budget!.userId !== req.user!.id) {
    const error = new Error("Accion no valida");
    return res.status(401).json({ error: error.message });
  }
  return next();
};
