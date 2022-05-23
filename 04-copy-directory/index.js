const fs = require('fs');
const path = require('path');
const fsPromises = require('fs/promises');

async function makeDirectory(source, destination) {
    fs.stat(source, (err, stats) => {
        if (stats.isDirectory()){
            fsPromises.mkdir(destination, { recursive: true });
        }
    });
}
async function copyFiles(source, destination) {
    const readFolder = await fsPromises.readdir(source);
    for (const file of readFolder) {
        fs.stat(path.join(source, file), (err, stats) => {
            if (stats.isDirectory()){
                copyDir(path.join(source, file), path.join(destination, file));
            } else {
                fsPromises.copyFile(path.join(source, file), path.join(destination, file));
            }
        })
    }
}
async function checkFiles(source, destination) {
    const readFolder = await fsPromises.readdir(destination);
    for (const file of readFolder) {
        const compareFiles = await fsPromises.readdir(source);
        if (!compareFiles.includes(file)) {
            fs.rm(path.join(destination, file), { recursive:true }, (err) => {
                if (err) { console.log(`Can't delete ${path.join(destination, file)} file`); };
            });
        }
    }
}

async function copyDir(source, destination) {
    await makeDirectory(source, destination);
    await copyFiles(source, destination);
    await checkFiles(source, destination);
}

copyDir(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));