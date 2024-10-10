import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { UsersCollection } from '../db/models/user.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS, SMTP, TEMPLATES_DIR } from '../constants/index.js';
import { randomBytes } from 'crypto';
import { SessionsCollection } from '../db/models/session.js';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendMail.js';

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

    await SessionsCollection.deleteOne({ userId: user._id });

    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');
    // const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    // const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });

    return await SessionsCollection.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
    });
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
    console.log('sessionId:', sessionId); 
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

export const logoutUser = async ({ sessionId, refreshToken }) => {
    const session = await SessionsCollection.findOne({
        _id: sessionId,
        refreshToken,
    });

    if (!session) {
        throw createHttpError(401, 'Session not found');
    }

    await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });
};

export const requestResetToken = async (email) => {
    const user = await UsersCollection.findOne({ email });
    if (!user) {
        throw createHttpError(404, 'User not found');
    }

    const resetToken = jwt.sign(
        {
            sub: user._id,
            email,
        },
        env('JWT_SECRET'),
        {
            expiresIn: '5m',
        },
    );

    const resetPasswordTemplatePath = path.join(
        TEMPLATES_DIR,
        'reset-password-email.html',
    );

    const templateSource = (
        await fs.readFile(resetPasswordTemplatePath)
    ).toString();

    const template = handlebars.compile(templateSource);
    const html = template({
        name: user.name,
        link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
    });

    try {
        await sendEmail({
            from: env(SMTP.SMTP_FROM),
            to: email,
            subject: 'Reset your password',
            html,
        });
    } catch {
        throw createHttpError(500, 'Failed to send the email, please try again later.');
    }
};

export const resetPassword = async (payload) => {
    let entries;

    try {
        entries = jwt.verify(payload.token, env('JWT_SECRET'));
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw createHttpError(401, 'Token is expired or invalid.');
        } else {
            throw createHttpError(401, err.message);
        }
    }

    const user = await UsersCollection.findOne({
        email: entries.email,
        _id: entries.sub,
    });

    if (!user) {
        throw createHttpError(404, 'User not found');
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    await UsersCollection.updateOne(
        { _id: user._id },
        { password: encryptedPassword },
    );
};