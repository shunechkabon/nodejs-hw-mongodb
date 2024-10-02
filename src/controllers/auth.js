import {
    registerUser,
    loginUser,
    refreshSession 
} from '../services/auth.js';
import { THIRTY_DAYS } from '../constants/index.js';

export const registerUserController = async (req, res, next) => {
    try {
        const newUser = await registerUser(req.body);
        res.status(201).json({
            status: 201,
            message: 'Successfully registered a user!',
            data: { ...newUser.toObject(), password: undefined }, 
        });
    } catch (error) {
        next(error);
    }
};

export const loginUserController = async (req, res, next) => {
    try {
        const session = await loginUser(req.body);
        
        res.cookie('refreshToken', session.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: new Date(Date.now() + THIRTY_DAYS),
        });

        res.status(200).json({
            status: 200,
            message: 'Successfully logged in a user!',
            data: {
                accessToken: session.accessToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

const setupSession = (res, session) => {
    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + THIRTY_DAYS),
    });
    res.cookie('sessionId', session._id, {
        httpOnly: true,
        expires: new Date(Date.now() + THIRTY_DAYS),
    });
};

export const refreshSessionController = async (req, res, next) => {
    try {
        const session = await refreshSession({
            sessionId: req.cookies.sessionId,
            refreshToken: req.cookies.refreshToken,
        });
        
        setupSession(res, session);

        res.status(200).json({
            status: 200,
            message: 'Successfully refreshed a session!',
            data: {
                accessToken: session.accessToken,
            },
        });
    } catch (error) {
        next(error);
    }
};