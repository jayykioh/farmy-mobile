const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'app');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/colors\.background/g, 'colors.bgMain')
    .replace(/colors\.surface/g, 'colors.bgSurface')
    .replace(/colors\.border/g, 'colors.borderMain')
    .replace(/colors\.text/g, 'colors.textMain')
    .replace(/colors\.primaryDark/g, 'colors.textH') // Just for welcome.tsx title
    .replace(/colors\.textMainMuted/g, 'colors.textMuted') // Fix any accidental overlap
    .replace(/colors\.textMainH/g, 'colors.textH'); // Fix any accidental overlap
    
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  });
}

walk(directoryPath);
