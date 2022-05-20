const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const { stdout } = process;

const writeFile = fs.createWriteStream(path.join(__dirname, 'project-dist', 'bundle.css'));

async function readFiles () {
    const files = await fsPromises.readdir(path.join(__dirname, 'styles'));
    for (const file of files) {
        if (path.extname(file) === '.css') {
            const readFile = fs.createReadStream(path.join(__dirname, 'styles', file));
            readFile.pipe(writeFile);
        }
    }
}

readFiles();