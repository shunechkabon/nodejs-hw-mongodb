import { getAllContacts, getContactById, createContact, updateContact, deleteContact } from '../services/contacts.js';
import createError from 'http-errors';

export const getContactsController = async (req, res, next) => {
    try {
        const contacts = await getAllContacts();
        res.status(200).json({
            status: 200,
            message: 'Successfully found contacts!',
            data: contacts,
        });
    } catch (error) {
        next(error);
    }
};


export const getContactController = async (req, res, next) => {
    try {
        const { contactId } = req.params;
        const contact = await getContactById(contactId);

        if (!contact) {
            throw createError(404, 'Contact not found');
        }

        res.status(200).json({
            status: 200,
            message: `Successfully found contact with id ${contactId}!`,
            data: contact,
        });
    } catch (error) {
        next(error);
    }
};

export const createContactController = async (req, res, next) => {
    try {
        const { name, phoneNumber, email, isFavourite, contactType } = req.body;

        const newContact = await createContact({ name, phoneNumber, email, isFavourite, contactType });

        res.status(201).json({
            status: 201,
            message: 'Successfully created a contact!',
            data: newContact,
        });
    } catch (error) {
        next(error);
    }
};

export const patchContactController = async (req, res, next) => {
    try {
        const { contactId } = req.params;
        const payload = req.body;

        const updatedContact = await updateContact(contactId, payload);

        if (!updatedContact) {
            throw createError(404, 'Contact not found');
        }

        res.status(200).json({
            status: 200,
            message: 'Successfully patched a contact!',
            data: updatedContact.contact,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteContactController = async (req, res, next) => {
    const { contactId } = req.params;

    const result = await deleteContact(contactId);
    
    if (!result) {
        return next(createError(404, "Contact not found"));
    }

    res.status(204).send();
};