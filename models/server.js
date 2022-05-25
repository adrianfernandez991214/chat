const express = require('express');
const cors = require('cors');
const { dbConnection } = require("../database/config");
const fileUpload = require('express-fileupload');
const socketController = require('../sockets/controller');

class Server {

    constructor() {
        this.app = express();
        this.server = require('http').createServer(this.app);
        this.io = require('socket.io')(this.server);

        //Conectar base de datos
        this.conectarDB();
        //Middlewares
        this.middlewares();
        //Rutas
        this.routes();
        //socket
        this.sockets();
    }


    async conectarDB() {
        await dbConnection();
    }

    middlewares() {

        //Cors 
        this.app.use(cors());
        //Lectura y parseo del body
        this.app.use(express.json());
        //Public estatico
        this.app.use(express.static('public'));
        //fileUpload - cargar archivo
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            createParentPath: true
        }));

    }

    routes() {

        this.app.use('/api/auth', require('../routes/auth'));
        this.app.use('/api/usuarios', require('../routes/user'));
        this.app.use('/api/categorias', require('../routes/categorias-rutas'));
        this.app.use('/api/productos', require('../routes/producto-rutas'));
        this.app.use('/api/buscar', require('../routes/buscar-rutas'));
        this.app.use('/api/uploads', require('../routes/uploads-rutas'));

    }

    sockets() {
        this.io.on('connection', (socket) => socketController(socket, this.io));
    }

    listen() {

        this.server.listen(process.env.PORT, () => {
            console.log('Servidor corriendo en el puerto: ' + process.env.PORT);
        });

    }

}


module.exports = Server;