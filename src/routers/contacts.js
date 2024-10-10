import { Router } from 'express';
import {
    getContactsController,
    getContactController,
    createContactController,
    patchContactController,
    deleteContactController
} from '../controllers/contactsController.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { createContactSchema, updateContactSchema } from '../validation/contactValidation.js';
import { authenticate } from '../middlewares/authenticate.js'; 
import { upload } from '../middlewares/multer.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrlWrapper(getContactsController));
router.get('/:contactId', isValidId, ctrlWrapper(getContactController));
router.post('/', upload.single('photo'), validateBody(createContactSchema), ctrlWrapper(createContactController));
router.patch('/:contactId', upload.single('photo'), isValidId, validateBody(updateContactSchema), ctrlWrapper(patchContactController));
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContactController));

export default router;