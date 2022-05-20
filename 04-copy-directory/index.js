const fs = require('fs');
const path = require('path');
const fsPromises = require('fs/promises');

async function makeDirectory() {
    const newDir = await fsPromises.mkdir(path.join(__dirname, 'files-copy'), { recursive: true });
}

async function copyFiles() {
    const readFolder = await fsPromises.readdir(path.join(__dirname, 'files'));
    for (const file of readFolder) {
        await fsPromises.copyFile(path.join(__dirname, 'files',  file), path.join(__dirname, 'files-copy', file));
    }
}

async function checkFiles() {
    const readFolder = await fsPromises.readdir(path.join(__dirname, 'files-copy'));
    for (const file of readFolder) {
        const compareFiles = await fsPromises.readdir(path.join(__dirname, 'files'));
        if (!compareFiles.includes(file)) {
            fs.unlink(path.join(__dirname, 'files-copy', file), (err) => {
                if (err) { console.log(`Can't delete ${path.join(__dirname, 'files-copy', file)} file`); };
            });
        }
    }
}

async function copyDir () {
    await makeDirectory();
    await copyFiles();
    await checkFiles();
}

copyDir();