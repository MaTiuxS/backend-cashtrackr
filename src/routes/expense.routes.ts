import { Router } from "express";
import { validate } from "../middleware/validation";
import { listBudgetRules } from "../validator/budget.validator";
import { validateBudgetExists } from "../middleware/budget";
import { ExpenseController } from "../controllers/Expense.controller";
import {
  createExpenseRules,
  deleteExpenseParam,
  listExpenseRules,
  updatedExpenseRules,
} from "../validator/expense.validator";
import { belongsToBudget, validateExpenseExists } from "../middleware/expense";
const router: Router = Router({ mergeParams: true });

router.use(validate(listBudgetRules));
router.use(validateBudgetExists);
// Routes for expense
router.get("/", ExpenseController.getAll);
router.post("/", validate(createExpenseRules), ExpenseController.create);
router.get(
  "/:expenseId",
  validate(listExpenseRules),
  validateExpenseExists,
  belongsToBudget,
  ExpenseController.getById
);
router.put(
  "/:expenseId",
  validate(updatedExpenseRules),
  validateExpenseExists,
  belongsToBudget,
  ExpenseController.updateById
);
router.delete(
  "/:expenseId",
  validate(deleteExpenseParam),
  validateExpenseExists,
  belongsToBudget,
  ExpenseController.deleteById
);

export default router;
