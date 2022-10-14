const dotenv = require('dotenv')
const mongoose = require('mongoose');


process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception application will shut down');
    process.exit(1);
});
const app = require('./app');

dotenv.config({path: './config.env'});


const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(db,  {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(con => {
    console.log('connection Succefull');
});

const port = process.env.PORT ?? 3000;
const server = app.listen(port);

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('unhandled exception shutting down');
    server.close(() => process.exit(1));
});