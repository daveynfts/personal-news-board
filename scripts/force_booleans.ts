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
  console.log('Fetching documents to FORCE boolean values for undefined fields...');
  const docs = await client.fetch(`*[_type in ["article", "post", "event"]]`);
  
  let patchedCount = 0;

  for (const doc of docs) {
    let patch = client.patch(doc._id);
    let hasChanges = false;
    
    const fieldsToCheck = ['isEditorialPick', 'isHotStory', 'isMore'];
    
    for (const field of fieldsToCheck) {
      if (doc[field] === undefined || doc[field] === null) {
        patch = patch.set({ [field]: false });
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      console.log(`Patching document ${doc._id} ("${doc.title || doc._type}")...`);
      await patch.commit();
      patchedCount++;
    }
  }
  console.log(`\nSuccessfully forced ${patchedCount} documents with Default False.`);
}

run().catch(console.error);
