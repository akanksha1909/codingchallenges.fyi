#!/usr/bin/env node

const { parseArguments } = require('./args')
const { readFile } = require('./fileUtils')

const argv = parseArguments();

if (!argv._[0]) {
    console.error("Error: You must provide a file to process")
}

readFile(argv._[0], argv)
