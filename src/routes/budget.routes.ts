import { BudgetController } from "../controllers/Budget.controller";
import { Router } from "express";
import {
  createBudgetRules,
  deleteBudgetParam,
  listBudgetRules,
  updatedBudgetRules,
} from "../validator/budget.validator";
import { validate } from "../middleware/validation";

import { hashAccess, validateBudgetExists } from "../middleware/budget";
import { authenticate } from "../middleware/auth";

const router: Router = Router();
router.use(authenticate);

router.get("/", BudgetController.getAll);
router.post("/", validate(createBudgetRules), BudgetController.create);

router.get(
  "/:budgetId",
  validate(listBudgetRules),
  validateBudgetExists,
  hashAccess,
  BudgetController.getById
);
router.put(
  "/:budgetId",
  validate(updatedBudgetRules),
  validateBudgetExists,
  hashAccess,
  BudgetController.updated
);
router.delete(
  "/:budgetId",
  validate(deleteBudgetParam),
  validateBudgetExists,
  hashAccess,
  BudgetController.delete
);

export default router;
