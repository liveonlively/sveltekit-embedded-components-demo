const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.resolve(__dirname + '/static' + req.url);
    try {
      fs.stat(filePath, (err, stats) => {
        if (err || !stats) {
          res.statusCode = 404;
          res.end(`File ${filePath} not found!`);
        } else {
          if (stats.isDirectory()) {
            filePath += '/index.html';
          }
          fs.readFile(filePath, (err, data) => {
            if (err) {
              res.statusCode = 500;
              res.end(`Error getting the file: ${err}.`);
            } else {
              res.end(data);
            }
          });
        }
      });
    } catch (error) {
      res.statusCode = 404;
      res.end(`File ${filePath} not found!`);
    }
});

server.listen(process.env.PORT || 3000, undefined, () => {
    const addr = server.address();
    console.log("Server listening at", addr.address + ":" + addr.port);
});
