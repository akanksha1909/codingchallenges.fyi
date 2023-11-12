const http = require('http')
const WebSocketServer = require('websocket').server
const fs = require('fs');
const buffer = new Buffer.alloc(1024)

const server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    if (request.url == '/log') {
        fs.readFile('./index.html', (error, data) => {
            if (error) {
                console.log('Error occurred while reading index html file')
            } else {
                response.writeHead(304);
                response.write(data)
            }
            response.end()
        })
    }
});


server.listen(8080, function () {
    console.log((new Date()) + ' Server is listening on port 8080');
});

const wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

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
        const lines = await readFileByPosition()
        lines.forEach(line => {
            connection.send(JSON.stringify(line))
        })
    })
})


let prevFileSize = null

// It should return last ten lines
// Todo: Need to handle the error condition
const readFileByPosition = () => {
    return new Promise((resolve, reject) => {
        let lines = null
        fs.open('logfile', 'r+', function (err, fd) {
            if (err) {
                return console.error(err);
            }
            console.log("Reading the file");
            // Todo: See how can we get the exact postion to start
            fs.read(fd, buffer, 0, buffer.length, 0, function (err, bytes) {
                if (err) {
                    console.log(err);
                }

                if (bytes > 0) {
                    console.log(buffer.slice(0, bytes).toString())
                    lines = buffer.slice(0, bytes).toString()
                    console.log(bytes)
                    prevFileSize = bytes
                }
                console.log(bytes + " bytes read");
                // Close the opened file.
                fs.close(fd, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    if (bytes > 0) {
                        const splitLines = lines.split('\n')
                        const lastTenLines = splitLines.splice('-10')
                        resolve(lastTenLines)
                    }
                    console.log("File closed successfully");
                });
            });
        });
    })
}

const readNewLines = (position) => {
    return new Promise((resolve, reject) => {
        fs.open('logfile', 'r+', function (err, fd) {
            if (err) {
                return console.error(err);
            }
            console.log("Reading the file");
            // Todo: See how can we get the exact postion to start
            fs.read(fd, buffer, 0, buffer.length, position, function (err, bytes) {
                if (err) {
                    console.log(err);
                }
                if (bytes > 0) {
                    console.log(buffer.slice(0, bytes).toString())
                    lines = buffer.slice(0, bytes).toString()
                    console.log(bytes)
                    prevFileSize = bytes
                }
                console.log(bytes + " bytes read");
                // Close the opened file.
                fs.close(fd, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    if (bytes > 0) {
                        const splitLines = lines.split('\n')
                        const lastLine = splitLines
                        resolve(lastLine)
                    }

                    console.log("File closed successfully");
                });
            });
        });
    })
}

// Any change in file should be send to client via websocket
// We can make use of watch file module
fs.watchFile('logfile', {
    interval: 4000
}, async (curr, prev) => {
    console.log("Previous file size", prevFileSize)
    const lines = await readNewLines(prevFileSize)
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
