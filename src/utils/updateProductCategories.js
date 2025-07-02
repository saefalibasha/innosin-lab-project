// Quick script to update all Broen Lab categories to Broen-Lab
// This helps fix the remaining category inconsistencies

const fs = require('fs');

const filePath = 'src/utils/productAssets.ts';
const content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of "Broen Lab" with "Broen-Lab"
const updatedContent = content.replace(/category: "Broen Lab",/g, 'category: "Broen-Lab",');

fs.writeFileSync(filePath, updatedContent);
console.log('Updated all Broen Lab categories to Broen-Lab');