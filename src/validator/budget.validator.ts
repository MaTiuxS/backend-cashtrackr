import { body, param } from "express-validator";

export const createBudgetRules = [
  body("name")
    .notEmpty()
    .withMessage("El nombre no puede ir vacio")
    .trim()
    .toLowerCase()
    .escape(),

  body("amount")
    .notEmpty()
    .withMessage("La cantidad no puede ir vacio")
    .isNumeric()
    .withMessage("Cantidad no valida")
    .isInt({ min: 1 })
    .withMessage("La cantidad debe ser mayor a 0"),
];

export const listBudgetRules = [
  param("budgetId").isInt({ gt: 0 }).toInt().withMessage("El ID es invalido"),
];

export const updatedBudgetRules = [
  param("budgetId").isInt({ gt: 0 }).toInt().withMessage("El ID es invalido"),
  ...createBudgetRules,
];

export const deleteBudgetParam = [
  param("budgetId").isInt({ gt: 0 }).toInt().withMessage("El ID es invalido"),
];
