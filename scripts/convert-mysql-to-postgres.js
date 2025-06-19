const fs = require('fs');
const path = require('path');

// Files that need MySQL to PostgreSQL conversion
const filesToConvert = [
  'src/app/api/notifications/route.ts',
  'src/app/api/roles/route.ts',
  'src/app/api/users/[id]/route.ts',
  'src/app/api/roles/[id]/route.ts',
  'src/app/api/notifications/[id]/route.ts',
];

function convertMysqlToPostgres(content) {
  let converted = content;
  
  // Step 1: Convert simple parameter placeholders (?, ?, ?) to PostgreSQL format
  // This is a complex regex that handles parameter conversion
  converted = converted.replace(/\?/g, (match, offset, string) => {
    // Count how many ? we've seen before this one in the current SQL statement
    const beforeThis = string.substring(0, offset);
    const questionsInThisStatement = (beforeThis.match(/\?/g) || []).length;
    return `$${questionsInThisStatement + 1}`;
  });
  
  // Step 2: Fix result.insertId to result.rows[0].id
  converted = converted.replace(/result\.insertId/g, 'result.rows[0].id');
  
  // Step 3: Add RETURNING id to INSERT statements that need it
  converted = converted.replace(
    /(INSERT INTO \w+[^;]+?)(\)\s*[,;])/g,
    '$1) RETURNING id$2'
  );
  
  // Step 4: Fix result.affectedRows to result.rowCount (if any)
  converted = converted.replace(/result\.affectedRows/g, 'result.rowCount');
  
  return converted;
}

function convertFile(filePath) {
  try {
    console.log(`Converting ${filePath}...`);
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const converted = convertMysqlToPostgres(content);
    
    if (content !== converted) {
      fs.writeFileSync(fullPath, converted, 'utf8');
      console.log(`✅ Converted ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error converting ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔄 Converting MySQL syntax to PostgreSQL...\n');
  
  filesToConvert.forEach(file => {
    convertFile(file);
  });
  
  console.log('\n🎉 Conversion completed!');
  console.log('\n⚠️  Note: Please review the converted files manually as some complex queries may need manual adjustment.');
}

if (require.main === module) {
  main();
}

module.exports = { convertMysqlToPostgres, convertFile };