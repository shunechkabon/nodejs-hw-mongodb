import { Router } from 'express';
import {
    registerUserController,
    loginUserController,
    refreshSessionController,
    logoutUserController,
    requestResetEmailController
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema, loginUserSchema, requestResetEmailSchema } from '../validation/userValidation.js';
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

router.post(
    '/logout',
    ctrlWrapper(logoutUserController)
); 

router.post(
    '/send-reset-email',
    validateBody(requestResetEmailSchema),
    ctrlWrapper(requestResetEmailController),
);

export default router;