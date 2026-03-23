const { glob } = require('glob');
const fs = require('fs');
const path = require('path');

async function removeUnoptimized() {
  const cwd = process.cwd();
  const files = await glob('src/**/*.{ts,tsx,js,jsx}', { cwd });
  
  let changedFilesCount = 0;

  for (const file of files) {
    const fullPath = path.join(cwd, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace unoptimized
    const newContent = content.replace(/\s+unoptimized(?:=\{true\})?(?=[\s/>]|$)/g, '');
    
    if (newContent !== content) {
      fs.writeFileSync(fullPath, newContent, 'utf8');
      console.log(`Updated: ${file}`);
      changedFilesCount++;
    }
  }

  console.log(`Total files updated: ${changedFilesCount}`);
}

removeUnoptimized().catch(console.error);
