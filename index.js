//importacion de paquetes para el proyecto
const http = require('http')
const fs = require('fs')
const url = require('url')

//importacion de funciones asincronas de consultas.js
const { insertar, consultar, editar, eliminar, transferencia, consultaTransferencia } = require('./consultas')

//creacion del servidor para visualizar el html
http.createServer(async (req, res) => {
    try {
    if (req.url == '/' & req.method === 'GET') {
    res.setHeader('content-type', 'text/html');
    const html = fs.readFileSync('index.html', 'utf-8')
    res.end(html)
    }   
    } catch(error) {
          console.log('hay problemas con la base de datos, el codigo de error es el siguiente', error.code)
            res.statusCode=400
            res.end(`<img src="https://httpstatusdogs.com/img/400.jpg" alt='perrito en problemas'>`)
    }
    
//ruta post para crear nuevos registros
    if (req.url == '/usuario' && req.method === 'POST') {
        try {
        let body = "";
        req.on('data', (chunk) => {
        body +=chunk
    })
    req.on('end', async () => {
        const datos = Object.values(JSON.parse(body))
        const respuesta = await insertar(datos)
        res.statusCode=201
        res.end(JSON.stringify(respuesta))
    }) 
        } catch(error) {
            console.log('no se ha podido crear el usuario, el codigo de error es el siguiente', error.code)
            res.statusCode=400
            res.end(`<img src="https://httpstatusdogs.com/img/400.jpg" alt='perrito en problemas'>`)
    }
    }
//ruta get para visualizar todos los usuarios
    if (req.url == '/usuarios' && req.method === 'GET')
        try {
            const registros = await consultar()
            res.statusCode = 200
            res.end(JSON.stringify(registros.rows))
        } catch(error) {
            console.log('no se ha podido visualizar a los usuarios. El codigo de error es el siguiente:', error.code)
            res.statusCode=400
            res.end(`<img src="https://httpstatusdogs.com/img/400.jpg" alt='perrito en problemas'>`)    
    }
//ruta put para actualizar registros
    if (req.url.startsWith('/usuario') && req.method === 'PUT') {
            const { id } = url.parse(req.url, true).query; //se realiza la modificacion por id
        try {
            let body = ""
            req.on('data', (chunk) => {
                body +=chunk
            })
            req.on('end', async () => {
                const datos = Object.values(JSON.parse(body))
                const respuesta = await editar(datos, id)
                res.statusCode = 200
                res.end(JSON.stringify(respuesta))
            })
        } catch(error) {
            console.log('no se ha podido editar al usuario. El codigo de error es el siguiente:', error.code)
            res.statusCode=404
            res.end(`<img src="https://httpstatusdogs.com/img/400.jpg" alt='perrito en problemas'>`)    
        }
    }
    //ruta delete para eliminar usuarios
    if (req.url.startsWith('/usuario?') && req.method == 'DELETE') {
        try {
        const { id } = url.parse(req.url, true).query; //se realiza la eliminacion por id
        const respuesta = await (eliminar(id))
        res.statusCode=200     
        res.end(JSON.stringify(respuesta)) 
        } catch(error) {
            console.log('no se ha podido eliminar al usuario. El codigo de error es el siguiente:', error.code)
            res.statusCode=404
            res.end(`<img src="https://httpstatusdogs.com/img/400.jpg" alt='perrito en problemas'>`)    
        }
    }
//ruta post para hacer nueva transferencia
    if (req.url=='/transferencia' && req.method === 'POST') {
        try {
        let body = "";
        req.on('data', (chunk) => {
        body +=chunk
    })
    req.on('end', async () => {
        const datos = Object.values(JSON.parse(body))
        const respuesta = await transferencia(datos)
        res.statusCode=201
        res.end(JSON.stringify(respuesta))
    }) 
        } catch(error) {
            console.log('no se hizo la transferencia, el codigo de error es el siguiente', error.code)
            res.statusCode=400
            res.end(`<img src="https://httpstatusdogs.com/img/400.jpg" alt='perrito en problemas'>`)
    }
    }
    //consultar las transferencias realizadas
    if (req.url == '/transferencias' && req.method === 'GET') {
        try {
            const registros = await consultaTransferencia()
            res.statusCode = 200
            res.end(JSON.stringify(registros.rows))
        } catch (error) {
            console.log('no se ha podido visualizar las transferencias realizadas. El codigo de error es el siguiente:', error.code)
            res.statusCode=400
            res.end(`<img src="https://httpstatusdogs.com/img/400.jpg" alt='perrito en problemas'>`) 
    }
}

}).listen(3000, ()=>console.log('server ON and working OK'))

