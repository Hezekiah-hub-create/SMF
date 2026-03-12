/**
 * Seed Script
 * Populates the database with sample data for all roles defined in the DFD.
 *
 * Run: node seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Try to use mongodb-memory-server for development (no MongoDB installation needed)
let mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smf-system';

// ── Inline schemas (avoids circular-require issues in seed context) ──
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'lecturer', 'hod', 'dean_faculty', 'dean_students', 'src', 'quality_assurance', 'admissions', 'academic_affairs', 'counseling', 'student', 'staff', 'finance'],
    default: 'student',
  },
  staffId: { type: String, unique: true, sparse: true },
  position: { type: String, default: null },
  department: { type: String, default: null },
  faculty: { type: String, default: null },
  phone: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  dean: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  hod: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const feedbackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, enum: ['course_related', 'faculty_wide', 'welfare', 'admission', 'quality', 'mental_health', 'facilities', 'system'] },
  status: { type: String, enum: ['new', 'routed', 'in_progress', 'resolved', 'escalated', 'closed'], default: 'new' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  routedTo: { type: String, default: null },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isAnonymous: { type: Boolean, default: false },
  isEscalated: { type: Boolean, default: false },
  escalationLevel: { type: Number, default: 0 },
  department: { type: String, default: null },
  faculty: { type: String, default: null },
  routedAt: { type: Date },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolutionNote: { type: String, default: '' },
  statusHistory: [{ status: String, changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, changedAt: { type: Date, default: Date.now }, note: String }],
}, { timestamps: true });

// Register models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', facultySchema);
const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

const seed = async () => {
  try {
    // Check if we should use memory server for development
    if (!process.env.MONGO_URI) {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
        console.log('🗄️  Using MongoDB Memory Server (no installation needed)');
      } catch (memServerErr) {
        console.log('💾  Using local MongoDB connection');
      }
    }
    
    console.log(`Connecting to: ${mongoUri.replace(/\/\/.*:.*@/, '//****:****@')}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    // ── Clear existing data ──────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Faculty.deleteMany({}),
      Department.deleteMany({}),
      Feedback.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── 1. Create ALL 4 FACULTIES ──────────────────────────────────────
    const [facEngineering, facBusiness, facAppliedSciences, facStudentAffairs] = await Faculty.insertMany([
      { name: 'Faculty of Engineering', code: 'ENG' },
      { name: 'Faculty of Business & Management Studies', code: 'BMS' },
      { name: 'Faculty of Applied Sciences & Technology', code: 'AST' },
      { name: 'Faculty of Student Affairs', code: 'SA' },
    ]);
    console.log('🏛️  4 Faculties created');

    // ── 2. Create Users for All Roles ──────────────────────────────────────────

    // System Admin (IT Support)
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@university.edu',
      username: 'sysadmin',
      password: 'Admin@123',
      role: 'admin',
      staffId: 'ADM001',
      position: 'System Administrator',
    });

    // === DEANS OF FACULTY ===
    const deanEngineering = await User.create({
      name: 'Prof. James Okonkwo',
      email: 'dean.eng@university.edu',
      username: 'dean_eng',
      password: 'Dean@123',
      role: 'dean_faculty',
      staffId: 'DF001',
      position: 'Dean of Faculty',
      faculty: facEngineering._id.toString(),
    });

    const deanBusiness = await User.create({
      name: 'Prof. Sarah Mitchell',
      email: 'dean.business@university.edu',
      username: 'dean_bus',
      password: 'Dean@123',
      role: 'dean_faculty',
      staffId: 'DF002',
      position: 'Dean of Faculty',
      faculty: facBusiness._id.toString(),
    });

    const deanAppliedSciences = await User.create({
      name: 'Prof. David Chen',
      email: 'dean.science@university.edu',
      username: 'dean_sci',
      password: 'Dean@123',
      role: 'dean_faculty',
      staffId: 'DF003',
      position: 'Dean of Faculty',
      faculty: facAppliedSciences._id.toString(),
    });

    const deanStudentAffairs = await User.create({
      name: 'Dr. Patricia Mensah',
      email: 'dean.students@university.edu',
      username: 'dean_students',
      password: 'Dean@123',
      role: 'dean_students',
      staffId: 'DS001',
      position: 'Dean of Students',
    });

    // === HODS (Head of Departments) ===
    const hodAgriculturalEng = await User.create({
      name: 'Dr. Emmanuel Owusu',
      email: 'hod.agreng@university.edu',
      username: 'hod_agreng',
      password: 'Hod@123',
      role: 'hod',
      staffId: 'HOD001',
      position: 'Head of Department',
      faculty: facEngineering._id.toString(),
    });

    const hodChemicalEng = await User.create({
      name: 'Dr. Grace Boateng',
      email: 'hod.chemeng@university.edu',
      username: 'hod_chemeng',
      password: 'Hod@123',
      role: 'hod',
      staffId: 'HOD002',
      position: 'Head of Department',
      faculty: facEngineering._id.toString(),
    });

    const hodCivilEng = await User.create({
      name: 'Dr. Michael Asante',
      email: 'hod.civileng@university.edu',
      username: 'hod_civileng',
      password: 'Hod@123',
      role: 'hod',
      staffId: 'HOD003',
      position: 'Head of Department',
      faculty: facEngineering._id.toString(),
    });

    const hodComputerScience = await User.create({
      name: 'Dr. Michael Chen',
      email: 'hod.cs@university.edu',
      username: 'hod_cs',
      password: 'Hod@123',
      role: 'hod',
      staffId: 'HOD004',
      position: 'Head of Department',
      faculty: facAppliedSciences._id.toString(),
    });

    const hodElectricalEng = await User.create({
      name: 'Dr. Amara Diallo',
      email: 'hod.ee@university.edu',
      username: 'hod_ee',
      password: 'Hod@123',
      role: 'hod',
      staffId: 'HOD005',
      position: 'Head of Department',
      faculty: facEngineering._id.toString(),
    });

    const hodMechanicalEng = await User.create({
      name: 'Dr. Robert Kwame',
      email: 'hod.mecheng@university.edu',
      username: 'hod_mecheng',
      password: 'Hod@123',
      role: 'hod',
      staffId: 'HOD006',
      position: 'Head of Department',
      faculty: facEngineering._id.toString(),
    });

    const hodAccountancy = await User.create({
      name: 'Dr. Linda Owusu',
      email: 'hod.account@university.edu',
      username: 'hod_account',
      password: 'Hod@123',
      role: 'hod',
      staffId: 'HOD007',
      position: 'Head of Department',
      faculty: facBusiness._id.toString(),
    });

    const hodMarketing = await User.create({
      name: 'Prof. Janet Fraser',
      email: 'hod.marketing@university.edu',
      username: 'hod_marketing',
      password: 'Hod@123',
      role: 'hod',
      staffId: 'HOD008',
      position: 'Head of Department',
      faculty: facBusiness._id.toString(),
    });

    const hodProcurement = await User.create({
      name: 'Dr. Samuel Adams',
      email: 'hod.procurement@university.edu',
      username: 'hod_procurement',
      password: 'Hod@123',
      role: 'hod',
      staffId: 'HOD009',
      position: 'Head of Department',
      faculty: facBusiness._id.toString(),
    });

    const hodIT = await User.create({
      name: 'Dr. Peter Nkyekyer',
      email: 'hod.it@university.edu',
      username: 'hod_it',
      password: 'Hod@123',
      role: 'hod',
      staffId: 'HOD010',
      position: 'Head of Department',
      faculty: facAppliedSciences._id.toString(),
    });

    const hodLabTech = await User.create({
      name: 'Dr. Mary Osei',
      email: 'hod.labtech@university.edu',
      username: 'hod_labtech',
      password: 'Hod@123',
      role: 'hod',
      staffId: 'HOD011',
      position: 'Head of Department',
      faculty: facAppliedSciences._id.toString(),
    });

    const hodHospitality = await User.create({
      name: 'Dr. Ruth Akoto',
      email: 'hod.hospitality@university.edu',
      username: 'hod_hospitality',
      password: 'Hod@123',
      role: 'hod',
      staffId: 'HOD012',
      position: 'Head of Department',
      faculty: facAppliedSciences._id.toString(),
    });

    // === LECTURERS (created individually for password hashing) ===
    const lecturer1 = await User.create({
      name: 'Dr. Jane Smith',
      email: 'j.smith@university.edu',
      username: 'jsmith',
      password: 'Staff@123',
      role: 'lecturer',
      staffId: 'LEC001',
      position: 'Senior Lecturer',
      faculty: facEngineering._id.toString(),
    });
    const lecturer2 = await User.create({
      name: 'Mr. David Asante',
      email: 'd.asante@university.edu',
      username: 'dasante',
      password: 'Staff@123',
      role: 'lecturer',
      staffId: 'LEC002',
      position: 'Lecturer',
      faculty: facEngineering._id.toString(),
    });
    const lecturer3 = await User.create({
      name: 'Dr. Sarah Kofi',
      email: 's.kofi@university.edu',
      username: 'skofi',
      password: 'Staff@123',
      role: 'lecturer',
      staffId: 'LEC003',
      position: 'Lecturer',
      faculty: facBusiness._id.toString(),
    });
    const lecturer4 = await User.create({
      name: 'Mr. John Doe',
      email: 'j.doe@university.edu',
      username: 'jdoe',
      password: 'Staff@123',
      role: 'lecturer',
      staffId: 'LEC004',
      position: 'Assistant Lecturer',
      faculty: facAppliedSciences._id.toString(),
    });
    const lecturer5 = await User.create({
      name: 'Ms. Emily White',
      email: 'e.white@university.edu',
      username: 'ewhite',
      password: 'Staff@123',
      role: 'lecturer',
      staffId: 'LEC005',
      position: 'Lecturer',
      faculty: facEngineering._id.toString(),
    });
    const lecturers = [lecturer1, lecturer2, lecturer3, lecturer4, lecturer5];

    // === ADMINISTRATIVE OFFICES STAFF ===
    const qaOfficer = await User.create({
      name: 'Ms. Linda Owusu',
      email: 'qa@university.edu',
      username: 'qa_officer',
      password: 'Staff@123',
      role: 'quality_assurance',
      staffId: 'QA001',
      position: 'Quality Assurance Officer',
    });

    const qaOfficer2 = await User.create({
      name: 'Dr. Andrew Mensah',
      email: 'qa2@university.edu',
      username: 'qa_officer2',
      password: 'Staff@123',
      role: 'quality_assurance',
      staffId: 'QA002',
      position: 'Senior QA Officer',
    });

    const admissionsOfficer = await User.create({
      name: 'Mr. Robert Agyei',
      email: 'admissions@university.edu',
      username: 'admissions',
      password: 'Staff@123',
      role: 'admissions',
      staffId: 'ADM002',
      position: 'Admissions Officer',
    });

    const admissionsOfficer2 = await User.create({
      name: 'Mrs. Charlotte Ntim',
      email: 'admissions2@university.edu',
      username: 'admissions2',
      password: 'Staff@123',
      role: 'admissions',
      staffId: 'ADM003',
      position: 'Senior Admissions Officer',
    });

    const academicAffairs = await User.create({
      name: 'Dr. Grace Boateng',
      email: 'academic.affairs@university.edu',
      username: 'academic_affairs',
      password: 'Staff@123',
      role: 'academic_affairs',
      staffId: 'AA001',
      position: 'Academic Affairs Officer',
    });

    const academicAffairs2 = await User.create({
      name: 'Prof. Thomas Osei',
      email: 'academic2@university.edu',
      username: 'academic_affairs2',
      password: 'Staff@123',
      role: 'academic_affairs',
      staffId: 'AA002',
      position: 'Director of Academic Affairs',
    });

    const counselor = await User.create({
      name: 'Ms. Abena Frimpong',
      email: 'counseling@university.edu',
      username: 'counselor',
      password: 'Staff@123',
      role: 'counseling',
      staffId: 'COU001',
      position: 'Student Counselor',
    });

    const counselor2 = await User.create({
      name: 'Dr. Joseph Agyeman',
      email: 'counseling2@university.edu',
      username: 'counselor2',
      password: 'Staff@123',
      role: 'counseling',
      staffId: 'COU002',
      position: 'Senior Counselor',
    });

    const srcPresident = await User.create({
      name: 'Mr. Kwame Asiedu',
      email: 'src@university.edu',
      username: 'src_president',
      password: 'Staff@123',
      role: 'src',
      staffId: 'SRC001',
      position: 'SRC President',
    });

    const financeOfficer = await User.create({
      name: 'Mr. Charles Amponsah',
      email: 'finance@university.edu',
      username: 'finance',
      password: 'Staff@123',
      role: 'finance',
      staffId: 'FIN001',
      position: 'Finance Officer',
    });

    // === STUDENTS (created individually to trigger password hashing) ===
    const student1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice.j@student.university.edu',
      username: 'alice_j',
      password: 'Student@123',
      role: 'student',
      faculty: facAppliedSciences._id.toString(), // Computer Science is in Faculty of Applied Sciences & Technology
    });
    const student2 = await User.create({
      name: 'Bob Mensah',
      email: 'bob.m@student.university.edu',
      username: 'bob_m',
      password: 'Student@123',
      role: 'student',
      faculty: facEngineering._id.toString(),
    });
    const student3 = await User.create({
      name: 'Clara Osei',
      email: 'clara.o@student.university.edu',
      username: 'clara_o',
      password: 'Student@123',
      role: 'student',
      faculty: facBusiness._id.toString(),
    });
    const student4 = await User.create({
      name: 'David Kwaku',
      email: 'david.k@student.university.edu',
      username: 'david_k',
      password: 'Student@123',
      role: 'student',
      faculty: facAppliedSciences._id.toString(),
    });
    const student5 = await User.create({
      name: 'Eva Amponsah',
      email: 'eva.a@student.university.edu',
      username: 'eva_a',
      password: 'Student@123',
      role: 'student',
      faculty: facBusiness._id.toString(),
    });
    const students = [student1, student2, student3, student4, student5];

    console.log('👥 Users created (Deans, HODs, Lecturers, Admin Staff, Students)');

    // ── 3. Update Faculties with Deans ───────────────────────────
    await Faculty.findByIdAndUpdate(facEngineering._id, { dean: deanEngineering._id });
    await Faculty.findByIdAndUpdate(facBusiness._id, { dean: deanBusiness._id });
    await Faculty.findByIdAndUpdate(facAppliedSciences._id, { dean: deanAppliedSciences._id });
    console.log('🔗 Faculty deans linked');

    // ── 4. Create ALL DEPARTMENTS ───────────────────────────────────
    const departments = await Department.insertMany([
      // Faculty of Engineering - 5 Departments
      { name: 'Agricultural Engineering', code: 'AGRE', faculty: facEngineering._id, hod: hodAgriculturalEng._id },
      { name: 'Chemical Engineering', code: 'CHRE', faculty: facEngineering._id, hod: hodChemicalEng._id },
      { name: 'Civil Engineering', code: 'CIVE', faculty: facEngineering._id, hod: hodCivilEng._id },
      { name: 'Electrical & Electronic Engineering', code: 'EEEE', faculty: facEngineering._id, hod: hodElectricalEng._id },
      { name: 'Mechanical Engineering', code: 'MECE', faculty: facEngineering._id, hod: hodMechanicalEng._id },

      // Faculty of Business & Management Studies - 5 Departments
      { name: 'Accountancy', code: 'ACCT', faculty: facBusiness._id, hod: hodAccountancy._id },
      { name: 'Marketing', code: 'MKTG', faculty: facBusiness._id, hod: hodMarketing._id },
      { name: 'Procurement & Supply Chain Management', code: 'PSCM', faculty: facBusiness._id, hod: hodProcurement._id },
      { name: 'Secretaryship & Management Studies', code: 'SMS', faculty: facBusiness._id, hod: null },
      { name: 'Statistics', code: 'STAT', faculty: facBusiness._id, hod: null },

      // Faculty of Applied Sciences & Technology - 6 Departments
      { name: 'Computer Science', code: 'CSEN', faculty: facAppliedSciences._id, hod: hodComputerScience._id },
      { name: 'Hospitality Management', code: 'HOSP', faculty: facAppliedSciences._id, hod: hodHospitality._id },
      { name: 'Information Technology', code: 'INFO', faculty: facAppliedSciences._id, hod: hodIT._id },
      { name: 'Laboratory Technology', code: 'LABT', faculty: facAppliedSciences._id, hod: hodLabTech._id },
      { name: 'Fashion Design & Textile Studies', code: 'FDTS', faculty: facAppliedSciences._id, hod: null },
      { name: 'Science Laboratory Technology', code: 'SLT', faculty: facAppliedSciences._id, hod: null },

      // Faculty of Student Affairs - Units (treated as departments)
      { name: 'Dean of Students Office', code: 'DSO', faculty: facStudentAffairs._id, hod: null },
      { name: 'Student Welfare', code: 'SWEL', faculty: facStudentAffairs._id, hod: null },
      { name: 'Accommodation Office', code: 'ACCO', faculty: facStudentAffairs._id, hod: null },
      { name: 'Campus Life', code: 'CPLF', faculty: facStudentAffairs._id, hod: null },
      { name: 'Health Services', code: 'HLTH', faculty: facStudentAffairs._id, hod: null },
    ]);
    console.log('🏢 21 Departments created');

    // ── 5. Update HODs with department string ────────────────────
    const hodUsers = [
      { user: hodAgriculturalEng, dept: departments[0] },
      { user: hodChemicalEng, dept: departments[1] },
      { user: hodCivilEng, dept: departments[2] },
      { user: hodComputerScience, dept: departments[10] },
      { user: hodElectricalEng, dept: departments[3] },
      { user: hodMechanicalEng, dept: departments[4] },
      { user: hodAccountancy, dept: departments[5] },
      { user: hodMarketing, dept: departments[6] },
      { user: hodProcurement, dept: departments[7] },
      { user: hodIT, dept: departments[12] },
      { user: hodLabTech, dept: departments[13] },
      { user: hodHospitality, dept: departments[11] },
    ];

    for (const { user, dept } of hodUsers) {
      await User.findByIdAndUpdate(user._id, { department: dept._id.toString() });
    }

    // Update lecturers with departments
    await User.findByIdAndUpdate(lecturers[0]._id, { department: departments[10]._id.toString() });
    await User.findByIdAndUpdate(lecturers[1]._id, { department: departments[4]._id.toString() });
    await User.findByIdAndUpdate(lecturers[2]._id, { department: departments[6]._id.toString() });
    await User.findByIdAndUpdate(lecturers[3]._id, { department: departments[12]._id.toString() });
    await User.findByIdAndUpdate(lecturers[4]._id, { department: departments[10]._id.toString() });

    // Update students with departments
    await User.findByIdAndUpdate(students[0]._id, { department: departments[10]._id.toString() });
    await User.findByIdAndUpdate(students[1]._id, { department: departments[4]._id.toString() });
    await User.findByIdAndUpdate(students[2]._id, { department: departments[6]._id.toString() });
    await User.findByIdAndUpdate(students[3]._id, { department: departments[12]._id.toString() });
    await User.findByIdAndUpdate(students[4]._id, { department: departments[7]._id.toString() });
    console.log('🔗 User departments linked');

// ── 5b. Create Counseling Sessions ───────────────────────────
    const { CounselingSession } = require('./models/Counseling');
    
    // Import or define the schema inline for seed
    const counselingSessionSchema = new mongoose.Schema({
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      counselor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      date: { type: Date, required: true },
      time: { type: String, required: true },
      type: { type: String, enum: ['Individual Session', 'Stress Management', 'Career Guidance', 'Follow-up'], required: true },
      status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
      appointmentStatus: { type: String, enum: ['pending', 'accepted', 'rejected', 'rescheduled'], default: 'pending' },
      notes: { type: String, default: '' },
      counselorNotes: { type: String, default: '' },
      newDate: { type: Date, default: null },
      newTime: { type: String, default: null },
    }, { timestamps: true });
    
    const CounselingSessionModel = mongoose.models.CounselingSession || mongoose.model('CounselingSession', counselingSessionSchema);
    
    // Clear existing counseling sessions
    await CounselingSessionModel.deleteMany({});
    
    // Create sample counseling sessions distributed among both counselors
    await CounselingSessionModel.insertMany([
      {
        student: student1._id,
        counselor: counselor._id, // Ms. Abena Frimpong
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        time: '10:00 AM',
        type: 'Individual Session',
        status: 'upcoming',
        appointmentStatus: 'pending',
        notes: 'Discussing academic stress and time management',
      },
      {
        student: student1._id,
        counselor: counselor._id, // Ms. Abena Frimpong
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        time: '2:00 PM',
        type: 'Follow-up',
        status: 'upcoming',
        appointmentStatus: 'accepted',
        notes: 'Follow-up session from previous meeting',
      },
      {
        student: student2._id,
        counselor: counselor2._id, // Dr. Joseph Agyeman
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        time: '11:00 AM',
        type: 'Stress Management',
        status: 'upcoming',
        appointmentStatus: 'pending',
        notes: 'Need help with exam anxiety',
      },
      {
        student: student3._id,
        counselor: counselor._id, // Ms. Abena Frimpong
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        time: '9:00 AM',
        type: 'Career Guidance',
        status: 'upcoming',
        appointmentStatus: 'accepted',
        notes: 'Career counseling for final year students',
      },
      {
        student: student4._id,
        counselor: counselor2._id, // Dr. Joseph Agyeman
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        time: '3:00 PM',
        type: 'Individual Session',
        status: 'upcoming',
        appointmentStatus: 'pending',
        notes: 'Personal issues affecting studies',
      },
      {
        student: student5._id,
        counselor: counselor2._id, // Dr. Joseph Agyeman
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        time: '1:00 PM',
        type: 'Stress Management',
        status: 'upcoming',
        appointmentStatus: 'accepted',
        notes: 'Managing workload and personal stress',
      },
    ]);
    console.log('🗣️  Counseling sessions created');

    // ── 6. Create Sample Feedback ─────────
    const now = new Date();
    const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000);

    await Feedback.insertMany([
      {
        title: 'Lecturer frequently cancels classes without notice',
        description: 'Dr. Smith has cancelled 4 out of 8 scheduled lectures this semester.',
        category: 'course_related',
        status: 'routed',
        priority: 'high',
        routedTo: 'hod',
        submittedBy: students[0]._id,
        assignedTo: hodComputerScience._id,
        isAnonymous: false,
        department: departments[10]._id.toString(),
        faculty: facAppliedSciences._id.toString(),
        routedAt: daysAgo(2),
        createdAt: daysAgo(2),
      },
      {
        title: 'Computer lab computers are outdated',
        description: 'The computers in Lab 201 are very old and cannot run modern software.',
        category: 'course_related',
        status: 'in_progress',
        priority: 'medium',
        routedTo: 'hod',
        submittedBy: students[0]._id,
        assignedTo: hodComputerScience._id,
        department: departments[10]._id.toString(),
        faculty: facAppliedSciences._id.toString(),
        routedAt: daysAgo(5),
        createdAt: daysAgo(5),
      },
      {
        title: 'Timetable conflict for final year courses',
        description: 'Two required courses have overlapping lecture times.',
        category: 'course_related',
        status: 'routed',
        priority: 'high',
        routedTo: 'hod',
        submittedBy: students[1]._id,
        assignedTo: hodElectricalEng._id,
        department: departments[3]._id.toString(),
        faculty: facEngineering._id.toString(),
        routedAt: daysAgo(1),
        createdAt: daysAgo(1),
      },
      {
        title: 'Need more practical examples in marketing lectures',
        description: 'We need more case studies and real-world examples.',
        category: 'course_related',
        status: 'resolved',
        priority: 'low',
        routedTo: 'hod',
        submittedBy: students[4]._id,
        assignedTo: hodMarketing._id,
        department: departments[7]._id.toString(),
        faculty: facBusiness._id.toString(),
        routedAt: daysAgo(10),
        resolvedAt: daysAgo(5),
        resolvedBy: hodMarketing._id,
        createdAt: daysAgo(10),
      },
      {
        title: 'Hostel accommodation allocation issues',
        description: 'Students who applied for on-campus accommodation have not received any response.',
        category: 'welfare',
        status: 'routed',
        priority: 'urgent',
        routedTo: 'dean_students',
        submittedBy: students[1]._id,
        assignedTo: deanStudentAffairs._id,
        department: departments[16]._id.toString(),
        routedAt: daysAgo(1),
        createdAt: daysAgo(1),
      },
      {
        title: 'Admission letter not received after acceptance',
        description: 'I accepted my offer 3 weeks ago but have not received my official admission letter.',
        category: 'admission',
        status: 'in_progress',
        priority: 'high',
        routedTo: 'admissions',
        submittedBy: students[0]._id,
        assignedTo: admissionsOfficer._id,
        routedAt: daysAgo(3),
        createdAt: daysAgo(3),
      },
      {
        title: 'Examination hall conditions are substandard',
        description: 'The main examination hall has broken air conditioning.',
        category: 'quality',
        status: 'routed',
        priority: 'high',
        routedTo: 'quality_assurance',
        submittedBy: students[0]._id,
        assignedTo: qaOfficer._id,
        routedAt: daysAgo(2),
        createdAt: daysAgo(2),
      },
      {
        title: 'Struggling with academic pressure and anxiety',
        description: 'I need counseling support for academic stress.',
        category: 'mental_health',
        status: 'in_progress',
        priority: 'urgent',
        routedTo: 'counseling',
        submittedBy: null,
        assignedTo: counselor._id,
        isAnonymous: true,
        routedAt: daysAgo(1),
        createdAt: daysAgo(1),
      },
      {
        title: 'Student portal frequently crashes',
        description: 'The student portal is often unavailable during registration.',
        category: 'system',
        status: 'in_progress',
        priority: 'high',
        routedTo: 'admin',
        submittedBy: students[3]._id,
        assignedTo: admin._id,
        routedAt: daysAgo(2),
        createdAt: daysAgo(2),
      },
      {
        title: 'Inconsistent grading standards across departments',
        description: 'Students in different departments are graded on very different scales.',
        category: 'faculty_wide',
        status: 'in_progress',
        priority: 'high',
        routedTo: 'dean_faculty',
        submittedBy: students[0]._id,
        assignedTo: deanEngineering._id,
        faculty: facEngineering._id.toString(),
        routedAt: daysAgo(5),
        createdAt: daysAgo(5),
      },
    ]);
    console.log('📝 Sample feedback created');

    // ── Summary ──────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ SEED COMPLETE');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📋 INSTITUTIONAL STRUCTURE');
    console.log('─────────────────────────────────────────────────');
    console.log('🏛️  FACULTIES (4):');
    console.log('   1. Faculty of Engineering (ENG)');
    console.log('   2. Faculty of Business & Management Studies (BMS)');
    console.log('   3. Faculty of Applied Sciences & Technology (AST)');
    console.log('   4. Faculty of Student Affairs (SA)');
    console.log('\n🏢 DEPARTMENTS (21)');
    console.log('\n👥 ROLES POPULATED');
    console.log('   - System Admin (IT Support)');
    console.log('   - 4 Deans of Faculty');
    console.log('   - 12 HODs');
    console.log('   - 5 Lecturers');
    console.log('   - Quality Assurance, Admissions, Academic Affairs, Counseling, SRC, Finance');
    console.log('   - 5 Students');
    console.log('\n📋 LOGIN CREDENTIALS');
    console.log('─────────────────────────────────────────────────');
    console.log('SYSTEM ADMIN: admin@university.edu / Admin@123');
    console.log('DEAN: dean.eng@university.edu / Dean@123');
    console.log('HOD: hod.cs@university.edu / Hod@123');
    console.log('QA: qa@university.edu / Staff@123');
    console.log('STUDENT: alice.j@student.university.edu / Student@123');
    console.log('═══════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
