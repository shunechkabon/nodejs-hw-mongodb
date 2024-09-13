import { ContactsCollection } from '../db/models/contact.js';

export const getAllContacts = async () => {
    try {
        const contacts = await ContactsCollection.find();
        return {
            status: 200,
            message: 'Successfully found contacts!',
            data: contacts,
        };
    } catch (error) {
        throw new Error('Error while fetching contacts: ' + error.message);
    }
};

export const getContactById = async (contactId) => {
    try {
        const contact = await ContactsCollection.findById(contactId);
        if (!contact) {
            return {
                status: 404,
                message: 'Contact not found',
            };
        }
        return {
            status: 200,
            message: `Successfully found contact with id ${contactId}!`,
            data: contact,
        };
    } catch (error) {
        throw new Error('Error while fetching contact: ' + error.message);
    }
};