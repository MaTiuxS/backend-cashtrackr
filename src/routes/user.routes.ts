import { Router } from "express";
import { UserController } from "../controllers/User.controller";
import { validate } from "../middleware/validation";
import {
  checkPasswordUser,
  confirmTokenRules,
  confirmTokenRulesParam,
  createUserRules,
  forgotPasswordRules,
  loginUserUles,
  updateCurrentPassword,
} from "../validator/user.validator";
import { limiter } from "../config/limiter";
import { authenticate } from "../middleware/auth";

const router: Router = Router();
router.use(limiter);
router.post(
  "/create-account",
  validate(createUserRules),
  UserController.create
);

router.post(
  "/confirm-account",
  validate(confirmTokenRules),
  UserController.confirmAccount
);

router.post("/login", validate(loginUserUles), UserController.login);

router.post(
  "/forgot-password",
  validate(forgotPasswordRules),
  UserController.forgotPassword
);

router.post(
  "/validate-token",
  validate(confirmTokenRules),
  UserController.validateToken
);

router.post(
  "/reset-password/:token",
  validate(confirmTokenRulesParam),
  UserController.resetPasswordWithToken
);

router.get("/user", authenticate, UserController.userInformation);

router.post(
  "/update-password",
  authenticate,
  validate(updateCurrentPassword),
  UserController.updateCurrentUserPassword
);

router.post(
  "/check-password",
  authenticate,
  validate(checkPasswordUser),
  UserController.checkPasswordUser
);
export default router;
