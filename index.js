const express = require('express');
const {Buffer} = require('buffer');
const {Readable} = require('stream');

const app = express();

const router = express.Router();

let i = 0;

class CustomReadable extends Readable {
    constructor({fileSize = 30 * 1024 * 1024, simulatedSpeed = 4096}) {
        super();

        this.fileSize = fileSize;
        this.simulatedSpeed = simulatedSpeed;

        this.index = i;

        i++;

        console.log(fileSize, simulatedSpeed);
    }

    _read(bytes) {
        console.log(this.index, this.fileSize, bytes);

        if (this.fileSize > 0) {
            setTimeout(() => {
                if (bytes > this.fileSize) {
                    this.push(Buffer.alloc(this.fileSize, 0x00));
                } else {
                    this.push(Buffer.alloc(bytes, 0x00));
                }

                this.fileSize -= bytes;
            }, 1000 / this.simulatedSpeed * bytes / 1024);
        } else {
            this.push(null);
        }
    };
}

router.get('/download/slow', async (req, res, next) => {
    res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename=binary',
        'Content-Length': `${30 * 1024 * 1024}`
    });

    const readable = new CustomReadable({
        fileSize: 30 * 1024 * 1024,
        simulatedSpeed: 256
    });

    readable.pipe(res);
});

router.get('/download/incomplete', async (req, res, next) => {
    res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename=binary',
        'Content-Length': `${30 * 1024 * 1024}`
    });

    const readable = new CustomReadable({
        fileSize: 15 * 1024 * 1024
    });

    readable.pipe(res);
});

router.get('/download/bigger', async (req, res, next) => {
    res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename=binary',
        'Content-Length': `${30 * 1024 * 1024}`
    });

    const readable = new CustomReadable({
        fileSize: 60 * 1024 * 1024,
        simulatedSpeed: 60 * 1024 * 1024
    });

    readable.pipe(res);
});

app.use(router);

app.use((req, res, next) => {
    throw new Error('Not found.');
});

app.use((err, req, res, next) => {
    res.status(500).json({error: err.message});
});

app.listen(9999, () => {
    console.log('server is running.');
});
