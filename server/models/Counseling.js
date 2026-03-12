const mongoose = require('mongoose');

const counselingSessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Individual Session', 'Stress Management', 'Career Guidance', 'Follow-up'],
    required: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  appointmentStatus: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'rescheduled'],
    default: 'pending',
  },
  notes: {
    type: String,
    default: '',
  },
  counselorNotes: {
    type: String,
    default: '',
  },
  newDate: {
    type: Date,
    default: null,
  },
  newTime: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const counselingResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Article', 'Video', 'Guide', 'Audio'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: 'doc.fill',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const crisisContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  availability: {
    type: String,
    default: '24/7',
  },
  description: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CounselingSession = mongoose.model('CounselingSession', counselingSessionSchema);
const CounselingResource = mongoose.model('CounselingResource', counselingResourceSchema);
const CrisisContact = mongoose.model('CrisisContact', crisisContactSchema);

module.exports = {
  CounselingSession,
  CounselingResource,
  CrisisContact,
};

