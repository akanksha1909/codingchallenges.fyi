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