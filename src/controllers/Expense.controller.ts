import type { Request, Response } from "express";
import Expense from "../models/Expense";
import Budget from "../models/Budget";

// import Expense from "../models/Expense";

export class ExpenseController {
  static getAll = async (req: Request, res: Response) => {
    try {
      req;
      const expenses = await Expense.findAll({
        attributes: ["id", "name", "amount", "createdAt", "updatedAt"],
        order: [["createdAt", "DESC"]],
        // TODO: Filtrar por el gasto autenticado
        include: {
          model: Budget,
          attributes: ["name"],
        },
      });
      return res.status(201).json(expenses);
    } catch (error) {
      // console.log(error);
      return res.status(500).json("Error al listar los gastos");
    }
  };

  static create = async (req: Request, res: Response) => {
    if (!req.budget) return res.status(404).json("Presupuesto no encontrado");
    try {
      const expenses = await Expense.create(req.body);
      expenses.budgetId = req.budget.id;
      expenses.save();
      return res.status(201).json("Gasto agregado correctamente");
    } catch (error) {
      //   console.log(error);
      return res.status(500).json({ error: "Hubo un error al crear el gasto" });
    }
  };

  static getById = async (req: Request, res: Response) => {
    if (!req.expense) return res.status(404).json("Gasto no encontrado");
    return res.status(201).json(req.expense);
  };

  static updateById = async (req: Request, res: Response) => {
    if (!req.expense) return res.status(404).json("Gasto no encontrado");
    await req.expense.update(req.body);
    return res.status(201).json("Pago actualizado correctamente");
  };

  static deleteById = async (req: Request, res: Response) => {
    if (!req.expense) return res.status(404).json("Gasto no encontrado");
    await req.expense.destroy();
    return res.status(201).json("Pago eliminado correctamente");
  };
}
