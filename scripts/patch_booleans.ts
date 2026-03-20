import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2024-03-20',
});

async function run() {
  console.log('Fetching documents to check for boolean type mismatches...');
  const docs = await client.fetch(`*[_type in ["article", "post", "event"]]`);
  
  let patchedCount = 0;

  for (const doc of docs) {
    let patch = client.patch(doc._id);
    let hasChanges = false;
    
    const fieldsToCheck = ['isEditorialPick', 'isHotStory', 'isMore'];
    
    for (const field of fieldsToCheck) {
      if (doc[field] !== undefined && typeof doc[field] !== 'boolean') {
        // Convert integer 1/0 or string "1"/"0" to boolean true/false
        const boolValue = Boolean(Number(doc[field]));
        patch = patch.set({ [field]: boolValue });
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      console.log(`Patching document ${doc._id} ("${doc.title || doc._type}")...`);
      await patch.commit();
      patchedCount++;
    }
  }
  console.log(`\nSuccessfully patched ${patchedCount} documents.`);
}

run().catch(console.error);
