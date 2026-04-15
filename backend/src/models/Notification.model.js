import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['apps', 'jobs', 'system', 'ai'],
    default: 'system'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  action: {
    type: String,
    default: null
  },
  actionUrl: {
    type: String,
    default: null
  }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
