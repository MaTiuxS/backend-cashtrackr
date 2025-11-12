import request from "supertest";
import server from "../../server";
import { UserController } from "../../controllers/User.controller";
import app from "../../server";
import User from "../../models/User";
import * as authUtils from "../../utils/auth";
import * as jwtUtils from "../../utils/jwt";
jest.setTimeout(15000);
describe("Authentication - Create Account", () => {
  it("should display validation errors when form is empty", async () => {
    const response = await request(server)
      .post("/api/auth/create-account")
      .send({});

    const createAccountMock = jest.spyOn(UserController, "create");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(8);
    expect(response.status).not.toBe(201);
    expect(createAccountMock).not.toHaveBeenCalled();
  });

  it("should return 400 status code when the email is invalid", async () => {
    const response = await request(server)
      .post("/api/auth/create-account")
      .send({
        username: "Jonathan",
        password: "Qwerty123@",
        email: "test@",
      });

    const createAccountMock = jest.spyOn(UserController, "create");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.status).not.toBe(201);
    expect(createAccountMock).not.toHaveBeenCalled();
  });

  it("should return 400 status code when the password is less than 8 characters", async () => {
    const response = await request(server)
      .post("/api/auth/create-account")
      .send({
        username: "Jonathan",
        password: "qwerty123",
        email: "test@test.com",
      });

    const createAccountMock = jest.spyOn(UserController, "create");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(2);
    expect(response.body.errors[0].message).toEqual(
      "La contraseña debe contener al menos una letra mayúscula"
    );
    expect(response.status).not.toBe(201);
    expect(createAccountMock).not.toHaveBeenCalled();
  });

  it("should register a new user successfully", async () => {
    const userData = {
      username: "JonathanSoto",
      password: "Qwerty123@",
      email: "test2@test.com",
    };
    const response = await request(app)
      .post("/api/auth/create-account")
      .send(userData)
      .expect(201);
    expect(response.status).toBe(201);
    expect(response.status).not.toBe(400);
    expect(response.body).not.toHaveProperty("errors");
  });

  it("should return 409 conflict when a user is alredy registered", async () => {
    const userData = {
      username: "JonathanSoto",
      password: "Qwerty123@",
      email: "test2@test.com",
    };
    const response = await request(app)
      .post("/api/auth/create-account")
      .send(userData);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("El usuario ya existe");
    expect(response.status).not.toBe(201);
    expect(response.status).not.toBe(400);
    expect(response.body).not.toHaveProperty("errors");
  });
});

describe("Authentication - Account Confirmation with Token", () => {
  it("should display error if token is empty or token is not valid", async () => {
    const response = await request(app).post("/api/auth/confirm-account").send({
      token: "not_value",
    });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].message).toBe(
      "El token introducido es incorrecto"
    );
  });

  it("should display error if token is not valid", async () => {
    const response = await request(app).post("/api/auth/confirm-account").send({
      token: "123456",
      email: "test2@test.com",
    });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("El token no es valido");
  });

  it("should confirm account with a valid token", async () => {
    const token = globalThis.cashTrackrConfirmationToken;
    const response = await request(app).post("/api/auth/confirm-account").send({
      token,
      email: "test2@test.com",
    });

    expect(response.status).toBe(201);
    expect(response.body).toBe("Cuenta confirmada correctamente");
  });
});

describe("Authentication - Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should display validation errors when the form is empty", async () => {
    const response = await request(app).post("/api/auth/login").send({});
    const loginMock = jest.spyOn(UserController, "login");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(2);
    expect(response.body.errors).not.toHaveLength(1);
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("should return 400 bad request when the email is invalid", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "not_value",
      password: "Qwerty123@",
    });
    const loginMock = jest.spyOn(UserController, "login");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].message).toBe(
      "El correo electronico no es valido"
    );
    expect(response.body.errors).not.toHaveLength(2);
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("should return a 400 error if the user is not found", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "user@test.com",
      password: "Qwerty123@",
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Usuario no encontrado");
    expect(response.status).not.toBe(200);
  });

  it("should return a 403 error if the user account is not confirmed", async () => {
    (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({
      id: 1,
      confirmed: false,
      password: "hashedPassword",
      email: "user_not@test.com",
    });
    const response = await request(app).post("/api/auth/login").send({
      email: "user_not@test.com",
      password: "Qwerty123@",
    });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("La cuanta no ha sido confirmada");
    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(404);
  });

  it("should return a 403 error if the user account is not confirmed", async () => {
    const userData = {
      username: "Test",
      password: "Qwerty123@",
      email: "user_not@test.com",
    };
    await request(app).post("/api/auth/create-account").send(userData);

    const response = await request(app).post("/api/auth/login").send({
      password: userData.password,
      email: userData.email,
    });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("La cuanta no ha sido confirmada");
    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(404);
  });

  it("should return a 401 error if the password is incorrect", async () => {
    const findOne = (
      jest.spyOn(User, "findOne") as jest.Mock
    ).mockResolvedValue({
      id: 1,
      confirmed: true,
      password: "hashedPassword",
      email: "user_not@test.com",
    });

    const checkPassword = jest
      .spyOn(authUtils, "checkPassword")
      .mockResolvedValue(false);

    const response = await request(app).post("/api/auth/login").send({
      email: "user_not@test.com",
      password: "Qwerty123@",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Usuario o password incorrectos");
    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(404);
    expect(findOne).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalledTimes(1);
  });

  it("should return a jwt", async () => {
    const findOne = (
      jest.spyOn(User, "findOne") as jest.Mock
    ).mockResolvedValue({
      id: 1,
      confirmed: true,
      password: "hashedPassword",
      email: "user_not@test.com",
    });

    const checkPassword = jest
      .spyOn(authUtils, "checkPassword")
      .mockResolvedValue(true);

    const generateJWT = jest
      .spyOn(jwtUtils, "generateJWT")
      .mockReturnValue("jwt_token");

    const response = await request(app).post("/api/auth/login").send({
      email: "user_not@test.com",
      password: "correct_password",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual("jwt_token");
    expect(findOne).toHaveBeenCalled();
    expect(findOne).toHaveBeenCalledTimes(1);

    expect(checkPassword).toHaveBeenCalled();
    expect(checkPassword).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenLastCalledWith(
      "correct_password",
      "hashedPassword"
    );

    expect(generateJWT).toHaveBeenCalled();
    expect(generateJWT).toHaveBeenCalledTimes(1);
    expect(generateJWT).toHaveBeenCalledWith(1);
  });
});

let jwt: string;
async function authenticateUser() {
  const response = await request(app).post("/api/auth/login").send({
    email: "test2@test.com",
    password: "Qwerty123@",
  });

  jwt = response.body;
  expect(response.status).toBe(200);
}

describe("GET /api/budgets", () => {
  beforeAll(() => {
    jest.restoreAllMocks();
  });

  beforeAll(async () => {
    await authenticateUser();
  });

  it("should reject unauthenticated access to budgets without a jwt", async () => {
    const response = await request(app).get("/api/budgets");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("No autorizado");
  });

  it("should allow authenticated access to budgets with a valid jwt", async () => {
    const response = await request(app)
      .get("/api/budgets")
      .auth(jwt, { type: "bearer" });

    expect(response.body).toHaveLength(0);
    expect(response.status).not.toBe(401);
    expect(response.body.error).not.toBe("No autorizado");
  });

  it("should allow authenticated access to budgets with a valid jwt", async () => {
    const response = await request(app)
      .get("/api/budgets")
      .auth("not_jtw", { type: "bearer" });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Token no valido");
  });
});

describe("POST /api/budgets", () => {
  beforeAll(async () => {
    await authenticateUser();
  });
  it("should display validation when the form is submitted with invalid data", async () => {
    const response = await request(app)
      .post("/api/budgets")
      .auth(jwt, { type: "bearer" })
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveLength(4);
  });
});

describe("GET /api/budgets/:id", () => {
  beforeAll(async () => {
    await authenticateUser();
  });
  it("should reject unauthenticated get request to budget id without a jwt", async () => {
    const response = await request(app).get("/api/budgets/1");
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("No autorizado");
  });

  it("should return 400 bad request when id is not valid", async () => {
    const response = await request(app)
      .get("/api/budgets/not_valid")
      .auth(jwt, { type: "bearer" });
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toBeTruthy();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].message).toBe("El ID es invalido");
    expect(response.status).not.toBe(401);
    expect(response.body.error).not.toBe("No autorizado");
  });

  it("should return 400 bad request when id is not valid", async () => {
    const response = await request(app)
      .get("/api/budgets/100")
      .auth(jwt, { type: "bearer" });
    expect(response.status).toBe(404);
    expect(response.status).not.toBe(401);
    expect(response.body.error).toBe("Presupuesto no encontrado");
  });

  it("should return a single budget by id", async () => {
    const budgetData = {
      name: "Test",
      amount: 2500,
    };
    await request(app)
      .post("/api/budgets")
      .auth(jwt, { type: "bearer" })
      .send(budgetData)
      .expect(201);

    const response = await request(app)
      .get("/api/budgets/1")
      .auth(jwt, { type: "bearer" });
    expect(response.status).toBe(200);
    expect(response.status).not.toBe(404);
  });

  it("should reject unauthenticated put request to budget id without a jwt", async () => {
    const response = await request(app).put("/api/budgets/1");

    expect(response.status).toBe(401);
    expect(response.status).not.toBe("No autorizado");
  });

  it("should display validation errors if the form is empty", async () => {
    const response = await request(app)
      .put("/api/budgets/1")
      .auth(jwt, { type: "bearer" })
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeTruthy();
    expect(response.body.errors).toHaveLength(4);
  });

  it("should display validation errors if the form is empty", async () => {
    const response = await request(app)
      .put("/api/budgets/1")
      .auth(jwt, { type: "bearer" })
      .send({
        name: "updated Budget",
        amount: 300,
      });

    expect(response.status).toBe(200);
    expect(response.body).toBe("Presupuesto actualizado correctamente");
  });
});

describe("POST /api/budgets", () => {
  beforeAll(async () => {
    await authenticateUser();
  });
  it("should display validation when the form is submitted with invalid data", async () => {
    const response = await request(app)
      .post("/api/budgets")
      .auth(jwt, { type: "bearer" })
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveLength(4);
  });
});

describe("DELETE /api/budgets/:id", () => {
  beforeAll(async () => {
    await authenticateUser();
  });
  it("should reject unauthenticated get request to budget id without a jwt", async () => {
    const response = await request(app).delete("/api/budgets/1");
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("No autorizado");
  });

  it("should return 404 not found when a budget doesnt exists", async () => {
    const response = await request(app)
      .delete("/api/budgets/100")
      .auth(jwt, { type: "bearer" });
    expect(response.status).toBe(404);
    expect(response.status).not.toBe(401);
    expect(response.body.error).toBe("Presupuesto no encontrado");
  });

  it("should display validation errors if the form is empty", async () => {
    const response = await request(app)
      .delete("/api/budgets/1")
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(200);
    expect(response.body).toBe("Presupuesto eliminado correctamente");
  });
});
