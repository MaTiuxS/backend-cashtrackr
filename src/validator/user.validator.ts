import { body, param } from "express-validator";

export const createUserRules = [
  body("username")
    .notEmpty()
    .withMessage("El nombre no puede ir vacio")
    .isLength({ min: 5, max: 30 })
    .withMessage("El nombre debe tener entre 5 y 30 caracteres")
    .trim()
    .toLowerCase()
    .escape(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/[A-Z]/)
    .withMessage("La contraseña debe contener al menos una letra mayúscula")
    .matches(/[a-z]/)
    .withMessage("La contraseña debe contener al menos una letra minúscula")
    .matches(/[0-9]/)
    .withMessage("La contraseña debe contener al menos un número")
    .matches(/[\W_]/)
    .withMessage("La contraseña debe contener al menos un carácter especial")
    .escape(),

  body("email")
    .isEmail()
    .withMessage("Correo electrónico inválido")
    .normalizeEmail(),
];

export const listUserRules = [
  param("userId").isInt({ gt: 0 }).toInt().withMessage("El ID es invalido"),
];

export const updatedUserRules = [
  param("userId").isInt({ gt: 0 }).toInt().withMessage("El ID es invalido"),
  ...createUserRules,
];

export const deleteUserRules = [
  param("userId").isInt({ gt: 0 }).toInt().withMessage("El ID es invalido"),
];

export const confirmTokenRules = [
  body("token")
    .isString()
    .withMessage("Token no valido")
    .isLength({ min: 6, max: 6 })
    .withMessage("El token introducido es incorrecto"),
];
export const confirmTokenRulesParam = [
  param("token")
    .notEmpty()
    .isString()
    .withMessage("Token no valido")
    .isLength({ min: 6, max: 6 })
    .withMessage("El token introducido es incorrecto"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/[A-Z]/)
    .withMessage("La contraseña debe contener al menos una letra mayúscula")
    .matches(/[a-z]/)
    .withMessage("La contraseña debe contener al menos una letra minúscula")
    .matches(/[0-9]/)
    .withMessage("La contraseña debe contener al menos un número")
    .matches(/[\W_]/)
    .withMessage("La contraseña debe contener al menos un carácter especial")
    .escape(),
];
export const loginUserUles = [
  body("email")
    .isEmail()
    .withMessage("El correo electronico no es valido")
    .normalizeEmail()
    .trim()
    .toLowerCase()
    .escape(),
  body("password")
    .notEmpty()
    .withMessage("El password es obligatorio")
    .trim()
    .escape(),
];

export const forgotPasswordRules = [
  body("email")
    .isEmail()
    .withMessage("El correo electronico no es valido")
    .normalizeEmail()
    .trim()
    .toLowerCase()
    .escape(),
];

export const updateCurrentPassword = [
  body("current_password")
    .notEmpty()
    .withMessage("El password no puede ir vacio"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/[A-Z]/)
    .withMessage("La contraseña debe contener al menos una letra mayúscula")
    .matches(/[a-z]/)
    .withMessage("La contraseña debe contener al menos una letra minúscula")
    .matches(/[0-9]/)
    .withMessage("La contraseña debe contener al menos un número")
    .matches(/[\W_]/)
    .withMessage("La contraseña debe contener al menos un carácter especial")
    .escape(),
];

export const checkPasswordUser = [
  body("password").notEmpty().withMessage("El password no puede ir vacio"),
];

export const updateProfileUser = [
  body("username")
    .notEmpty()
    .withMessage("El nombre no puede ir vacio")
    .isLength({ min: 5, max: 30 })
    .withMessage("El nombre debe tener entre 5 y 30 caracteres")
    .trim()
    .toLowerCase()
    .escape(),
  body("email")
    .isEmail()
    .withMessage("El correo electronico no es valido")
    .normalizeEmail(),
];
