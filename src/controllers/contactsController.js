import { getAllContacts, getContactById, createContact, updateContact, deleteContact } from '../services/contacts.js';
import createError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js'; 

export const getContactsController = async (req, res, next) => {
    try {
        const { page, perPage } = parsePaginationParams(req.query);
        const { sortBy, sortOrder } = parseSortParams(req.query);
        const filters = parseFilterParams(req.query);
        const { _id: userId } = req.user;

        const contacts = await getAllContacts({
            page,
            perPage,
            sortBy,
            sortOrder,
            filters,
            userId,
        });

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
        const { _id: userId } = req.user;

        const contact = await getContactById(contactId, userId);

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
        const { _id: userId } = req.user;

        const newContact = await createContact({ name, phoneNumber, email, isFavourite, contactType, userId });

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
        const { _id: userId } = req.user;

        const updatedContact = await updateContact(contactId, userId, payload);

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
    try {
        const { contactId } = req.params;
        const { _id: userId } = req.user; 

        const result = await deleteContact(contactId, userId);

        if (!result) {
            return next(createError(404, 'Contact not found'));
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};