import express from 'express';
const port = 3000;
import cluster from 'node:cluster';
const totalCPUs = require('node:os').cpus().length;
import process from 'node:process';

if (cluster.isMaster) {
    console.log(`Number of CPUs is ${totalCPUs}`);
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }


    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        console.log("Let's fork another worker!");
        cluster.fork();
    });
    cluster.on('SIGINT', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        console.log("Let's fork another worker!");
        cluster.fork();
    });

} else {
    startExpress();
}

function startExpress() {
    const app = express();
    console.log(`Worker ${process.pid} started`);

    app.get('/', (req: any, res: { send: (arg0: string) => void; }) => {
        res.send('Hello World!');
    });

    app.get('/api/slow', function (req: any, res: { send: (arg0: string) => void; }) {
        console.time('slowApi');
        const baseNumber = 7;
        let result = 0;
        for (let i = Math.pow(baseNumber, 7); i >= 0; i--) {
            result += Math.atan(i) * Math.tan(i);
        };
        console.timeEnd('slowApi');

        console.log(`Result number is ${result} - on process ${process.pid}`);
        res.send(`Result number is ${result}`);
    });

    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
}