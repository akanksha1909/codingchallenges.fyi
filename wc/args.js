const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

exports.parseArguments = () => {
    return yargs(hideBin(process.argv))
        .option('c', {
            alias: 'count',
            type: 'boolean',
            description: 'Count characters in the file',
            demandOption: false,
        })
        .option('l', {
            alias: 'lines',
            type: 'boolean',
            description: 'Count number of lines in the file',
            demandOption: false,
        })
        .option('w', {
            alias: 'word count',
            type: 'boolean',
            description: 'Count number of words in the file',
            demandOption: false,
        })
        .argv;
}