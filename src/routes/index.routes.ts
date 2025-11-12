import { Router } from "express";
import budgetRoutes from "./budget.routes";
import expenseRoutes from "./expense.routes";
import userRoutes from "./user.routes";

const router: Router = Router();

router.use("/budgets", budgetRoutes);
router.use("/budgets/:budgetId/expenses", expenseRoutes);
router.use("/auth", userRoutes);

export default router;
