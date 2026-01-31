/**
 * Upload judge/mentor photos to Supabase Storage
 * 
 * Prerequisites:
 * 1. npm install @supabase/supabase-js
 * 2. Set environment variables or edit SUPABASE_URL and SUPABASE_SERVICE_KEY below
 * 3. Place all photos in ./buildathon-faces/ directory
 * 
 * Usage:
 * node upload_photos.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// =============================================================================
// CONFIGURATION - Edit these values
// =============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY';

// Directory containing the photos
const PHOTOS_DIR = './buildathon-faces';

// Supabase Storage bucket name (you already created 'faces')
const BUCKET_NAME = 'faces';

// =============================================================================
// Photo filename mappings (local filename -> standardized storage name)
// =============================================================================

const PHOTO_MAPPINGS = [
  // Female Judges (17)
  { local: 'Fei-Fei_Li.jpg', storage: 'fei-fei-li.jpg', name: 'Fei-Fei Li' },
  { local: 'Daniela_Amodei.jpg', storage: 'daniela-amodei.jpg', name: 'Daniela Amodei' },
  { local: 'mira_murati.jpg', storage: 'mira-murati.jpg', name: 'Mira Murati' },
  { local: 'Daphne_Koller.jpg', storage: 'daphne-koller.jpg', name: 'Daphne Koller' },
  { local: 'Kanjun_Qiu.jpg', storage: 'kanjun-qiu.jpg', name: 'Kanjun Qiu' },
  { local: 'Cassie_Kozyrkov.jpg', storage: 'cassie-kozyrkov.jpg', name: 'Cassie Kozyrkov' },
  { local: 'Marissa_Mayer.jpg', storage: 'marissa-mayer.jpg', name: 'Marissa Mayer' },
  { local: 'Sarah_Friar.jpg', storage: 'sarah-friar.jpg', name: 'Sarah Friar' },
  { local: 'Eugenia_Kuyda.jpg', storage: 'eugenia-kuyda.jpg', name: 'Eugenia Kuyda' },
  { local: 'Cornelia_Davis.jpg', storage: 'cornelia-davis.jpg', name: 'Cornelia Davis' },
  { local: 'Amanda_Askell.jpg', storage: 'amanda-askell.jpg', name: 'Amanda Askell' },
  { local: 'cynthia-rudin.jpg', storage: 'cynthia-rudin.jpg', name: 'Cynthia Rudin' },
  { local: 'Glass_Marcano.jpg', storage: 'glass-marcano.jpg', name: 'Glass Marcano' },
  { local: 'Carol_Barnes.jpg', storage: 'carol-barnes.jpg', name: 'Carol A. Barnes' },
  { local: 'Rebecca_Allen.jpg', storage: 'rebecca-allen.jpg', name: 'Rebecca Allen' },
  { local: 'kate_crawford.jpg', storage: 'kate-crawford.jpg', name: 'Kate Crawford' },
  
  // Male Judges (7)
  { local: 'Andrew_Ng.jpg', storage: 'andrew-ng.jpg', name: 'Andrew Ng' },
  { local: 'Andrej_Karpathy.jpg', storage: 'andrej-karpathy.jpg', name: 'Andrej Karpathy' },
  { local: 'Jensen_Huang.jpg', storage: 'jensen-huang.jpg', name: 'Jensen Huang' },
  { local: 'Dario_Amodei.jpg', storage: 'dario-amodei.jpg', name: 'Dario Amodei' },
  { local: 'Harrison_Chase.jpg', storage: 'harrison-chase.jpg', name: 'Harrison Chase' },
  { local: 'Yann_LeCun.jpg', storage: 'yann-lecun.jpg', name: 'Yann LeCun' },
  { local: 'François_Chollet.jpg', storage: 'francois-chollet.jpg', name: 'François Chollet' },
  
  // Mentors (add these when ready)
  // { local: 'Fernanda_Viégas.jpg', storage: 'fernanda-viegas.jpg', name: 'Fernanda Viégas' },
];

// =============================================================================
// Upload Logic
// =============================================================================

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function uploadPhoto(mapping) {
  const localPath = path.join(PHOTOS_DIR, mapping.local);
  
  // Check if file exists
  if (!fs.existsSync(localPath)) {
    console.log(`⚠️  SKIP: ${mapping.local} not found`);
    return { success: false, name: mapping.name, error: 'File not found' };
  }
  
  const fileBuffer = fs.readFileSync(localPath);
  const contentType = 'image/jpeg';
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(mapping.storage, fileBuffer, {
      contentType,
      upsert: true  // Overwrite if exists
    });
  
  if (error) {
    console.log(`❌ FAIL: ${mapping.name} - ${error.message}`);
    return { success: false, name: mapping.name, error: error.message };
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(mapping.storage);
  
  console.log(`✅ OK: ${mapping.name} -> ${urlData.publicUrl}`);
  return { success: true, name: mapping.name, url: urlData.publicUrl };
}

async function main() {
  console.log('==========================================');
  console.log('bu!ld@th0n Photo Upload Script');
  console.log('==========================================\n');
  
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Photos directory: ${PHOTOS_DIR}`);
  console.log(`Bucket: ${BUCKET_NAME}`);
  console.log(`Photos to upload: ${PHOTO_MAPPINGS.length}\n`);
  
  // Check if photos directory exists
  if (!fs.existsSync(PHOTOS_DIR)) {
    console.error(`❌ Error: Directory ${PHOTOS_DIR} not found`);
    console.log(`\nCreate the directory and add your photos:`);
    console.log(`  mkdir ${PHOTOS_DIR}`);
    console.log(`  # Copy your photos into ${PHOTOS_DIR}/`);
    process.exit(1);
  }
  
  // List files in directory
  const files = fs.readdirSync(PHOTOS_DIR);
  console.log(`Found ${files.length} files in ${PHOTOS_DIR}:\n`);
  files.forEach(f => console.log(`  - ${f}`));
  console.log('\n------------------------------------------\n');
  
  // Upload each photo
  const results = [];
  for (const mapping of PHOTO_MAPPINGS) {
    const result = await uploadPhoto(mapping);
    results.push(result);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Summary
  console.log('\n==========================================');
  console.log('UPLOAD SUMMARY');
  console.log('==========================================\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\nFailed uploads:');
    failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }
  
  // Generate SQL-friendly output
  console.log('\n==========================================');
  console.log('IMAGE URLs FOR SQL INSERT');
  console.log('==========================================\n');
  
  successful.forEach(s => {
    console.log(`-- ${s.name}`);
    console.log(`'${s.url}'`);
    console.log('');
  });
}

main().catch(console.error);
