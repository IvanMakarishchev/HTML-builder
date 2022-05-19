const fs = require('fs');
const path = require('path');

const { stdout } = process;
const stream = fs.createReadStream(path.join(__dirname, 'text.txt'));

stream.on('data', chunk => stdout.write(chunk));