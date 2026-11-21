const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Limpiar parámetros query string (todo lo que está después del '?')
    const parsedUrl = req.url.split('?')[0];

    // Redirigir la raíz '/' a '/index.html' automáticamente
    const requestUrl = parsedUrl === '/' ? '/index.html' : parsedUrl;

    // Obtener la ruta absoluta del archivo solicitado dentro de 'public'
    const filePath = path.join(__dirname, 'public', requestUrl);

    console.log('Ruta del archivo solicitado:', filePath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        console.error('Se intentó leer un directorio:', filePath);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>Error 500: Se intentó acceder a un directorio.</h1>');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            if (err.code === 'ENOENT') {
                console.error('Archivo no encontrado:', filePath);
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 - Página no encontrada</h1><p><a href="/index.html">Volver al Inicio</a></p>');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>Error 500 del servidor</h1>');
            }
        } else {
            const ext = path.extname(filePath);
            let contentType = 'text/html';
            switch (ext) {
                case '.js': contentType = 'text/javascript'; break;
                case '.css': contentType = 'text/css'; break;
                case '.json': contentType = 'application/json'; break;
                case '.png': contentType = 'image/png'; break;
                case '.jpg':
                case '.jpeg': contentType = 'image/jpeg'; break;
            }

            console.log('Sirviendo archivo:', filePath);
            res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
            res.end(content);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});