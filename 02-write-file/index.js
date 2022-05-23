const fs = require('fs');
const path = require('path');

const { stdin, stdout } = process;

const filePath = path.join(__dirname, 'text.txt');
const writeStream = fs.createWriteStream(filePath);

stdout.write('Введите ваш текст (введите exit для выхода):\n');
stdin.on('data', data => {
    const input = data.toString();
    if (input.trim() === 'exit'){
        stdout.write('Good luck!');
        process.exit();
    } else {
        writeStream.write(input);
    }
});
process.on('SIGINT', () => {
    stdout.write('Good luck!');
    process.exit();
})