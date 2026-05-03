const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const MAX_BODY_SIZE_BYTES = 1_000_000;

const MIME_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.webp': 'image/webp'
};

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8'
    });
    response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, message) {
    response.writeHead(statusCode, {
        'Content-Type': 'text/plain; charset=utf-8'
    });
    response.end(message);
}

async function ensureStorageFile() {
    await fs.mkdir(DATA_DIR, { recursive: true });

    try {
        await fs.access(SUBMISSIONS_FILE);
    } catch {
        await fs.writeFile(SUBMISSIONS_FILE, '[]\n', 'utf8');
    }
}

async function readSubmissions() {
    await ensureStorageFile();

    const rawData = await fs.readFile(SUBMISSIONS_FILE, 'utf8');

    try {
        const parsed = JSON.parse(rawData);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function writeSubmissions(items) {
    await ensureStorageFile();
    await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(items, null, 2) + '\n', 'utf8');
}

function collectBody(request) {
    return new Promise(function (resolve, reject) {
        let body = '';

        request.on('data', function (chunk) {
            body += chunk;

            if (Buffer.byteLength(body, 'utf8') > MAX_BODY_SIZE_BYTES) {
                reject(new Error('Body requestu jest za duze.'));
                request.destroy();
            }
        });

        request.on('end', function () {
            resolve(body);
        });

        request.on('error', function (error) {
            reject(error);
        });
    });
}

function validateSubmission(payload) {
    if (!payload || typeof payload !== 'object') {
        return {
            ok: false,
            message: 'Nieprawidlowy format danych.'
        };
    }

    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const email = typeof payload.email === 'string' ? payload.email.trim() : '';
    const message = typeof payload.message === 'string' ? payload.message.trim() : '';

    if (!name || !email || !message) {
        return {
            ok: false,
            message: 'Wszystkie pola (name, email, message) sa wymagane.'
        };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return {
            ok: false,
            message: 'Nieprawidlowy adres email.'
        };
    }

    return {
        ok: true,
        value: {
            name,
            email,
            message
        }
    };
}

async function handleSubmissionsApi(request, response) {
    if (request.method === 'GET') {
        const items = await readSubmissions();
        sendJson(response, 200, { items: items.slice(0, 20) });
        return;
    }

    if (request.method === 'POST') {
        let payload;

        try {
            const rawBody = await collectBody(request);
            payload = rawBody ? JSON.parse(rawBody) : {};
        } catch {
            sendJson(response, 400, {
                message: 'Nie udalo sie odczytac danych JSON z requestu.'
            });
            return;
        }

        const validation = validateSubmission(payload);

        if (!validation.ok) {
            sendJson(response, 400, {
                message: validation.message
            });
            return;
        }

        const items = await readSubmissions();
        const entry = {
            id: String(Date.now()) + '-' + String(Math.floor(Math.random() * 1000000)),
            name: validation.value.name,
            email: validation.value.email,
            message: validation.value.message,
            createdAt: new Date().toISOString()
        };

        items.unshift(entry);
        await writeSubmissions(items);

        sendJson(response, 201, {
            message: 'Dane zostaly zapisane na serwerze.',
            storagePath: 'data/submissions.json',
            entry
        });
        return;
    }

    sendJson(response, 405, {
        message: 'Metoda niedozwolona. Uzyj GET lub POST.'
    });
}

async function serveStaticFile(requestPath, response) {
    const pathname = requestPath === '/' ? '/index.html' : requestPath;
    const normalizedPath = path.normalize(pathname).replace(/^([.][.][/\\])+/, '');
    const filePath = path.resolve(ROOT_DIR, '.' + normalizedPath);

    if (!filePath.startsWith(ROOT_DIR)) {
        sendText(response, 403, 'Brak dostepu.');
        return;
    }

    try {
        const content = await fs.readFile(filePath);
        const extension = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[extension] || 'application/octet-stream';

        response.writeHead(200, {
            'Content-Type': contentType
        });
        response.end(content);
    } catch {
        sendText(response, 404, 'Plik nie zostal znaleziony.');
    }
}

async function requestHandler(request, response) {
    const parsedUrl = new URL(request.url, 'http://localhost');

    if (parsedUrl.pathname === '/api/submissions') {
        await handleSubmissionsApi(request, response);
        return;
    }

    await serveStaticFile(parsedUrl.pathname, response);
}

async function bootstrap() {
    await ensureStorageFile();

    const server = http.createServer(function (request, response) {
        requestHandler(request, response).catch(function (error) {
            console.error('Blad serwera:', error);
            sendJson(response, 500, {
                message: 'Wewnetrzny blad serwera.'
            });
        });
    });

    server.listen(PORT, function () {
        console.log('Server dziala na http://localhost:' + PORT);
        console.log('Plik danych backendu: data/submissions.json');
    });
}

bootstrap().catch(function (error) {
    console.error('Nie udalo sie uruchomic serwera:', error);
    process.exit(1);
});
