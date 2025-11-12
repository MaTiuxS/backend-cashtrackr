import type { Request, Response } from "express";
import Budget from "../models/Budget";
import Expense from "../models/Expense";

export class BudgetController {
  static getAll = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        const error = new Error("El usuario no esta disponible");
        return res.status(404).json({ error: error.message });
      }
      const budgets = await Budget.findAll({
        order: [["createdAt", "DESC"]],
        where: {
          userId: req.user.id,
        },
      });
      return res.status(200).json(budgets);
    } catch (error) {
      // console.log(error)
      return res
        .status(500)
        .json({ error: "Hubo un error al listar los budget" });
    }
  };

  static create = async (req: Request, res: Response) => {
    try {
      const bugdet = await Budget.create(req.body);
      if (!req.user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }
      bugdet.userId = req.user.id;

      await bugdet.save();
      return res.status(201).json("Presupuesto creado correctamente");
    } catch (error) {
      // console.log(error);
      return res.status(500).json({ error: "Hubo un error al crear" });
    }
  };

  static getById = async (req: Request, res: Response) => {
    if (!req.budget) return res.status(404).json("Presupuesto no encontrado");
    const budget = await Budget.findByPk(req.budget.id, {
      include: [Expense],
    });
    return res.status(200).json(budget);
  };

  static updated = async (req: Request, res: Response) => {
    if (!req.budget) return res.status(404).json("Presupuesto no encontrado");
    await req.budget.update(req.body);
    return res.status(200).json("Presupuesto actualizado correctamente");
  };

  static delete = async (req: Request, res: Response) => {
    if (!req.budget) return res.status(404).json("Presupuesto no encontrado");
    await req.budget.destroy();
    return res.json("Presupuesto eliminado correctamente");
  };
}
