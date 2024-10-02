import { Router } from 'express';
import {
    registerUserController,
    loginUserController,
    refreshSessionController
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema, loginUserSchema } from '../validation/userValidation.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.post(
    '/register',
    validateBody(registerUserSchema),
    ctrlWrapper(registerUserController),
);

router.post(
    '/login',
    validateBody(loginUserSchema),
    ctrlWrapper(loginUserController),
);

router.post(
    '/refresh',
    ctrlWrapper(refreshSessionController),
);

export default router;