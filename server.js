import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";
import * as url from "node:url";

const PORT = 8000;
const STATIC_PATH = path.join(process.cwd(), "./static");

const MIME_TYPES = {
    default: "application/octet-stream",
    html: "text/html; charset=UTF-8",
    js: "application/javascript",
    css: "text/css",
    png: "image/png",
    jpg: "image/jpg",
    gif: "image/gif",
    ico: "image/x-icon",
    svg: "image/svg+xml",
};

const toBool = [() => true, () => false];

const prepareFile = async (url) => {
    
    const paths = [STATIC_PATH, url];
    
    if (url.endsWith("/")) paths.push("index.html");
    
    const filePath = path.join(...paths);
    const pathTraversal = !filePath.startsWith(STATIC_PATH);
    const exists = await fs.promises.access(filePath).then(...toBool);
    const found = !pathTraversal && exists;
    const streamPath = found ? filePath : STATIC_PATH + "/404.html";
    const ext = path.extname(streamPath).substring(1).toLowerCase();
    const stream = fs.createReadStream(streamPath);
    
    return { found, ext, stream };
};

let reqPerSecond = 0;

http
    .createServer(async (req, res) => {
        
        if (req.url.includes('/api')) {
    
            const queryData = url.parse(req.url, true).query;
            const index = queryData.index;
            
            setTimeout(() => {
                
                reqPerSecond++;
    
                res.writeHead(reqPerSecond > 50 ? 429 : 200, {'content-type': 'application/json'});
    
                res.end(JSON.stringify({ index }));
                
            },  Math.floor(Math.random()*1000) + 1); // rand from 1 to 1000ms
            
        } else {
    
            const file = await prepareFile(req.url);
            const statusCode = file.found ? 200 : 404;
            const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
            res.writeHead(statusCode, { "Content-Type": mimeType });
            file.stream.pipe(res);
            
        }
    })
    .listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);

setInterval(function() {
    
    if (reqPerSecond > 0) console.log('Requests per second:' + reqPerSecond);
    
    reqPerSecond = 0;
    
}, 1000);
