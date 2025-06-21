const fs = require('fs');
const path = require('path');

const INCLUDED_DIRS = ['app', 'components', 'lib', 'types', 'utils'];
const INCLUDED_EXTS = ['.js', '.ts', '.tsx'];

function listFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(listFiles(filePath));
    } else {
      if (INCLUDED_EXTS.includes(path.extname(file))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

INCLUDED_DIRS.forEach(folder => {
  const files = listFiles(folder);
  files.forEach(file => {
    console.log(`==== ${file} ====`);
    console.log(fs.readFileSync(file, 'utf8'));
    console.log('\n');
  });
});
