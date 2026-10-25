const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const DB_PATH = path.resolve(__dirname, '../data/cutandlooks.db');
const BRIDGE_PATH = path.resolve(__dirname, 'db_bridge.py');

// Ensure data folder exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function callBridgeSync(action, payload) {
  const res = spawnSync('python3', [BRIDGE_PATH, DB_PATH, action], {
    input: JSON.stringify(payload),
    encoding: 'utf8'
  });
  if (res.status !== 0) {
    throw new Error(`Database bridge error: ${res.stderr || res.stdout}`);
  }
  const parsed = JSON.parse(res.stdout);
  return parsed.data !== undefined ? parsed.data : parsed;
}

console.log('🔄 Initializing Cut & Looks Sahakar Nagar Database Schema...');

// Schema definition
const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS business_settings (
    id TEXT PRIMARY KEY,
    business_name TEXT NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    logo_url TEXT,
    google_maps_url TEXT NOT NULL,
    google_reviews_url TEXT NOT NULL,
    opening_hours TEXT NOT NULL,
    social_links TEXT NOT NULL,
    booking_settings TEXT NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS service_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES service_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    price_inr NUMERIC,
    starting_price_inr NUMERIC,
    duration_minutes INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    booking_reference TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    service_id TEXT REFERENCES services(id) ON DELETE SET NULL,
    service_name_snapshot TEXT NOT NULL,
    service_price_snapshot NUMERIC,
    appointment_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    preferred_stylist TEXT,
    customer_message TEXT,
    status TEXT NOT NULL CHECK(status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected')),
    admin_notes TEXT,
    privacy_consent INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    confirmed_at TEXT,
    cancelled_at TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('New', 'In Progress', 'Resolved', 'Archived')),
    admin_notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS gallery_images (
    id TEXT PRIMARY KEY,
    image_url TEXT NOT NULL,
    caption TEXT,
    category TEXT,
    alt_text TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    admin_user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    created_at TEXT NOT NULL,
    metadata TEXT
  );`,

  // Performance Indexes
  `CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(appointment_date, status);`,
  `CREATE INDEX IF NOT EXISTS idx_appointments_ref ON appointments(booking_reference);`,
  `CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(customer_phone);`,
  `CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);`,
  `CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);`,
  `CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at);`,
  `CREATE INDEX IF NOT EXISTS idx_gallery_published ON gallery_images(is_published, display_order);`
];

callBridgeSync('transaction', {
  statements: schemaStatements.map(sql => ({ sql, params: [] }))
});

console.log('✅ Tables and Indexes verified.');

// Seed Admin User
const now = new Date().toISOString();
const adminId = crypto.randomUUID();
const passwordHash = bcrypt.hashSync('Admin@CutLooks2026', 10);

const existingAdmin = callBridgeSync('query', {
  sql: 'SELECT id FROM profiles WHERE email = ?',
  params: ['admin@cutandlooks.com']
});

if (!existingAdmin || existingAdmin.length === 0) {
  callBridgeSync('execute', {
    sql: `INSERT INTO profiles (id, full_name, email, role, password_hash, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    params: [adminId, 'Cut & Looks Administrator', 'admin@cutandlooks.com', 'admin', passwordHash, now, now]
  });
  console.log('✅ Initial Admin profile created (admin@cutandlooks.com / Admin@CutLooks2026)');
}

// Seed Business Settings
const existingSettings = callBridgeSync('query', {
  sql: 'SELECT id FROM business_settings LIMIT 1',
  params: []
});

if (!existingSettings || existingSettings.length === 0) {
  const settingsId = crypto.randomUUID();
  const openingHours = {
    monday: { open: "09:30", close: "21:00", isOpen: true, note: "Confirmed closing 9:00 PM" },
    tuesday: { open: "09:30", close: "21:00", isOpen: true, note: "Confirmed closing 9:00 PM" },
    wednesday: { open: "09:30", close: "21:00", isOpen: true, note: "Confirmed closing 9:00 PM" },
    thursday: { open: "09:30", close: "21:00", isOpen: true, note: "Confirmed closing 9:00 PM" },
    friday: { open: "09:30", close: "21:00", isOpen: true, note: "Confirmed closing 9:00 PM" },
    saturday: { open: "09:30", close: "21:00", isOpen: true, note: "Confirmed closing 9:00 PM" },
    sunday: { open: "09:30", close: "21:00", isOpen: true, note: "Confirmed closing 9:00 PM" }
  };

  const socialLinks = {
    whatsapp: "+918431357154",
    instagram: "",
    facebook: "",
    youtube: ""
  };

  const bookingSettings = {
    slot_interval_minutes: 30,
    max_advance_days: 14,
    min_notice_hours: 1,
    allow_stylist_selection: false,
    require_email: false,
    holiday_closures: []
  };

  callBridgeSync('execute', {
    sql: `INSERT INTO business_settings 
          (id, business_name, description, address, phone, email, logo_url, google_maps_url, google_reviews_url, opening_hours, social_links, booking_settings, seo_title, seo_description, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      settingsId,
      'Cut & Looks Sahakar Nagar',
      'Cut & Looks Sahakar Nagar is a premium unisex hair and beauty salon in Sahakar Nagar, Bengaluru. We specialize in precision haircuts, modern styling, hair treatments, coloring, and grooming services in a comfortable, hygienic, and client-centric environment.',
      '3H5V+G4C, 2, 14th Main Road, Sahakar Nagar, Byatarayanapura, Bengaluru, Karnataka 560092, India',
      '+91 84313 57154',
      null, // Official email not yet provided
      null, // Official logo will be uploaded by owner
      'https://www.google.com/maps/place/Cut+%26+Looks+Sahakar+Nagar/data=!4m2!3m1!1s0x0:0x385d0adee88321ee',
      'https://www.google.com/search?q=Cut+%26+Looks+Sahakar+Nagar+Google+reviews',
      JSON.stringify(openingHours),
      JSON.stringify(socialLinks),
      JSON.stringify(bookingSettings),
      'Cut & Looks Sahakar Nagar | Premium Unisex Hair & Beauty Salon in Bengaluru',
      'Experience professional haircuts, grooming, styling, and hair spa treatments at Cut & Looks Sahakar Nagar, Bengaluru. Convenient appointment requests and personalized care.',
      now,
      now
    ]
  });
  console.log('✅ Verified Business settings seeded.');
}

// Seed Service Categories
const categories = [
  { name: "Haircuts and Styling", slug: "haircuts-and-styling", desc: "Expert precision haircuts, blow-drys, and signature styling for men and women.", order: 1 },
  { name: "Men's Grooming", slug: "mens-grooming", desc: "Classic and contemporary beard styling, fades, trims, and rejuvenating facials.", order: 2 },
  { name: "Women's Hair Services", slug: "womens-hair-services", desc: "Customized hair cuts, layers, fringes, straightening, and glamorous styling.", order: 3 },
  { name: "Hair Colouring", slug: "hair-colouring", desc: "Global hair colors, root touch-ups, highlights, balayage, and ammonia-free options.", order: 4 },
  { name: "Hair Treatments and Hair Spa", slug: "hair-treatments-and-spa", desc: "Intense deep conditioning, anti-dandruff therapy, keratin nourishment, and calming scalp spas.", order: 5 },
  { name: "Skin and Beauty Care", slug: "skin-and-beauty-care", desc: "Refreshing facials, skin clean-ups, detan packs, and skincare rituals.", order: 6 },
  { name: "Hair Wash and Blow-Dry", slug: "hair-wash-and-blow-dry", desc: "Relaxing hair wash rituals accompanied by professional blow-dry styling.", order: 7 },
  { name: "Other Salon Services", slug: "other-salon-services", desc: "Special grooming rituals, threading, waxing, and custom salon consultations.", order: 8 }
];

const categoryIdMap = {};

for (const cat of categories) {
  const existing = callBridgeSync('query', {
    sql: 'SELECT id FROM service_categories WHERE slug = ?',
    params: [cat.slug]
  });

  let id;
  if (existing && existing.length > 0) {
    id = existing[0].id;
  } else {
    id = crypto.randomUUID();
    callBridgeSync('execute', {
      sql: `INSERT INTO service_categories (id, name, slug, description, display_order, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
      params: [id, cat.name, cat.slug, cat.desc, cat.order, now, now]
    });
  }
  categoryIdMap[cat.slug] = id;
}
console.log('✅ Service categories seeded.');

// Seed Suggested Services with realistic descriptions, durations, and pricing display rules
// Note: Some have starting_price_inr to show starting price, some have null to show 'Contact us for pricing'
const services = [
  {
    cat: 'haircuts-and-styling',
    name: "Classic Men's Precision Haircut",
    slug: "classic-mens-precision-haircut",
    desc: "Detailed personal consultation, precision scissor and clipper haircut tailored to your face shape, followed by a neck trim and light styling.",
    img: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
    price: null,
    startPrice: null, // Display "Contact us for pricing"
    duration: 30,
    order: 1
  },
  {
    cat: 'haircuts-and-styling',
    name: "Women's Signature Haircut & Styling",
    slug: "womens-signature-haircut-styling",
    desc: "Includes consultation on hair texture and lifestyle, sectioned cut, layered styling, and a clean professional finish.",
    img: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80",
    price: null,
    startPrice: 600, // Demonstrates Starting Price format: Starting from ₹600
    duration: 45,
    order: 2
  },
  {
    cat: 'mens-grooming',
    name: "Beard Sculpting & Contour Styling",
    slug: "beard-sculpting-contour-styling",
    desc: "Precision beard shaping, razor lining, length blending, and application of soothing beard oil or balm.",
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    price: null,
    startPrice: null, // "Contact us for pricing"
    duration: 25,
    order: 1
  },
  {
    cat: 'mens-grooming',
    name: "Men's Charcoal Detan & Cleanup",
    slug: "mens-charcoal-detan-cleanup",
    desc: "Cleansing exfoliation, gentle steam, charcoal pack application, and deep hydration for refreshed skin.",
    img: "https://images.unsplash.com/photo-1512290900672-1f55b91b9247?auto=format&fit=crop&w=800&q=80",
    price: null,
    startPrice: 750, // Starting from ₹750
    duration: 40,
    order: 2
  },
  {
    cat: 'hair-colouring',
    name: "Global Hair Colour Consultation & Application",
    slug: "global-hair-colour-application",
    desc: "Full coverage premium hair coloration customized for your skin undertone, using gentle nourishing hair color formulations.",
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    price: null,
    startPrice: null, // Price available at the salon
    duration: 90,
    order: 1
  },
  {
    cat: 'hair-colouring',
    name: "Balayage & Dimensional Highlights",
    slug: "balayage-dimensional-highlights",
    desc: "Freehand hair painting or foil highlights designed to create natural multi-dimensional tone, shine, and depth.",
    img: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80",
    price: null,
    startPrice: null, // Contact us for pricing
    duration: 120,
    order: 2
  },
  {
    cat: 'hair-treatments-and-spa',
    name: "Intense Moisture Hair Spa & Scalp Massage",
    slug: "intense-moisture-hair-spa",
    desc: "Deep cleansing hair bath, nutrient-rich botanical hair mask, relaxing acupressure scalp massage, and warm steam infusion.",
    img: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
    price: null,
    startPrice: 900, // Starting from ₹900
    duration: 60,
    order: 1
  },
  {
    cat: 'hair-treatments-and-spa',
    name: "Keratin Smooth & Anti-Frizz Treatment",
    slug: "keratin-smooth-anti-frizz-treatment",
    desc: "Protein-enriched formula that seals hair cuticles, eliminates humidity frizz, and imparts silky smoothness.",
    img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
    price: null,
    startPrice: null, // Contact us for pricing
    duration: 120,
    order: 2
  },
  {
    cat: 'hair-wash-and-blow-dry',
    name: "Deep Cleansing Hair Wash & Volume Blow-Dry",
    slug: "deep-cleansing-hair-wash-volume-blowdry",
    desc: "Invigorating double shampoo wash with conditioning treatment, followed by a volume-boosting blowout and soft curls or sleek finish.",
    img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80",
    price: null,
    startPrice: 350, // Starting from ₹350
    duration: 35,
    order: 1
  },
  {
    cat: 'skin-and-beauty-care',
    name: "Radiance Fruit Facial & Skin Glow Ritual",
    slug: "radiance-fruit-facial-skin-glow",
    desc: "Multi-step facial including deep pore cleansing, fruit enzyme scrub, soothing massage cream, and hydration mask.",
    img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    price: null,
    startPrice: null, // Contact us for pricing
    duration: 50,
    order: 1
  }
];

for (const s of services) {
  const existing = callBridgeSync('query', {
    sql: 'SELECT id FROM services WHERE slug = ?',
    params: [s.slug]
  });

  const catId = categoryIdMap[s.cat];

  if (!existing || existing.length === 0) {
    const sId = crypto.randomUUID();
    callBridgeSync('execute', {
      sql: `INSERT INTO services 
            (id, category_id, name, slug, description, image_url, price_inr, starting_price_inr, duration_minutes, is_active, display_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      params: [sId, catId, s.name, s.slug, s.desc, s.img, s.price, s.startPrice, s.duration, s.order, now, now]
    });
  }
}
console.log('✅ Services seeded with authentic pricing display rules.');

// Seed Curated Gallery Images
const galleryData = [
  {
    url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
    caption: "Modern fade cut and structured pompadour styling",
    cat: "Men's Hairstyles",
    alt: "Precision men haircut with modern taper fade"
  },
  {
    url: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80",
    caption: "Layered blowout with natural movement and bounce",
    cat: "Women's Hairstyles",
    alt: "Woman showing layered haircut with soft waves"
  },
  {
    url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    caption: "Caramel balayage tones on deep espresso hair",
    cat: "Hair Colour",
    alt: "Balayage hair color with smooth shiny finish"
  },
  {
    url: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
    caption: "Relaxing deep hydration hair spa ritual",
    cat: "Hair Treatments",
    alt: "Hair treatment application at modern wash station"
  },
  {
    url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80",
    caption: "Clean, hygienic, and welcoming salon styling stations",
    cat: "Salon Interior",
    alt: "Well lit salon workstation with large mirrors and comfortable chairs"
  },
  {
    url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    caption: "Crisp line-up and textured beard grooming",
    cat: "Men's Hairstyles",
    alt: "Sharp beard grooming and trimmed contour"
  },
  {
    url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
    caption: "Silky smooth keratin therapy finish",
    cat: "Hair Treatments",
    alt: "Client with sleek glossy straightened hair"
  },
  {
    url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    caption: "Refreshing skin detan and gentle cleanse",
    cat: "Skin & Beauty",
    alt: "Facial therapy session"
  }
];

const existingGallery = callBridgeSync('query', {
  sql: 'SELECT count(*) as count FROM gallery_images',
  params: []
});

if (!existingGallery || existingGallery[0].count === 0) {
  let gOrder = 1;
  for (const img of galleryData) {
    const gId = crypto.randomUUID();
    callBridgeSync('execute', {
      sql: `INSERT INTO gallery_images (id, image_url, caption, category, alt_text, display_order, is_published, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      params: [gId, img.url, img.caption, img.cat, img.alt, gOrder++, now, now]
    });
  }
  console.log('✅ Curated gallery images seeded.');
}

console.log('🎉 Database seeding complete!');
