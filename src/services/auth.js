import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';
import { randomBytes } from 'crypto';
// import jwt from 'jsonwebtoken';
import { SessionsCollection } from '../db/models/session.js';

export const registerUser = async (payload) => {
    const existingUser = await UsersCollection.findOne({ email: payload.email });
    if (existingUser) {
        throw createHttpError(409, 'Email in use');
    }
    
    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    return await UsersCollection.create({
        ...payload,
        password: encryptedPassword,
    });
};

export const loginUser = async (payload) => {
    const user = await UsersCollection.findOne({ email: payload.email });
    if (!user) throw createHttpError(401, 'Invalid email or password');

    const isPasswordValid = await bcrypt.compare(payload.password, user.password);
    if (!isPasswordValid) throw createHttpError(401, 'Invalid email or password');

    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');
    // const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    // const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });

    await SessionsCollection.deleteOne({ userId: user._id });

    await SessionsCollection.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
    });

    return { accessToken, refreshToken };
};

const createSession = () => {
    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    return {
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
    };
};

export const refreshSession = async ({ sessionId, refreshToken }) => {
    console.log('sessionId:', sessionId); // Логування
    console.log('refreshToken:', refreshToken); 
    if (!sessionId || !refreshToken) {
        throw createHttpError(400, 'Session ID and Refresh Token are required');
    }
    
    const session = await SessionsCollection.findOne({
        _id: sessionId,
        refreshToken,
    });

    console.log('Retrieved session:', session);

    if (!session) {
        throw createHttpError(401, 'Session not found');
    }

    const isSessionTokenExpired =
        new Date() > new Date(session.refreshTokenValidUntil);
    console.log('Is session token expired:', isSessionTokenExpired);

    if (isSessionTokenExpired) {
        throw createHttpError(401, 'Session token expired');
    }

    const newSession = createSession();
console.log('Deleting old session with ID:', sessionId);
    await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

    const createdSession = await SessionsCollection.create({
        userId: session.userId,
        ...newSession,
    });

    console.log('Created new session:', createdSession);
    return createdSession; 
};