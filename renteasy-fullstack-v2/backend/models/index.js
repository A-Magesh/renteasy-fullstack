// models/index.js — All RentEasy Mongoose Models
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────────────────────────
// USER MODEL
// ─────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  phone:    { type: String },
  password: { type: String, required: true, select: false },
  role:     { type: String, enum: ['admin','manager','tenant'], default: 'tenant' },
  avatar:   { type: String },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  unitNumber: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin:{ type: Date },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = async function(plain) {
  return bcrypt.compare(plain, this.password);
};
userSchema.methods.toSafe = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ─────────────────────────────────────────────────────────────────
// PROPERTY MODEL
// ─────────────────────────────────────────────────────────────────
const propertySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  type:        { type: String, enum: ['Homes / Apartments','PG / Hostel','Commercial','Villa','Mixed Use'], required: true },
  subtype:     { type: String },
  emoji:       { type: String, default: '🏢' },
  gradient:    { type: String, default: 'linear-gradient(135deg,#0EA5E9,#0284C7)' },
  accentColor: { type: String, default: '#0EA5E9' },
  description: { type: String },
  address:     { type: String, required: true },
  city:        { type: String, required: true },
  pincode:     { type: String },
  state:       { type: String },
  location:    {
    lat:  { type: Number },
    lng:  { type: Number },
    mapUrl:{ type: String },
    nearbyLandmarks: [String],
  },
  floors:      { type: Number, default: 1 },
  totalUnits:  { type: Number, default: 0 },
  amenities:   [String],
  images:      [String],
  manager:     { type: String },
  managerPhone:{ type: String },
  managerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating:      { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true } });

propertySchema.virtual('occupied').get(function() { return 0; }); // computed at query time

// ─────────────────────────────────────────────────────────────────
// ROOM MODEL
// ─────────────────────────────────────────────────────────────────
const roomSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  unit:    { type: String, required: true },
  type:    { type: String, enum: ['Studio','1BHK','2BHK','3BHK','4BHK','PG Room','PG Room (AC)','Shop','Office','Villa','Storeroom','Other'], default: '2BHK' },
  floor:   { type: Number, default: 0 },
  status:  { type: String, enum: ['Vacant','Occupied','Reserved','Under Maintenance','Cleaning'], default: 'Vacant' },
  rent:    { type: Number, required: true },
  deposit: { type: Number, default: 0 },
  area:    { type: Number }, // sq ft
  amenities:[String],
  images:  [String],
  notes:   { type: String },
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────────
// TENANT MODEL
// ─────────────────────────────────────────────────────────────────
const tenantSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  roomId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:       { type: String, required: true },
  email:      { type: String },
  phone:      { type: String, required: true },
  unit:       { type: String },
  rent:       { type: Number, required: true },
  deposit:    { type: Number, default: 0 },
  depositRefunded: { type: Boolean, default: false },
  deductions: { type: Number, default: 0 },
  leaseStart: { type: Date, required: true },
  leaseEnd:   { type: Date, required: true },
  dueDate:    { type: String, default: '1st' },
  paidThisMonth: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
  // Tenant documents
  documents:  [{
    type:   { type: String, enum: ['Aadhaar','PAN','Passport','Driving Licence','Rental Agreement','Other'] },
    url:    String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  // Feedback/ratings
  feedback: [{
    cleanliness:  Number, maintenance: Number,
    security:     Number, facilities:  Number,
    overall:      Number, comment:     String,
    createdAt: { type: Date, default: Date.now },
  }],
  // Previous tenant history auto-filled on deactivation
  reasonForLeaving: String,
  vacatedAt: Date,
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────────
// PAYMENT MODEL
// ─────────────────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  tenantId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  roomId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  tenantName: { type: String },
  unit:       { type: String },
  propertyName:{ type: String },
  amount:     { type: Number, required: true },
  gst:        { type: Number, default: 0 },
  method:     { type: String, enum: ['UPI','Credit Card','Debit Card','Net Banking','NEFT','Cheque','Cash'], required: true },
  status:     { type: String, enum: ['Paid','Pending','Overdue','Refunded'], default: 'Paid' },
  txnId:      { type: String, unique: true, sparse: true },
  month:      { type: Number }, // 1-12
  year:       { type: Number },
  notes:      { type: String },
  receiptUrl: { type: String },
  paidAt:     { type: Date, default: Date.now },
}, { timestamps: true });

paymentSchema.pre('save', function(next) {
  if (!this.txnId) {
    this.txnId = 'RE' + Date.now().toString(36).toUpperCase() + uuidv4().slice(0,6).toUpperCase();
  }
  if (!this.month) this.month = new Date().getMonth() + 1;
  if (!this.year)  this.year  = new Date().getFullYear();
  next();
});

// ─────────────────────────────────────────────────────────────────
// MAINTENANCE MODEL
// ─────────────────────────────────────────────────────────────────
const maintenanceSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  tenantId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  tenantName: { type: String },
  unit:       { type: String },
  issue:      { type: String, required: true },
  category:   { type: String, enum: ['Electrical','Plumbing','Wi-Fi','Cleaning','Renovation','Other'], required: true },
  priority:   { type: String, enum: ['High','Medium','Low'], default: 'Medium' },
  status:     { type: String, enum: ['Pending','In Progress','Completed'], default: 'Pending' },
  images:     [String],
  assignedTo: { type: String },
  resolvedAt: { type: Date },
  notes:      { type: String },
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────────
// VISITOR MODEL
// ─────────────────────────────────────────────────────────────────
const visitorSchema = new mongoose.Schema({
  propertyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  tenantId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  tenantName:   { type: String },
  unit:         { type: String },
  visitorName:  { type: String, required: true },
  phone:        { type: String, required: true },
  purpose:      { type: String },
  checkIn:      { type: Date, default: Date.now },
  checkOut:     { type: Date },
  status:       { type: String, enum: ['Inside','Checked Out'], default: 'Inside' },
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────────
// EXPENSE MODEL
// ─────────────────────────────────────────────────────────────────
const expenseSchema = new mongoose.Schema({
  propertyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  category:    { type: String, enum: ['Electricity','Water','Plumbing','Cleaning','Security','Staff Salary','Renovation','Internet','Other'], required: true },
  description: { type: String },
  amount:      { type: Number, required: true },
  date:        { type: Date, default: Date.now },
  month:       { type: Number },
  year:        { type: Number },
  receipt:     { type: String },
}, { timestamps: true });

expenseSchema.pre('save', function(next) {
  if (!this.month) this.month = this.date.getMonth() + 1;
  if (!this.year)  this.year  = this.date.getFullYear();
  next();
});

// ─────────────────────────────────────────────────────────────────
// AUDIT LOG MODEL
// ─────────────────────────────────────────────────────────────────
const auditSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  action:   { type: String, required: true },
  detail:   { type: String },
  icon:     { type: String, default: '📋' },
  model:    { type: String },
  recordId: { type: String },
  ip:       { type: String },
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────────
// NOTIFICATION MODEL
// ─────────────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title:      { type: String, required: true },
  message:    { type: String },
  type:       { type: String, enum: ['payment','maintenance','lease','tenant','system'], default: 'system' },
  isRead:     { type: Boolean, default: false },
  link:       { type: String },
}, { timestamps: true });

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────
module.exports = {
  User:         mongoose.model('User', userSchema),
  Property:     mongoose.model('Property', propertySchema),
  Room:         mongoose.model('Room', roomSchema),
  Tenant:       mongoose.model('Tenant', tenantSchema),
  Payment:      mongoose.model('Payment', paymentSchema),
  Maintenance:  mongoose.model('Maintenance', maintenanceSchema),
  Visitor:      mongoose.model('Visitor', visitorSchema),
  Expense:      mongoose.model('Expense', expenseSchema),
  AuditLog:     mongoose.model('AuditLog', auditSchema),
  Notification: mongoose.model('Notification', notificationSchema),
};
