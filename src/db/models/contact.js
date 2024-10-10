import { model, Schema } from 'mongoose';

const contactSchema = new Schema(
  {
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  isFavourite: {
    type: Boolean,
    default: false,
  },
  contactType: {
    type: String,
    enum: ['work', 'home', 'personal'],
    default: 'personal',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    },
  photo: { type: String },
}, { timestamps: true });

export const ContactsCollection = model('contacts', contactSchema);