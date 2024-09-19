import { Router } from 'express';
import { getContacts, getContact } from '../controllers/contactsController.js';

const router = Router();

router.get('/contacts', getContacts);
router.get('/contacts/:contactId', getContact);

export default router;