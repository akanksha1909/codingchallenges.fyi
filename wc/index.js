#!/usr/bin/env node

const fs = require('fs').promises;
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv))
    .option('c', {
        alias: 'count',
        type: 'boolean',
        description: 'Count characters in the file',
        demandOption: true,
    })
    .argv;

async function getFileStats(path) {
    try {
        const stats = await fs.stat(path);
        console.log('Size:', stats.size);
    } catch (error) {
        console.error('Error fetching file stats:', error);
    }
}

getFileStats(argv._[0]);