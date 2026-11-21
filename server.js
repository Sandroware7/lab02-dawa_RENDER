const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Limpiar query strings y normalizar la URL
    let parsedUrl = req.url.split('?')[0];
    if (parsedUrl === '/') parsedUrl = '/index.html';

    // Extraer solo el nombre limpio del archivo (ej. si pide "/public/servicios.html" o "/servicios")
    const cleanPath = parsedUrl.replace(/^\/public\//, '/');
    const pathWithHtml = path.extname(cleanPath) === '' ? `${cleanPath}.html` : cleanPath;

    // Lista de posibles ubicaciones donde buscar el archivo
    const candidatePaths = [
        path.join(__dirname, 'public', cleanPath),
        path.join(__dirname, cleanPath),
        path.join(__dirname, 'public', pathWithHtml),
        path.join(__dirname, pathWithHtml)
    ];

    // Encontrar la primera ruta que exista y sea un archivo real
    const filePath = candidatePaths.find(p => fs.existsSync(p) && !fs.statSync(p).isDirectory());

    if (!filePath) {
        console.error('404 No encontrado:', req.url);
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - Página no encontrada</h1><p><a href="/index.html">Volver al Inicio</a></p>');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>Error 500 del servidor</h1>');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.svg': 'image/svg+xml'
        };

        const contentType = mimeTypes[ext] || 'text/plain';
        res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
        res.end(content);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});