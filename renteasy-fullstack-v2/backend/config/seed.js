// config/seed.js — Seeds MongoDB with all 6 RentEasy properties
require('dotenv').config({ path: require('path').join(__dirname,'../.env') });
const mongoose = require('mongoose');
const { User, Property, Room, Tenant, Payment, Expense, AuditLog, Maintenance, Visitor } = require('../models');

const MONGO_URI = process.env.MONGODB_URI;

// ─────────────────────────────────────────────────────────────────
const PROPERTIES = [
  {
    name: 'Green Meadows', type: 'Homes / Apartments', subtype: 'Premium Residential',
    emoji: '🌿', gradient: 'linear-gradient(135deg,#064E3B,#065F46)', accentColor: '#10B981',
    description: 'Premium 18-unit residential complex with landscaped gardens and 24/7 security.',
    address: '12, 4th Main, Koramangala 5th Block', city: 'Bengaluru', pincode: '560095', state: 'Karnataka',
    floors: 4, totalUnits: 18, amenities: ['Parking','Power backup','24/7 Security','Lift','Garden','CCTV'],
    manager: 'Suresh Kumar', managerPhone: '+91 98765 43210', rating: 4.6, ratingCount: 28,
  },
  {
    name: 'Sunrise Residency', type: 'PG / Hostel', subtype: 'Paying Guest Accommodation',
    emoji: '🌅', gradient: 'linear-gradient(135deg,#7C2D12,#9A3412)', accentColor: '#F59E0B',
    description: 'Fully furnished PG for working professionals. Meals, laundry, and Wi-Fi included.',
    address: '45, 27th Main, HSR Layout Sector 2', city: 'Bengaluru', pincode: '560102', state: 'Karnataka',
    floors: 3, totalUnits: 24, amenities: ['Meals included','Wi-Fi','Laundry','CCTV','Power backup'],
    manager: 'Lakshmi Devi', managerPhone: '+91 97654 32109', rating: 4.3, ratingCount: 42,
  },
  {
    name: 'Royal Heights', type: 'Homes / Apartments', subtype: 'Luxury Apartments',
    emoji: '👑', gradient: 'linear-gradient(135deg,#312E81,#3730A3)', accentColor: '#8B5CF6',
    description: 'Luxury apartments in prime Hyderabad. Swimming pool, gym, and concierge services.',
    address: '8-2-293, Road No. 78, Banjara Hills', city: 'Hyderabad', pincode: '500034', state: 'Telangana',
    floors: 5, totalUnits: 16, amenities: ['Pool','Gym','Concierge','Power backup','Parking','CCTV'],
    manager: 'Rajesh Rao', managerPhone: '+91 95432 10987', rating: 4.8, ratingCount: 19,
  },
  {
    name: 'Lake View Villas', type: 'Villa', subtype: 'Independent Villas',
    emoji: '🏡', gradient: 'linear-gradient(135deg,#134E4A,#0F766E)', accentColor: '#14B8A6',
    description: 'Exclusive private villas with lake views. Each with private garden and 2-car parking.',
    address: 'Plot 12-15, Prestige Lake Ridge, Whitefield', city: 'Bengaluru', pincode: '560066', state: 'Karnataka',
    floors: 2, totalUnits: 8, amenities: ['Private garden','2 Parking','Lake view','Security','Club house'],
    manager: 'Kavitha Menon', managerPhone: '+91 93210 98765', rating: 4.9, ratingCount: 11,
  },
  {
    name: 'Golden Oak Apartments', type: 'Homes / Apartments', subtype: 'Family Apartments',
    emoji: '🌳', gradient: 'linear-gradient(135deg,#713F12,#92400E)', accentColor: '#EAB308',
    description: 'Well-maintained family apartments near schools and hospitals in Anna Nagar.',
    address: '22, 3rd Avenue, Anna Nagar East', city: 'Chennai', pincode: '600040', state: 'Tamil Nadu',
    floors: 4, totalUnits: 12, amenities: ['Play area','Parking','Power backup','Security','Lift'],
    manager: 'Anand Krishnan', managerPhone: '+91 91098 76543', rating: 4.4, ratingCount: 23,
  },
  {
    name: 'Silver Springs', type: 'Commercial', subtype: 'Commercial Complex',
    emoji: '🏪', gradient: 'linear-gradient(135deg,#0F172A,#1E293B)', accentColor: '#0EA5E9',
    description: 'Prime commercial complex on MG Road. 100% occupied. High footfall location.',
    address: '44, MG Road, Brigade Road Junction', city: 'Bengaluru', pincode: '560001', state: 'Karnataka',
    floors: 3, totalUnits: 6, amenities: ['High footfall','Parking','Loading dock','Power backup','CCTV'],
    manager: 'Dinesh Shetty', managerPhone: '+91 89876 54321', rating: 4.7, ratingCount: 8,
  },
];

// Room templates per property
const ROOMS = {
  'Green Meadows': [
    { unit:'A-101', type:'2BHK', floor:1, status:'Occupied', rent:18500, deposit:55500, area:950 },
    { unit:'A-102', type:'2BHK', floor:1, status:'Occupied', rent:18500, deposit:55500, area:950 },
    { unit:'A-103', type:'3BHK', floor:1, status:'Vacant',   rent:26000, deposit:78000, area:1350 },
    { unit:'B-201', type:'2BHK', floor:2, status:'Occupied', rent:19000, deposit:57000, area:980 },
    { unit:'B-202', type:'3BHK', floor:2, status:'Occupied', rent:27000, deposit:81000, area:1400 },
    { unit:'C-301', type:'2BHK', floor:3, status:'Under Maintenance', rent:19500, deposit:58500, area:960 },
    { unit:'C-302', type:'3BHK', floor:3, status:'Occupied', rent:28000, deposit:84000, area:1420 },
    { unit:'D-401', type:'Studio',floor:4,status:'Occupied', rent:11000, deposit:33000, area:450 },
  ],
  'Sunrise Residency': [
    { unit:'R-01', type:'PG Room',     floor:1, status:'Occupied', rent:8000,  deposit:16000, area:200 },
    { unit:'R-02', type:'PG Room',     floor:1, status:'Occupied', rent:8000,  deposit:16000, area:200 },
    { unit:'R-03', type:'PG Room (AC)',floor:2, status:'Vacant',   rent:10500, deposit:21000, area:220 },
    { unit:'R-04', type:'PG Room (AC)',floor:2, status:'Occupied', rent:10500, deposit:21000, area:220 },
    { unit:'R-05', type:'PG Room (AC)',floor:3, status:'Vacant',   rent:10500, deposit:21000, area:220 },
  ],
  'Royal Heights': [
    { unit:'101',  type:'2BHK',     floor:1, status:'Occupied', rent:22000, deposit:66000,  area:1100 },
    { unit:'201',  type:'3BHK',     floor:2, status:'Occupied', rent:32000, deposit:96000,  area:1600 },
    { unit:'301',  type:'2BHK',     floor:3, status:'Vacant',   rent:24000, deposit:72000,  area:1150 },
    { unit:'PH1',  type:'3BHK',     floor:5, status:'Occupied', rent:55000, deposit:165000, area:2800 },
    { unit:'G-1',  type:'Storeroom',floor:0, status:'Under Maintenance', rent:5000, deposit:15000, area:300 },
  ],
  'Lake View Villas': [
    { unit:'V-1', type:'Villa', floor:2, status:'Occupied', rent:65000, deposit:195000, area:3200 },
    { unit:'V-2', type:'Villa', floor:2, status:'Occupied', rent:68000, deposit:204000, area:3400 },
    { unit:'V-3', type:'Villa', floor:2, status:'Occupied', rent:52000, deposit:156000, area:2800 },
  ],
  'Golden Oak Apartments': [
    { unit:'A-1', type:'2BHK', floor:1, status:'Occupied', rent:18000, deposit:54000, area:900 },
    { unit:'A-2', type:'2BHK', floor:1, status:'Occupied', rent:18000, deposit:54000, area:900 },
    { unit:'B-1', type:'3BHK', floor:2, status:'Vacant',   rent:26000, deposit:78000, area:1300 },
    { unit:'B-2', type:'3BHK', floor:2, status:'Occupied', rent:27000, deposit:81000, area:1350 },
  ],
  'Silver Springs': [
    { unit:'S-1', type:'Shop',  floor:0, status:'Occupied', rent:45000, deposit:270000, area:1800 },
    { unit:'S-2', type:'Shop',  floor:0, status:'Occupied', rent:52000, deposit:312000, area:2200 },
    { unit:'O-1', type:'Office',floor:1, status:'Occupied', rent:38000, deposit:228000, area:1400 },
    { unit:'O-2', type:'Office',floor:1, status:'Occupied', rent:28000, deposit:168000, area:1000 },
  ],
};

// Tenant templates
const TENANTS_BY_PROP = {
  'Green Meadows': [
    { name:'Rahul Sharma', phone:'+91 98765 11111', email:'rahul.s@email.com', unit:'A-101', rent:18500, deposit:55500, leaseStart:'2025-07-01', leaseEnd:'2026-06-30', dueDate:'1st', paidThisMonth:true },
    { name:'Priya Menon',  phone:'+91 98765 22222', email:'priya.m@email.com', unit:'A-102', rent:18500, deposit:55500, leaseStart:'2025-08-01', leaseEnd:'2026-07-31', dueDate:'1st', paidThisMonth:true },
    { name:'Arun Kumar',   phone:'+91 98765 33333', email:'arun.k@email.com',  unit:'B-201', rent:19000, deposit:57000, leaseStart:'2025-06-01', leaseEnd:'2026-05-31', dueDate:'5th', paidThisMonth:false },
    { name:'Deepa Nair',   phone:'+91 98765 44444', email:'deepa.n@email.com', unit:'B-202', rent:27000, deposit:81000, leaseStart:'2025-09-01', leaseEnd:'2026-08-31', dueDate:'3rd', paidThisMonth:true },
    { name:'Kavitha R',    phone:'+91 98765 55555', email:'kavitha.r@email.com',unit:'C-302', rent:28000, deposit:84000, leaseStart:'2026-01-01', leaseEnd:'2026-12-31', dueDate:'1st', paidThisMonth:true },
    { name:'Aarav Shah',   phone:'+91 98765 66666', email:'aarav.s@email.com', unit:'D-401', rent:11000, deposit:33000, leaseStart:'2026-03-01', leaseEnd:'2027-02-28', dueDate:'1st', paidThisMonth:true },
  ],
  'Sunrise Residency': [
    { name:'Sneha Rao',  phone:'+91 96543 11111', email:'sneha.r@email.com', unit:'R-01', rent:8000,  deposit:16000, leaseStart:'2026-03-01', leaseEnd:'2026-08-31', dueDate:'1st', paidThisMonth:true },
    { name:'Kiran P',    phone:'+91 96543 22222', email:'kiran.p@email.com', unit:'R-02', rent:8000,  deposit:16000, leaseStart:'2026-02-01', leaseEnd:'2026-07-31', dueDate:'1st', paidThisMonth:true },
    { name:'Meena Das',  phone:'+91 96543 33333', email:'meena.d@email.com', unit:'R-04', rent:10500, deposit:21000, leaseStart:'2026-04-01', leaseEnd:'2026-09-30', dueDate:'1st', paidThisMonth:false },
  ],
  'Royal Heights': [
    { name:'Vijay Reddy', phone:'+91 94321 11111', email:'vijay.r@email.com',  unit:'101', rent:22000, deposit:66000,  leaseStart:'2025-10-01', leaseEnd:'2026-09-30', dueDate:'5th',  paidThisMonth:true },
    { name:'Lakshmi Rao', phone:'+91 94321 22222', email:'lakshmi.r@email.com',unit:'201', rent:32000, deposit:96000,  leaseStart:'2025-11-01', leaseEnd:'2026-10-31', dueDate:'5th',  paidThisMonth:false },
    { name:'Arjun Mehta', phone:'+91 94321 33333', email:'arjun.m@email.com',  unit:'PH1', rent:55000, deposit:165000, leaseStart:'2024-07-01', leaseEnd:'2026-06-30', dueDate:'10th', paidThisMonth:true },
  ],
  'Lake View Villas': [
    { name:'Ramesh Iyer', phone:'+91 92109 11111', email:'ramesh.i@email.com', unit:'V-1', rent:65000, deposit:195000, leaseStart:'2025-01-01', leaseEnd:'2026-12-31', dueDate:'1st', paidThisMonth:true },
    { name:'Sunita Shah', phone:'+91 92109 22222', email:'sunita.s@email.com', unit:'V-2', rent:68000, deposit:204000, leaseStart:'2025-03-01', leaseEnd:'2027-02-28', dueDate:'1st', paidThisMonth:true },
    { name:'Prakash N',   phone:'+91 92109 33333', email:'prakash.n@email.com',unit:'V-3', rent:52000, deposit:156000, leaseStart:'2025-06-01', leaseEnd:'2026-05-31', dueDate:'1st', paidThisMonth:true },
  ],
  'Golden Oak Apartments': [
    { name:'Ravi K',  phone:'+91 90987 11111', email:'ravi.k@email.com',  unit:'A-1', rent:18000, deposit:54000, leaseStart:'2025-12-01', leaseEnd:'2026-11-30', dueDate:'3rd', paidThisMonth:true },
    { name:'Pooja A', phone:'+91 90987 22222', email:'pooja.a@email.com', unit:'A-2', rent:18000, deposit:54000, leaseStart:'2026-01-01', leaseEnd:'2026-12-31', dueDate:'3rd', paidThisMonth:true },
    { name:'Mani S',  phone:'+91 90987 33333', email:'mani.s@email.com',  unit:'B-2', rent:27000, deposit:81000, leaseStart:'2025-09-01', leaseEnd:'2026-08-31', dueDate:'3rd', paidThisMonth:false },
  ],
  'Silver Springs': [
    { name:'Reliance Fresh', phone:'+91 80 45678900', email:'mgroad@rf.com', unit:'S-1', rent:45000, deposit:270000, leaseStart:'2024-01-01', leaseEnd:'2026-12-31', dueDate:'5th', paidThisMonth:true },
    { name:'Decathlon',      phone:'+91 80 56789010', email:'mgroad@dc.in',  unit:'S-2', rent:52000, deposit:312000, leaseStart:'2024-06-01', leaseEnd:'2027-05-31', dueDate:'5th', paidThisMonth:true },
    { name:'TechCorp Pvt',   phone:'+91 80 67890120', email:'admin@tc.in',   unit:'O-1', rent:38000, deposit:228000, leaseStart:'2025-04-01', leaseEnd:'2027-03-31', dueDate:'5th', paidThisMonth:false },
    { name:'StartupHub',     phone:'+91 80 78901230', email:'info@sh.in',    unit:'O-2', rent:28000, deposit:168000, leaseStart:'2025-07-01', leaseEnd:'2026-06-30', dueDate:'5th', paidThisMonth:true },
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Wipe existing data
    await Promise.all([
      User.deleteMany({}), Property.deleteMany({}), Room.deleteMany({}),
      Tenant.deleteMany({}), Payment.deleteMany({}), Expense.deleteMany({}),
      AuditLog.deleteMany({}), Maintenance.deleteMany({}), Visitor.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User', email: process.env.ADMIN_EMAIL || 'admin@renteasy.in',
      password: process.env.ADMIN_PASSWORD || 'Admin@123', role: 'admin', phone: '+91 98000 00001',
    });
    console.log(`👑 Admin created: ${admin.email}`);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    for (const propData of PROPERTIES) {
      // Create property
      const prop = await Property.create(propData);
      console.log(`🏢 Created: ${prop.name}`);

      // Create rooms
      const roomDefs = ROOMS[prop.name] || [];
      const roomMap  = {};
      for (const rd of roomDefs) {
        const room = await Room.create({ ...rd, propertyId: prop._id });
        roomMap[rd.unit] = room._id;
      }

      // Create tenants + payments + expenses
      const tenantDefs = TENANTS_BY_PROP[prop.name] || [];
      for (const td of tenantDefs) {
        const tenant = await Tenant.create({
          ...td,
          propertyId: prop._id,
          roomId: roomMap[td.unit],
          leaseStart: new Date(td.leaseStart),
          leaseEnd:   new Date(td.leaseEnd),
        });

        // Create a payment record for this month if paid
        if (td.paidThisMonth) {
          await Payment.create({
            propertyId: prop._id, tenantId: tenant._id, roomId: roomMap[td.unit],
            tenantName: td.name, unit: td.unit, propertyName: prop.name,
            amount: td.rent, method: ['UPI','NEFT','Credit Card'][Math.floor(Math.random()*3)],
            status: 'Paid', month, year,
          });
        } else {
          await Payment.create({
            propertyId: prop._id, tenantId: tenant._id, roomId: roomMap[td.unit],
            tenantName: td.name, unit: td.unit, propertyName: prop.name,
            amount: td.rent, method: null, status: 'Pending', month, year,
          });
        }
      }

      // Create sample expenses
      const expCategories = [
        { category:'Electricity', description:'Common area power bill', amount: Math.floor(Math.random()*10000)+5000 },
        { category:'Security',    description:'Security staff salary',  amount: Math.floor(Math.random()*8000)+12000 },
        { category:'Cleaning',    description:'Monthly cleaning service',amount: Math.floor(Math.random()*3000)+3000 },
      ];
      for (const e of expCategories) {
        await Expense.create({ ...e, propertyId: prop._id, month, year, date: new Date() });
      }

      // Maintenance (Green Meadows only)
      if (prop.name === 'Green Meadows') {
        await Maintenance.create({
          propertyId: prop._id, unit:'C-301', issue:'Electrical short circuit',
          category:'Electrical', priority:'High', status:'Pending',
        });
        await Maintenance.create({
          propertyId: prop._id, unit:'A-102', issue:'Shower not working',
          category:'Plumbing', priority:'Medium', status:'In Progress',
        });
      }
    }

    // Audit log
    await AuditLog.create({ userName:'System', action:'Database seeded', detail:'All 6 properties + tenants + payments created', icon:'🌱' });

    console.log('\n🎉 Seed complete!\n');
    console.log('──────────────────────────────────────────');
    console.log('  Admin login: admin@renteasy.in');
    console.log('  Password:    Admin@123');
    console.log('──────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
