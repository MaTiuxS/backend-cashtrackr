import { Request, Response, NextFunction } from "express";
import Expense from "../models/Expense";

declare global {
  namespace Express {
    interface Request {
      expense?: Expense;
    }
  }
}

export const validateExpenseExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { expenseId } = req.params;
    const expense = await Expense.findByPk(expenseId);
    if (!expense) return res.status(404).json({ error: "Pago no encontrado" });

    req.expense = expense;
    next();
    return;
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ error: "Hubo un error en el gasto" });
  }
};

export const belongsToBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.budget?.dataValues.id !== req.expense?.budgetId) {
    const error = new Error("Acción no válida");
    return res.status(403).json({ error: error.message });
  }

  next();
  return;
};
