const { Console } = require('console');
const { release } = require('os');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'postgres',
    database: 'bancosolar',
    port: 5432
});

//funcion asincrona para crear nuevos registros
const insertar = async (datos) => {
    const consulta = {
        text: 'INSERT into usuarios(nombre,balance) values($1, $2)',
        values: datos
    }
    try {
        const result = await pool.query(consulta)
        return result
    } catch(error) {
        console.log('no se ha podido crear el usuario, el codigo de error es:', error.code)
        return error
    }
}
//funcion asincrona que me devuelva todos los usuarios
const consultar = async () => {
    try {
        const result = await pool.query('SELECT * FROM usuarios')
        return result
    } catch (error) {
        console.log(error.code)
        return error
    }
}

//funcion asincrona para editar a un usuario
const editar = async (datos, id) => {
    const consulta = {
        text: `UPDATE usuarios SET nombre=$1, balance=$2 WHERE id=${id} RETURNING *`,
        values:datos
    }
    try {
        const result = await pool.query(consulta)
        console.log(`el usuario con id ${id} ha sido modificado`)
        return result
    } catch(error) {
        console.log(error.code)
        return error
    }
}

//funcion asincrona para eliminar a un usuario
const eliminar = async (id) => {
    try {
        const result = await pool.query(`DELETE FROM usuarios WHERE id='${id}'`)
        console.log(`el usuario con el id: ${id} ha sido eliminado  `)
        return result
    } catch(error) {
        console.log(error.code)
        return error
    }
}

//transaccion entre usuarios
const transferencia = async (datos) => {
    try {
        await pool.query('BEGIN');
        const descontar = {
            text:`UPDATE usuarios SET balance = balance - ${datos[2]} WHERE nombre= '${datos[0]}' RETURNING *`
        }
        const accionDescontar = await pool.query(descontar)
        const acreditar = {
            text: `UPDATE usuarios SET balance= balance +${datos[2]} WHERE nombre='${datos[1]}' RETURNING *`
        }
        const acreditacion = await pool.query(acreditar)
        console.log(`el usuario '${datos[0]}' ha transferido un monto de '$${datos[2]}' al usuario '${datos[1]}'`)
        const tablaTransferencia = {
        text: 'INSERT INTO transferencias(emisor,receptor,monto,fecha) VALUES($1, $2, $3, $4)',
        values: [accionDescontar.rows[0].id, acreditacion.rows[0].id, datos[2],new Date]
        }
        await pool.query(tablaTransferencia)
        await pool.query('COMMIT')
        const data = [accionDescontar.rows[0].nombre, acreditacion.rows[0].nombre, datos[2],new Date]
        return data
    } catch(error) {
        await pool.query('ROLLBACK')
        console.log('el error de la transferencia es:', error.code)
        return error
    }
}
//ver todas las transferencias hechas
const consultaTransferencia = async () => {
    const info = {
        rowMode: 'array',
        text:"SELECT transferencias.fecha, (SELECT nombre FROM usuarios WHERE transferencias.emisor = usuarios.id) AS emisor, nombre AS receptor, transferencias.monto FROM usuarios INNER JOIN transferencias ON transferencias.receptor = usuarios.id",
    };
    try {
        const result = await pool.query(info)
        console.log(result.rows) //que me devuelva la informacion de transferencias como un array 
        return result
    } catch (error) {
        console.log("Ha habido un error en consultar las transferencias: " + error.code)
        return error
    }
}

//Exportando las funciones para ser utilizadas en index.js
module.exports = {insertar, consultar, editar, eliminar, transferencia, consultaTransferencia};