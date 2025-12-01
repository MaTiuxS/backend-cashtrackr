import { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";
import { getEnv } from "../config/env";

declare global {
  var cashTrackrConfirmationToken: string | undefined;
}

export class UserController {
  static create = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      const error = new Error("El usuario ya existe");
      return res.status(409).json({ error: error.message });
    }
    try {
      const user = await User.create(req.body);
      user.password = await hashPassword(password);
      const token = generateToken().toString();
      user.token = token;

      if (getEnv("NODE_ENV") !== "production") {
        globalThis.cashTrackrConfirmationToken = token;
      }

      await user.save();

      try {
        await AuthEmail.sendConfirmationEmail({
          username: user.username,
          email: user.email,
          token: user.token.toString(),
        });
      } catch (error) {
        return res.status(401).json({
          error:
            "Tu cuenta fue creada, pero no pudimos enviar el correo de confirmación. Intenta reenviar más tarde.",
        });
      }

      return res.status(201).json("Cuenta creada correctamente");
    } catch (error) {
      // console.log(error);
      return res.status(500).json("Hubo un error al crear la cuenta");
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    const { token, email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("El email no es valido");
      return res.status(404).json({ error: error.message });
    }
    // const user = await User.findOne({ where: { token } });
    if (user.token !== token) {
      const error = new Error("El token no es valido");
      return res.status(401).json({ error: error.message });
    }

    user.confirmed = true;
    user.token = "";
    await user.save();
    return res.status(201).json("Cuenta confirmada correctamente");
  };

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      const error = new Error("Usuario no encontrado");
      return res.status(404).json({ error: error.message });
    }

    if (!user.confirmed) {
      const error = new Error("La cuanta no ha sido confirmada");
      return res.status(403).json({ error: error.message });
    }

    const isPasswordCorrect = await checkPassword(password, user.password);
    if (!isPasswordCorrect) {
      const error = new Error("Usuario o password incorrectos");
      return res.status(401).json({ error: error.message });
    }

    const token = generateJWT(user.id);

    return res.status(200).json(token);
  };

  static forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("Usuario no encontrado");
      return res.status(404).json({ error: error.message });
    }

    user.token = generateToken().toString();

    await user.save();

    await AuthEmail.sendPasswordResetToken({
      username: user.username,
      email: user.email,
      token: user.token,
    });

    return res.status(201).json("Revisa tu email para las instrucciones");
  };

  static validateToken = async (req: Request, res: Response) => {
    const { token } = req.body;
    const tokenExists = await User.findOne({ where: { token } });

    if (!tokenExists) {
      const error = new Error("Token no valido");
      return res.status(404).json({ error: error.message });
    }

    return res.status(200).json("Token valido, asigna un nuevo password");
  };

  static resetPasswordWithToken = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ where: { token } });

    if (!user) {
      const error = new Error("Token no valido");
      return res.status(404).json({ error: error.message });
    }

    user.password = await hashPassword(password);
    user.token = "";
    await user.save();

    return res.status(201).json("El password se modifico correctamente");
  };

  static userInformation = async (req: Request, res: Response) => {
    res.json(req.user);
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    const { id } = req.user!;

    const user = await User.findByPk(id);

    if (!user) {
      const error = new Error("Usuario no encontrado");
      return res.status(401).json({ error: error.message });
    }
    const isPasswordCorrect = await checkPassword(
      current_password,
      user.password
    );

    if (!isPasswordCorrect) {
      const error = new Error("El password actual es incorrecto");
      return res.status(401).json({ error: error.message });
    }

    user.password = await hashPassword(password);
    await user.save();

    return res.json("El password se modifico correctamente");
  };

  static checkPasswordUser = async (req: Request, res: Response) => {
    const { password } = req.body;

    const { id } = req.user!;

    const user = await User.findByPk(id);

    if (!user) {
      const error = new Error("Usuario no encontrado");
      return res.status(404).json({ error: error.message });
    }
    const isPasswordCorrect = await checkPassword(password, user.password);

    if (!isPasswordCorrect) {
      const error = new Error("El password actual es incorrecto");
      return res.status(401).json({ error: error.message });
    }

    return res.json("El password es correcto");
  };

  static profileUpdateUser = async (req: Request, res: Response) => {
    const { username, email } = req.body;

    try {
      const { id } = req.user!;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== id) {
        const error = new Error("El correo ya se encuentra en uso");
        return res.status(403).json({ error: error.message });
      }

      await User.update(
        { email, username },
        {
          where: { id },
        }
      );

      return res.json("El perfil se actualizo correctamente");
    } catch (error) {
      // console.log(error)
      const err = new Error(
        "Error al actualizar el perfil, intente de nuevo mas tarde..."
      );
      return res.status(401).json({ error: err.message });
    }
  };
}
