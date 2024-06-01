const fs = require('fs').promises;

exports.readFile = async (path, argv) => {
    try {
        if (argv.c) {
            const stats = await fs.stat(path);
            console.log('Size:', stats.size);
        }
        if (argv.l) {
            const data = await fs.readFile(path, "utf8");
            console.log(data.split("\n").length)
        }
    } catch (error) {
        console.error('Error fetching file stats:', error);
    }
}