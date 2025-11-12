import { createRequest, createResponse } from "node-mocks-http";
import Expense from "../../../models/Expense";
import { ExpenseController } from "../../../controllers/Expense.controller";
import { expenses } from "../../mocks/expenses";

jest.mock("../../../models/Expense", () => ({
  create: jest.fn(),
}));

describe("ExpenseController.create", () => {
  it("should create a new expense", async () => {
    const expenseMock = {
      save: jest.fn().mockResolvedValue(true),
    };

    (Expense.create as jest.Mock).mockResolvedValue(expenseMock);

    const req = createRequest({
      method: "POST",
      url: "/api/budgets/:budgetId/expenses",
      body: { name: "Test Expense", amount: 500 },
      budget: { id: 1 },
    });

    const res = createResponse();
    await ExpenseController.create(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data).toEqual("Gasto agregado correctamente");
    expect(expenseMock.save).toHaveBeenCalled();
    expect(expenseMock.save).toHaveBeenCalledTimes(1);
    expect(Expense.create).toHaveBeenCalledWith(req.body);
  });

  it("should handle expense creation error", async () => {
    const expenseMock = {
      save: jest.fn(),
    };

    (Expense.create as jest.Mock).mockRejectedValue(new Error());

    const req = createRequest({
      method: "POST",
      url: "/api/budgets/:budgetId/expenses",
      body: { name: "Test Expense", amount: 500 },
      budget: { id: 1 },
    });
    const res = createResponse();
    await ExpenseController.create(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(500);
    expect(data).toEqual({ error: "Hubo un error al crear el gasto" });
    expect(expenseMock.save).not.toHaveBeenCalled();
  });
});

describe("ExpensesController.getById", () => {
  it("should return expense with ID 1", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenses[0],
    });

    const res = createResponse();

    await ExpenseController.getById(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data).toEqual(expenses[0]);
  });
});

describe("ExpensesController.updateById", () => {
  it("should update expense and return a success message", async () => {
    const expenseMock = {
      ...expenses[0],
      update: jest.fn().mockResolvedValue(true),
    };

    const req = createRequest({
      method: "PUT",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenseMock,
      body: { name: "Expense Test", amount: 500 },
    });

    const res = createResponse();

    await ExpenseController.updateById(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data).toEqual("Pago actualizado correctamente");
    expect(expenseMock.update).toHaveBeenCalled();
    expect(expenseMock.update).toHaveBeenCalledWith(req.body);
    expect(expenseMock.update).toHaveBeenCalledTimes(1);
  });
});

describe("ExpensesController.deleteById", () => {
  it("should delete expense and return a success message", async () => {
    const expenseMock = {
      ...expenses[0],
      destroy: jest.fn(),
    };

    const req = createRequest({
      method: "DELETE",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenseMock,
    });

    const res = createResponse();

    await ExpenseController.deleteById(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data).toEqual("Pago eliminado correctamente");
    expect(expenseMock.destroy).toHaveBeenCalled();
    expect(expenseMock.destroy).toHaveBeenCalledTimes(1);
  });
});
