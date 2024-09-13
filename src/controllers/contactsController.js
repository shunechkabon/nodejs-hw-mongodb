import { getAllContacts, getContactById } from '../services/contacts.js';

export const getContacts = async (req, res) => {
    try {
        const result = await getAllContacts();
        res.status(result.status).json(result);
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

export const getContact = async (req, res) => {
    try {
        const { contactId } = req.params;
        const result = await getContactById(contactId);
        if (result.status === 404) {
            return res.status(result.status).json({ message: result.message });
        }
        res.status(result.status).json(result);
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};