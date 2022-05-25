const { Socket } = require('socket.io');
const { comprobarJWT } = require("../helpers/generar-jwt");
const ChatMensajes = require('../models/chat-mensajes');

const chatMensajes = new ChatMensajes();

const socketController = async (socket, io) => {
   const token = socket.handshake.headers['x-token'];
   const usuario = await comprobarJWT(token);

   if (!usuario) {
      return Socket.disconnect();
   }


   chatMensajes.conectarUsuario(usuario);
   io.emit("usuarios-activos", chatMensajes.usuariosArr);
   socket.emit('resivir-mensajes', chatMensajes.ultimos10);

   //conectarlo a una sala especial
   socket.join(usuario.id);// global / socket.id / usuario.id

   socket.on("disconnect", () => {

      chatMensajes.desconectarUsuario(usuario.id);
      io.emit("usuarios-activos", chatMensajes.usuariosArr);

   });

   socket.on('enviar-mensaje', ({ mensaje, uid }) => {

      if (uid) {
         console.log(uid);
         socket.to(uid).emit('mensaje-privado', { de: usuario.nombre, mensaje });
      } else {
         chatMensajes.enviarMensaje(usuario.id, usuario.nombre, mensaje);
         io.emit('resivir-mensajes', chatMensajes.ultimos10);
      }
   })

};

module.exports = socketController;