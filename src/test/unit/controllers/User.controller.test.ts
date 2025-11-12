import { createRequest, createResponse } from "node-mocks-http";
import User from "../../../models/User";
import { UserController } from "../../../controllers/User.controller";
import { checkPassword, hashPassword } from "../../../utils/auth";
import { generateToken } from "../../../utils/token";
import { AuthEmail } from "../../../emails/AuthEmail";
import { generateJWT } from "../../../utils/jwt";

jest.mock("../../../models/User");
jest.mock("../../../utils/auth");
jest.mock("../../../utils/token");
jest.mock("../../../utils/jwt");
describe("UserController.createAccount", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return a 409 status and an error message if the email is already registered", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(true);
    const req = createRequest({
      method: "POST",
      url: "/api/auth/create-account",
      body: {
        email: "test@test.com",
        password: "TestPassword123@",
      },
    });

    const res = createResponse();
    await UserController.create(req, res);
    const data = res._getJSONData();
    expect(res.statusCode).toBe(409);
    expect(data).toEqual({ error: "El usuario ya existe" });
    expect(data).toHaveProperty("error", "El usuario ya existe");
    expect(User.findOne).toHaveBeenCalledTimes(1);
  });

  it("should register a new user and return a success message", async () => {
    const req = createRequest({
      method: "POST",
      url: "/api/auth/create-account",
      body: {
        email: "test@test.com",
        password: "TestPassword123@",
        username: "Test name",
      },
    });
    const res = createResponse();

    const mockUser = { ...req.body, save: jest.fn() };
    (User.create as jest.Mock).mockResolvedValue(mockUser);
    (hashPassword as jest.Mock).mockReturnValue("hashedpassword");
    (generateToken as jest.Mock).mockReturnValue("123456");
    jest
      .spyOn(AuthEmail, "sendConfirmationEmail")
      .mockImplementation(() => Promise.resolve());
    await UserController.create(req, res);

    expect(User.create).toHaveBeenCalledWith(req.body);
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockUser.password).toBe("hashedpassword");
    expect(mockUser.token).toBe("123456");
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
      username: req.body.username,
      email: req.body.email,
      token: "123456",
    });
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(201);
  });
});

describe("UserController.login", () => {
  it("should return 404 if user is not found", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "TestPassword123@",
      },
    });

    const res = createResponse();
    await UserController.login(req, res);
    const data = res._getJSONData();
    expect(res.statusCode).toBe(404);
    expect(data).toEqual({ error: "Usuario no encontrado" });
  });

  it("should return 403 if the account has not been confirmed", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      email: "test@test.com",
      passoword: "Password123@",
      confirmed: false,
    });

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "TestPassword123@",
      },
    });
    const res = createResponse();
    await UserController.login(req, res);
    const data = res._getJSONData();
    expect(res.statusCode).toBe(403);
    expect(data).toEqual({ error: "La cuanta no ha sido confirmada" });
  });

  it("should return 401 if the password is incorrect", async () => {
    const userMock = {
      id: 1,
      email: "test@test.com",
      password: "Password123@",
      confirmed: true,
    };
    (User.findOne as jest.Mock).mockResolvedValue(userMock);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "TestPassword123@",
      },
    });
    const res = createResponse();

    (checkPassword as jest.Mock).mockResolvedValue(false);

    await UserController.login(req, res);
    const data = res._getJSONData();
    expect(res.statusCode).toBe(401);
    expect(data).toEqual({ error: "Usuario o password incorrectos" });
    expect(checkPassword).toHaveBeenCalledWith(
      req.body.password,
      userMock.password
    );
    expect(checkPassword).toHaveBeenCalledTimes(1);
  });

  it("should return a JWT authentication is succesful", async () => {
    const userMock = {
      id: 1,
      email: "test@test.com",
      password: "Password123@",
      confirmed: true,
    };
    (User.findOne as jest.Mock).mockResolvedValue(userMock);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "Password123@",
      },
    });
    const res = createResponse();

    const fakejwt = "fake_jwt";
    (checkPassword as jest.Mock).mockResolvedValue(true);
    (generateJWT as jest.Mock).mockReturnValue(fakejwt);

    await UserController.login(req, res);
    const data = res._getJSONData();
    expect(data).toEqual(fakejwt);
    expect(res.statusCode).toBe(200);
    expect(generateJWT).toHaveBeenCalledTimes(1);
    expect(generateJWT).toHaveBeenCalledWith(userMock.id);
  });
});

describe("UserController.validateToken", () => {
  it("should return 404 if the token not exists", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(false);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/validate-token",
      body: {
        token: "123456",
      },
    });
    const res = createResponse();
    await UserController.validateToken(req, res);
    const data = res._getJSONData();
    expect(res.statusCode).toBe(404);
    expect(data).toEqual({ error: "Token no valido" });
  });

  it("should return 200 if the token exists", async () => {
    const userMock = {
      token: "123456",
    };
    (User.findOne as jest.Mock).mockResolvedValue(userMock);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/validate-token",
      body: {
        token: "123456",
      },
    });
    const res = createResponse();
    await UserController.validateToken(req, res);
    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data).toEqual("Token Valido");
  });
});

describe("UserController.checkPasswordUser", () => {
  it("should return 404 if the user not exists", async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(null);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/check-password",
      user: { id: 1 },
      body: {
        password: "password",
      },
    });
    const res = createResponse();
    await UserController.checkPasswordUser(req, res);
    const data = res._getJSONData();
    expect(res.statusCode).toBe(404);
    expect(data).toEqual({ error: "Usuario no encontrado" });
  });

  it("should return 401 if the user password is not correct", async () => {
    const userMock = {
      password: "password1",
    };
    (User.findByPk as jest.Mock).mockResolvedValue(userMock);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/check-password",
      user: { id: 1 },
      body: {
        password: "password",
      },
    });
    const res = createResponse();
    (checkPassword as jest.Mock).mockResolvedValue(false);
    await UserController.checkPasswordUser(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(401);
    expect(data).toEqual({ error: "El password actual es incorrecto" });
    expect(checkPassword).toHaveBeenCalledWith(
      req.body.password,
      userMock.password
    );
  });
  it("should return 200 if the user password is correct", async () => {
    const userMock = {
      password: "password",
    };
    (User.findByPk as jest.Mock).mockResolvedValue(userMock);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/check-password",
      user: { id: 1 },
      body: {
        password: "password",
      },
    });
    const res = createResponse();
    (checkPassword as jest.Mock).mockResolvedValue(true);
    await UserController.checkPasswordUser(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data).toEqual("El password es correcto");
    expect(checkPassword).toHaveBeenCalledWith(
      req.body.password,
      userMock.password
    );
  });
});
