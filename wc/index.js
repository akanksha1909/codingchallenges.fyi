#!/usr/bin/env node

const { parseArguments } = require('./args')
const { readFile, readStdin } = require('./fileUtils')

const argv = parseArguments();

// If there's no piped input, read from file
if (process.stdin.isTTY) {
    readFile(argv._[0], argv)
} else {
    readStdin(argv)
}

