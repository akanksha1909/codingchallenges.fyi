const fs = require('fs').promises;

exports.readFile = async (path, argv) => {
    try {
        if (argv.c) {
            const stats = await fs.stat(path);
            console.log('Size:', stats.size);
        }
        else if (argv.l) {
            const data = await fs.readFile(path, "utf8");
            console.log(`${data.split("\n").length - 1} ${path}`)
        }
        else if (argv.w) {
            const data = await fs.readFile(path, "utf8");
            console.log(`${data.split(/\s+/).filter(word => word !== '').length} ${path}`)
        }
        else if (argv.m) {
            const data = await fs.readFile(path, "utf8");
            console.log(`${data.length} ${path}`)
        } else {
            const stats = await fs.stat(path);
            const data = await fs.readFile(path, "utf8");
            console.log(`${data.split("\n").length - 1} ${data.split(/\s+/).filter(word => word !== '').length} ${stats.size} ${path}`)
        }
    } catch (error) {
        console.error('Error fetching file stats:', error);
    }
}

exports.readStdin = (argv) => {
    let data = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', chunk => {
        data += chunk;
    });

    process.stdin.on('end', () => {
        if (argv.c) {
            console.log(Buffer.byteLength(data, 'utf8'))
        }
        if (argv.l) {
            console.log(data.split('\n').length - 1);
        }
        if (argv.w) {
            const words = data.split(/\s+/).filter(word => word !== '');
            console.log(words.length);
        }
    });

    process.stdin.on('error', error => {
        console.error('Error reading stdin:', error);
    });
}