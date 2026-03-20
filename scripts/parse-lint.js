const fs = require('fs');
let text = fs.readFileSync('lint-errors.json', 'utf16le');
if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
const json = JSON.parse(text);
const errors = json.filter(f => f.errorCount > 0 || f.warningCount > 0);
console.log(JSON.stringify(errors.map(e => ({ file: e.filePath, messages: e.messages })), null, 2));
