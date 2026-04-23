// src/scripts/seed.ts
import prisma from './src/config/db';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    const seedPath = 'seed_profiles.json';
    
    if (!fs.existsSync(seedPath)) {
      console.error('❌ seed_profiles.json not found at:', seedPath);
      process.exit(1);
    }

    const rawData = fs.readFileSync(seedPath, 'utf-8');
    const { profiles } = JSON.parse(rawData);   // assuming it's wrapped in { "profiles": [...] }
    
    console.log(`🔄 Seeding ${profiles.length} profiles...`);

    let inserted = 0;
    let skipped = 0;

    for (const p of profiles) {
      try {
        await prisma.profile.upsert({
          where: { name: String(p.name).toLowerCase().trim() },
          update: {},
          create: {
            name: String(p.name).toLowerCase().trim(),
            gender: p.gender ? String(p.gender).toLowerCase() : null,
            gender_probability: p.gender_probability ?? null,
            age: p.age ?? null,
            age_group: p.age_group ? String(p.age_group).toLowerCase() : null,
            country_id: p.country_id ? String(p.country_id).toUpperCase() : null,
            country_name: p.country_name ?? null,
            country_probability: p.country_probability ?? null,
          },
        });
        inserted++;
      } catch (err) {
        skipped++;
      }
    }

    console.log(`✅ Seeding completed! Inserted: ${inserted} | Skipped: ${skipped}`);

  } catch (error: any) {
    console.error('❌ Seeding error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();