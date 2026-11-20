/** npm run seed  ->  creates the admin account, sample products and default landing content (safe to re-run). */
const env = require('../config/env');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Content = require('../models/Content');
const defaults = require('../services/defaultContent');

const products = [
  {
    title: 'Career Roadmap Starter Pack', slug: 'career-roadmap-starter-pack', category: 'roadmap', price: 199, compareAtPrice: 499, isFeatured: true,
    tagline: 'Know which career paths exist and what to learn first.',
    description: 'A structured set of career roadmaps for popular entry-level roles, with skills, learning order, projects and timelines.',
    features: ['10+ role-based roadmaps', 'Skills checklist per role', 'Suggested learning order', 'Project ideas for your portfolio'],
  },
  {
    title: 'Job-Role Learning Guide', slug: 'job-role-learning-guide', category: 'guide', price: 149, compareAtPrice: 299, isFeatured: true,
    tagline: 'Everything you need to become job-ready for one role.',
    description: 'Deep-dive guide for a single job role: tools, concepts, practice tasks and how recruiters evaluate candidates.',
    features: ['Skills and tools breakdown', 'Practice tasks', 'Resume tips for the role'],
  },
  {
    title: 'Interview Preparation Kit (Free)', slug: 'interview-preparation-kit-free', category: 'interview', price: 0, isFeatured: true,
    tagline: 'Free resources to prepare for your first interviews.',
    description: 'Common questions, answering frameworks and a self-evaluation sheet to practise before real interviews.',
    features: ['Common HR and technical questions', 'Answer frameworks', 'Self-evaluation sheet'],
  },
  {
    title: 'Career Planning Workbook', slug: 'career-planning-workbook', category: 'planning', price: 99,
    tagline: 'Plan the next 12 months with clarity.',
    description: 'A printable workbook to map interests, strengths, goals and a monthly action plan.',
    features: ['Self-assessment exercises', '12-month action planner', 'Goal tracking templates'],
  },
];

(async () => {
  await connectDB();

  let admin = await User.findOne({ email: env.admin.email.toLowerCase() });
  if (!admin) {
    admin = await User.create({ name: env.admin.name, email: env.admin.email, phone: env.admin.phone, password: env.admin.password, role: 'admin' });
    console.log(`Admin created: ${admin.email}  (change the password after first login)`);
  } else console.log(`Admin exists: ${admin.email}`);

  for (const p of products) {
    // Placeholder link so the unlock flow can be tested. Replace in Admin -> Products.
    const exists = await Product.findOne({ slug: p.slug });
    if (!exists) await Product.create({ ...p, deliveryType: 'link', externalUrl: 'https://example.com/replace-with-your-content' });
  }
  console.log(`Products ready: ${await Product.countDocuments()}`);

  await Content.updateOne({ key: 'home' }, { $setOnInsert: { key: 'home', data: defaults } }, { upsert: true });
  console.log('Landing content ready');

  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
