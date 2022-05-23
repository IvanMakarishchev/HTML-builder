const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

let tempHTML = '';

// Fill tempHTML variable with base data
const readTemplate = fs.createReadStream(path.join(__dirname, 'template.html'), 'utf-8');
readTemplate.on('data', data => {
    tempHTML = data;
})

// Create directory for bundle
async function createDir() {
    await fsPromises.mkdir(path.join(__dirname, 'project-dist'), { recursive: true });
}

// Copy template to index.html
async function copyTemplateToIndex() {
    await fsPromises.copyFile(path.join(__dirname,'template.html'), path.join(__dirname, 'project-dist', 'index.html'));
}

// Processing components and adding them to index.html
async function processComponents() {
    const components = await fsPromises.readdir(path.join(__dirname, 'components'));
    for(const comp of components){
        const compName = path.basename(comp, path.extname(comp));
        const compReplace = new RegExp('{{' + compName + '}}','g');
        const readComp = fs.createReadStream(path.join(__dirname, 'components', comp), 'utf-8');
        readComp.on('data', data => {
            tempHTML = tempHTML.replace(compReplace, data);            
        });
    }
    const readIndex = fs.createReadStream(path.join(__dirname, 'project-dist', 'index.html'), 'utf-8');
    readIndex.on('data', data => {
        const writeIndex = fs.createWriteStream(path.join(__dirname, 'project-dist', 'index.html'));
        writeIndex.write(tempHTML);
    });
}

// Processing CSS
const writeCSS = fs.createWriteStream(path.join(__dirname, 'project-dist', 'style.css'));
async function bundleCSS () {
    const files = await fsPromises.readdir(path.join(__dirname, 'styles'));
    files.reverse();
    for (const file of files) {
        if (path.extname(file) === '.css') {
            const readFile = fs.createReadStream(path.join(__dirname, 'styles', file));
            readFile.pipe(writeCSS);
        }
    }
}

// Processing assets
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

// Assets copy function callbacks
async function copyDir(source, destination) {
    await makeDirectory(source, destination);
    await copyFiles(source, destination);
    await checkFiles(source, destination);
}

// Bundle functions callbacks
async function buildPage() {
    await createDir();
    await copyTemplateToIndex();
    await processComponents();
    await bundleCSS();
    await copyDir(path.join(__dirname, 'assets'), path.join(__dirname, 'project-dist', 'assets'));
}

buildPage();