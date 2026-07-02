/**
 * ZyraTech Hub — Production Database Seed Script
 * 
 * Run with: node prisma/seed.js
 * 
 * This script seeds:
 *   1. The first Super Admin account
 *   2. All default Settings (branding, email, payments, general)
 *   3. Default CMS pages (terms, privacy, about)
 * 
 * Safe to run multiple times — uses upsert logic so existing data is never overwritten.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

// ══════════════════════════════════════════════════════════════
// 1. SUPER ADMIN
// ══════════════════════════════════════════════════════════════
async function seedSuperAdmin() {
  const email = 'afedi@zyratech.com';
  const password = 'TempPassword123!';
  const name = 'Michael Afedi';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('  ✔ Super Admin already exists:', existing.email);
    return;
  }

  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  const hashedPassword = await bcrypt.hash(password, rounds);

  const superAdmin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'super_admin',
      accountStatus: 'active',
      department: 'Executive',
      permissions: [],
      mustChangePassword: false,
    },
  });

  console.log('');
  console.log('  ══════════════════════════════════════════');
  console.log('    🎉 SUPER ADMIN CREATED SUCCESSFULLY!');
  console.log('  ══════════════════════════════════════════');
  console.log('');
  console.log('    Email:    ', superAdmin.email);
  console.log('    Password: ', password);
  console.log('    Role:     ', superAdmin.role);
  console.log('');
  console.log('    ⚠️  CHANGE THIS PASSWORD IMMEDIATELY');
  console.log('       after your first login!');
  console.log('  ══════════════════════════════════════════');
  console.log('');
}

// ══════════════════════════════════════════════════════════════
// 2. DEFAULT SETTINGS
// ══════════════════════════════════════════════════════════════
async function seedSettings() {
  const defaults = [
    // ── Branding ──
    { category: 'branding', key: 'site_name', value: '"ZyraTech Hub"' },
    { category: 'branding', key: 'site_tagline', value: '"Empowering STEM Education in Ghana"' },
    { category: 'branding', key: 'primary_color', value: '"#6366f1"' },
    { category: 'branding', key: 'secondary_color', value: '"#8b5cf6"' },
    { category: 'branding', key: 'logo_url', value: '""' },

    // ── Contact ──
    { category: 'contact', key: 'contact_email', value: '"info@zyratechhub.com"' },
    { category: 'contact', key: 'contact_phone', value: '""' },
    { category: 'contact', key: 'contact_address', value: '"Accra, Ghana"' },

    // ── Social Media ──
    { category: 'social', key: 'facebook_url', value: '""' },
    { category: 'social', key: 'twitter_url', value: '""' },
    { category: 'social', key: 'instagram_url', value: '""' },
    { category: 'social', key: 'linkedin_url', value: '""' },
    { category: 'social', key: 'youtube_url', value: '""' },
    { category: 'social', key: 'tiktok_url', value: '""' },

    // ── Email (SMTP) ──
    { category: 'email', key: 'smtp_host', value: '""' },
    { category: 'email', key: 'smtp_port', value: '"587"' },
    { category: 'email', key: 'smtp_username', value: '""' },
    { category: 'email', key: 'smtp_password', value: '""' },
    { category: 'email', key: 'from_email', value: '"noreply@zyratechhub.com"' },
    { category: 'email', key: 'from_name', value: '"ZyraTech Hub"' },

    // ── Payments (Paystack) ──
    { category: 'payments', key: 'paystack_public_key', value: '""' },
    { category: 'payments', key: 'paystack_secret_key', value: '""' },
    { category: 'payments', key: 'payment_currency', value: '"GHS"' },

    // ── General ──
    { category: 'general', key: 'maintenance_mode', value: 'false' },
    { category: 'general', key: 'allow_public_registration', value: 'false' },
    { category: 'general', key: 'default_timezone', value: '"Africa/Accra"' },

    // ── Security ──
    { category: 'security', key: 'session_timeout_minutes', value: '"60"' },
    { category: 'security', key: 'max_login_attempts', value: '"5"' },
  ];

  let created = 0;
  let skipped = 0;

  for (const setting of defaults) {
    const existing = await prisma.setting.findUnique({
      where: {
        category_key: {
          category: setting.category,
          key: setting.key,
        },
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.setting.create({ data: setting });
    created++;
  }

  console.log(`  ✔ Settings: ${created} created, ${skipped} already existed`);
}

// ══════════════════════════════════════════════════════════════
// 3. DEFAULT CMS PAGES
// ══════════════════════════════════════════════════════════════
async function seedContentPages() {
  const pages = [
    {
      section: 'about',
      content: JSON.stringify({
        title: 'About ZyraTech Hub',
        subtitle: 'Empowering the Next Generation of STEM Leaders',
        body: '<p>ZyraTech Hub is a leading STEM education platform based in Ghana, dedicated to equipping young people with the skills they need to thrive in the digital age.</p><p>Our mission is to bridge the gap between academic learning and industry-relevant skills through hands-on training programs, mentorship, and real-world project experience.</p>',
        mission: 'To democratize access to quality STEM education across Africa.',
        vision: 'A future where every young African has the skills and opportunity to innovate and lead in technology.',
      }),
    },
    {
      section: 'terms',
      content: JSON.stringify({
        title: 'Terms of Service',
        lastUpdated: new Date().toISOString(),
        body: '<h2>1. Acceptance of Terms</h2><p>By accessing and using the ZyraTech Hub platform, you accept and agree to be bound by the terms and provisions of this agreement.</p><h2>2. Use License</h2><p>Permission is granted to temporarily access the materials on ZyraTech Hub\'s website for personal, non-commercial transitory viewing only.</p><h2>3. Disclaimer</h2><p>The materials on ZyraTech Hub\'s website are provided on an \'as is\' basis. ZyraTech Hub makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.</p><h2>4. Limitations</h2><p>In no event shall ZyraTech Hub or its suppliers be liable for any damages arising out of the use or inability to use the materials on ZyraTech Hub\'s website.</p>',
      }),
    },
    {
      section: 'privacy',
      content: JSON.stringify({
        title: 'Privacy Policy',
        lastUpdated: new Date().toISOString(),
        body: '<h2>1. Information We Collect</h2><p>We collect information you provide directly to us, such as when you create an account, enroll in a course, make a payment, or contact us for support.</p><h2>2. How We Use Your Information</h2><p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.</p><h2>3. Information Sharing</h2><p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except to provide our services, comply with the law, or protect our rights.</p><h2>4. Data Security</h2><p>We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.</p>',
      }),
    },
    {
      section: 'work_with_us',
      content: JSON.stringify({
        title: 'Work With Us',
        subtitle: 'Join the ZyraTech Team',
        body: '<p>We are always looking for passionate individuals to join our team and help us advance STEM education in Ghana and across Africa. Check out our open positions on the careers page.</p>',
      }),
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const page of pages) {
    const existing = await prisma.contentPage.findUnique({
      where: { section: page.section },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.contentPage.create({ data: page });
    created++;
  }

  console.log(`  ✔ CMS Pages: ${created} created, ${skipped} already existed`);
}

// ══════════════════════════════════════════════════════════════
// MAIN — Run all seeders
// ══════════════════════════════════════════════════════════════
async function main() {
  console.log('');
  console.log('══════════════════════════════════════════');
  console.log('  🌱 ZyraTech Hub — Database Seeder');
  console.log('══════════════════════════════════════════');
  console.log('');

  await seedSuperAdmin();
  await seedSettings();
  await seedContentPages();

  console.log('');
  console.log('══════════════════════════════════════════');
  console.log('  ✅ Database seeding complete!');
  console.log('══════════════════════════════════════════');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
