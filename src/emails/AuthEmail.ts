import { getEnv } from "../config/env";
import { transport } from "../config/nodemailer";

type EmailProps = {
  username: string;
  email: string;
  token: string;
};
export class AuthEmail {
  static sendConfirmationEmail = async (user: EmailProps) => {
    await transport.sendMail({
      from: "CashTrackr <admin@cashtrackr.com>",
      to: user.email,
      subject: "CashTrackr - confirma tu cuenta",
      html: `
            <p>Hola: ${
              user.username
            }, has creado tu cuenta en CashTrackr, ya esta casi lista</p>
            <p>Visita el siguiente enlace:</p>
            <a href="${getEnv("FRONTEND_URL")}/auth/confirm-account?account=${
        user.email
      }">Confirmar cuenta</a>
            <p>ingresa el codigo: <b>${user.token}</b></p>
        `,
    });
  };

  static sendPasswordResetToken = async (user: EmailProps) => {
    await transport.sendMail({
      from: "CashTrackr Restablece tu password",
      to: user.email,
      subject: "CashTrackr - confirma tu cuenta",
      html: `
            <p>Hola: ${
              user.username
            }, has solicitado restablecer tu password</p>
            <p>Visita el siguiente enlace:</p>
            <a href="${getEnv(
              "FRONTEND_URL"
            )}/auth/new-password">Restablecer password</a>
            <p>ingresa el codigo: <b>${user.token}</b></p>
        `,
    });
  };
}
