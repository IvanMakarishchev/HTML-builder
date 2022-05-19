const fs = require('fs');
const path = require('path');
const checkDir = require('fs/promises');

const { stdout } = process;
const folderPath = path.join(__dirname, 'secret-folder');

async function readFiles() {
    const files = await checkDir.readdir(folderPath);
    for (const file of files) {
        const filePath = `${folderPath}/${file}`;
        fs.stat(filePath, (err, stats) => {
            if (!stats.isDirectory()){
                stdout.write(`${path.basename(filePath, path.extname(filePath))} - ${path.extname(filePath).slice(1)} - ${stats.size}\n`);
            }
        })
    }
}
readFiles();