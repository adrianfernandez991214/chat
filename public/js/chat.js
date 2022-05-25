
const usuario = null;
let socket = null;

//Referencias html
const txtUid = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const btnSalir = document.querySelector('#btnSalir');
const ulMensajes = document.querySelector('#ulMensajes');

const validarJWT = async () => {

    const token = localStorage.getItem('token') || '';

    if (token.length <= 10) {
        window.location = 'index.html';
        throw new Error('No hay token en el servidor');
    }

    const resp = await fetch('http://localhost:8080/api/auth/', {
        headers: { 'x-token': token }
    });

    const { usuario: usuarioDB, token: tokenDB } = await resp.json();

    localStorage.setItem('token', tokenDB);

    document.title = usuarioDB.nombre;

    await conectarSocket();

};

const conectarSocket = async () => {

    socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });

    socket.on('connect', () => {
        console.log('Socket online');
    });

    socket.on('disconnect', () => {
        console.log('Socket offoline');
    });

    socket.on('resivir-mensajes', (payload) => {
        dibujarMensajes(payload);
    });

    socket.on('usuarios-activos', (payload) => {
        dibujarUsuarios(payload);
    });

    socket.on('mensaje-privado', ({de, mensaje}) => {
        console.log('Privado de ' +  de + ": " + mensaje);
    });
}

const dibujarUsuarios = (usuarios = []) => {

    let usersHtml = '';
    usuarios.forEach(({ nombre, uid }) => {

        usersHtml += `
            <li>
                <p>
                    <h5 class="text-success"> ${nombre} </h5>
                    <span class="fs-6 text-muted">${uid}</span>
                </p>
            </li>
        `;
    });

    ulUsuarios.innerHTML = usersHtml;

}

const dibujarMensajes = (mensaje = []) => {

    let mensajeHtml = '';
    mensaje.forEach(({ nombre, mensaje }) => {

        mensajeHtml += `
            <li>
                <p>
                    <h5 class="text-success"> ${nombre} </h5>
                    <span >${mensaje}</span>
                </p>
            </li>
        `;
    });

    ulMensajes.innerHTML = mensajeHtml;

}

txtMensaje.addEventListener('keyup', ({ keyCode }) => {

    const mensaje = txtMensaje.value;
    const uid = txtUid.value;

    if (keyCode !== 13) { return; }
    if (mensaje.length === 0) { return; }


    socket.emit('enviar-mensaje', { mensaje, uid });

    txtMensaje.value = '';
});

const main = async () => {

    await validarJWT();

};

main();