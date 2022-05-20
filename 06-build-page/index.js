const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const { brotliCompress } = require('zlib');

const { stdin, stdout } = process;

let tempHTML = '';

const readTemplate = fs.createReadStream(path.join(__dirname, 'template.html'), 'utf-8');
readTemplate.on('data', data => {
    tempHTML = data;
})

async function createDir() {
    await fsPromises.mkdir(path.join(__dirname, 'project-dist'), { recursive: true });
}

async function copyTemplateToIndex() {
    await fsPromises.copyFile(path.join(__dirname,'template.html'), path.join(__dirname, 'project-dist', 'index.html'));
}

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

const writeCSS = fs.createWriteStream(path.join(__dirname, 'project-dist', 'style.css'));

async function bundleCSS () {
    const files = await fsPromises.readdir(path.join(__dirname, 'styles'));
    for (const file of files) {
        if (path.extname(file) === '.css') {
            const readFile = fs.createReadStream(path.join(__dirname, 'styles', file));
            readFile.pipe(writeCSS);
        }
    }
}

async function makeDirectory() {
    const newDir = await fsPromises.mkdir(path.join(__dirname, 'project-dist', 'assets'), { recursive: true });
}

async function copyFiles() {
    const readFolder = await fsPromises.readdir(path.join(__dirname, 'assets'));
    for (const file of readFolder) {
        await fsPromises.copyFile(path.join(__dirname, 'assets',  file), path.join(__dirname, 'project-dist', 'assets', file));
    }
}

async function checkFiles() {
    const readFolder = await fsPromises.readdir(path.join(__dirname, 'project-dist', 'assets'));
    for (const file of readFolder) {
        const compareFiles = await fsPromises.readdir(path.join(__dirname, 'assets'));
        if (!compareFiles.includes(file)) {
            fs.unlink(path.join(__dirname, 'project-dist', 'assets', file), (err) => {
                if (err) { console.log(`Can't delete ${path.join(__dirname, 'project-dist', 'assets', file)} file`); };
            });
        }
    }
}

async function buildPage() {
    await createDir();
    await copyTemplateToIndex();
    await processComponents();
    await bundleCSS();
    await makeDirectory();
    await copyFiles();
    await checkFiles();
}

buildPage();