import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import { env } from './utils/env.js';
import { getContacts, getContact } from './controllers/contactsController.js';

const PORT = Number(env('PORT', '3000'));

export const startServer = () => {
    const app = express();

    app.use(express.json());
    app.use(cors());

    app.use(
        pino({
            transport: {
                target: 'pino-pretty',
            },
        }),
    );

    app.get('/contacts', getContacts);
    app.get('/contacts/:contactId', getContact);

    app.get('/', (req, res) => {
        res.json({
            message: 'Hello world!',
        });
    });

    app.use('*', (req, res, next) => {
        res.status(404).json({
            message: 'Not found',
        });
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    return app;
};