const http = require('http')
const WebSocketServer = require('websocket').server
const fs = require('fs');

// Todo: efficient way of handling buffer size
const buffer = Buffer.alloc(1024 * 1024)

const server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    if (request.url == '/log') {
        fs.readFile('./index.html', (error, data) => {
            if (error) {
                console.log('Error occurred while reading index html file')
            } else {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(data)
            }
            response.end()
        })
    }
});


server.listen(8080, function () {
    console.log((new Date()) + ' Server is listening on port 8080');
});

// exisiting http server, we want to upgrade to websocket connection
const wsServer = new WebSocketServer({ httpServer: server });

let connections = []

wsServer.on('request', (request) => {
    const connection = request.accept(null, request.origin)
    connections.push(connection)
    console.log('Total connections', connections.length)
    console.log((new Date()) + ' Connection accepted.')
})

wsServer.on('connect', (connection) => {
    console.log((new Date()) + ' Successfully connected.')
    connection.on('message', async () => {
        const lines = readFileByPosition()
        lines.forEach(line => {
            connection.send(JSON.stringify(line))
        })
    })
})


let prevFileSize = null

// It should return last ten lines
// Todo: Need to handle the error condition
const readFileByPosition = () => {
    const fd = fs.openSync('logfile')
    const bytes = fs.readSync(fd, buffer, 0, buffer.length, 0)
    let lines = null
    let lastTenLines = null
    if (bytes > 0) {
        lines = buffer.slice(0, bytes).toString()
        prevFileSize += bytes
        const splitLines = lines.split('\n')
        lastTenLines = splitLines.splice('-10')
    }
    fs.closeSync(fd)
    return lastTenLines
}

const readNewLines = (position) => {
    const fd = fs.openSync('logfile')
    const bytes = fs.readSync(fd, buffer, 0, buffer.length, position + 1)
    let lines = null
    let newLines = null
    if (bytes > 0) {
        lines = buffer.slice(0, bytes).toString()
        prevFileSize += bytes
        newLines = lines.split('\n')
    }
    fs.closeSync(fd)
    return newLines
}

// Any change in file should be send to client via websocket
// We can make use of watch file module
fs.watchFile('logfile', {
    interval: 4000
}, async (curr, prev) => {
    console.log("Previous file size", prevFileSize)
    const lines = readNewLines(prevFileSize)
    console.log('Total client connections', connections.length)
    if (lines.length > 0) {
        connections.forEach(connection => {
            if (lines.length > 0) {
                lines.forEach(line => {
                    connection.send(JSON.stringify(line))
                })
            }
        })
    }
})
