// creamos una constante para guardar la URL de json server
const URL_API = 'http://localhost:3000/productos';

// creamos una funcion para validar los datos del producto
function validarProducto(producto) {
    if (!producto.nombre || typeof producto.nombre !== 'string' || producto.nombre.trim() === '') {
        throw new Error('El nombre del producto es obligatorio y no puede estar vacío.');
    }
    // Validar que el precio sea un número válido y positivo
    if (isNaN(producto.precio) || parseFloat(producto.precio) <= 0) {
        throw new Error('El precio es obligatorio y debe ser un número positivo, no ingrese letras.');
    }
    if (producto.categoria && (typeof producto.categoria !== 'string' || producto.categoria.trim() === '')) {
        throw new Error('Por favor proporciona una categoría válida.');
    }
    return true;
}

// usamos el método GET para  obtener y mostrar todos los productos
async function obtenerProductos() {
    console.log('--- Obteniendo lista de productos ---');
    try {
        const respuesta = await fetch(URL_API);
        if (!respuesta.ok) {
            throw new Error(`Error! No se pudo cargar los productos.`);
        }
        const productos = await respuesta.json();
        
        console.log('=== LISTA DE PRODUCTOS DISPONIBLES ===');
        if (productos.length === 0) {
            console.log('No hay productos registrados.');
        } else {
            console.log('----------------------------------------------------------------------');
            console.log('ID         | Nombre               | Precio      | Categoría');
            console.log('----------------------------------------------------------------------');
            productos.forEach(producto => {
                const id = String(producto.id).padEnd(10);
                const nombre = String(producto.nombre).padEnd(20);
                const precio = `$${parseFloat(producto.precio)}`.padEnd(11);
                const categoria = (producto.categoria || 'N/A').padEnd(16);

                console.log(`${id} | ${nombre} | ${precio} | ${categoria}`);
            });
            console.log('----------------------------------------------------------------------');
        }
        return productos;
    } catch (error) {
        console.error('Error al obtener productos:', error.message);
        return [];
    }
}

// usamos el método POST para agregar un producto nuevo
async function crearProducto(producto) {
    console.log('--- Agregando un nuevo producto ---');
    try {
        validarProducto(producto); // Validación 

        const productoParaEnviar = {
            nombre: producto.nombre.trim(),
            precio: parseFloat(producto.precio),
            categoria: producto.categoria ? producto.categoria.trim() : undefined
        };

        const respuesta = await fetch(URL_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoParaEnviar),
        });

        if (!respuesta.ok) {
            throw new Error(`Error! No se pudo agregar producto.`);
        }
        const nuevoProducto = await respuesta.json();
        console.log('Producto agregado con éxito:');
        console.log(`ID: ${nuevoProducto.id}, Nombre: ${nuevoProducto.nombre}, Precio: $${nuevoProducto.precio}, Categoría: ${nuevoProducto.categoria || 'Sin categoría'}`);
        return nuevoProducto;
    } catch (error) {
        console.error('Error al agregar producto:', error.message);
        return null;
    }
}

// usamos el método PUT para actualizar un producto que ya existe
async function actualizarProducto(id, producto) {
    console.log(`--- Actualizando producto con ID: ${id} ---`);
    try {
        // Validamos primero si el producto existe 
        const productoExistenteRes = await fetch(`${URL_API}/${id}`);
        if (!productoExistenteRes.ok) {
            if (productoExistenteRes.status === 404) {
                throw new Error(`Producto con ID ${id} no encontrado.`);
            }
            throw new Error(`Error! No se pudo verificar la existencia del producto.`);
        }
        
        validarProducto(producto); // Validar los datos

        const productoParaEnviar = {
            id: id, 
            nombre: producto.nombre.trim(),
            precio: parseFloat(producto.precio),
            categoria: producto.categoria ? producto.categoria.trim() : undefined
        };

        const respuesta = await fetch(`${URL_API}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoParaEnviar),
        });

        if (!respuesta.ok) {
            throw new Error(`Error al actualizar el producto!`);
        }
        const productoActualizado = await respuesta.json();
        console.log('Producto actualizado con éxito:');
        console.log(`ID: ${productoActualizado.id}, Nombre: ${productoActualizado.nombre}, Precio: $${productoActualizado.precio}, Categoría: ${productoActualizado.categoria || 'Sin categoría'}`);
        return productoActualizado;
    } catch (error) {
        console.error('Error al actualizar producto:', error.message);
        return null;
    }
}

// usamos el método DETELE para eliminar un producto 
async function eliminarProducto(id) {
    console.log(`--- Eliminando producto con ID: ${id} ---`);
    try {
        const respuesta = await fetch(`${URL_API}/${id}`, {
            method: 'DELETE',
        });
        if (!respuesta.ok) {
            if (respuesta.status === 404) {
                throw new Error(`Producto con ID ${id} no encontrado.`);
            }
            throw new Error(`Error! El producto no pudo ser eliminado.`);
        }
        console.log(`Producto con ID ${id} eliminado con éxito.`);
        return true;
    } catch (error) {
        console.error('Error al eliminar producto:', error.message);
        return false;
    }
}

// Interfaz en la consola para interactuar con la API
async function menuPrincipal() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    while (true) {
        console.log('=======================================');
        console.log('=== Sistema de Gestión de Productos ===');
        console.log('=======================================');
        console.log('1. Listar todos los productos');
        console.log('2. Agregar un nuevo producto');
        console.log('3. Actualizar un producto existente');
        console.log('4. Eliminar un producto');
        console.log('5. Salir');
        console.log('=======================================');

        let opcion = '';
        try {
            opcion = await new Promise(resolve => readline.question('Selecciona una opción del 1-5: ', resolve));
            console.log(''); 
        } catch (error) {
            console.error('Error! No se leyó la opción:', error.message);
            continue;
        }
        
        switch (opcion) {
            case '1':
                await obtenerProductos();
                break;
            case '2':
                try {
                    const nombre = (await new Promise(resolve => readline.question('Ingresa el nombre del producto: ', resolve))).trim();
                    const precioStr = (await new Promise(resolve => readline.question('Ingresa el precio del producto (ej. 29.99): ', resolve))).trim();
                    const categoria = (await new Promise(resolve => readline.question('Ingresa la categoría (opcional, presiona Enter para omitir): ', resolve))).trim();

                    const precio = parseFloat(precioStr); // Convertimos a número
                    await crearProducto({ nombre, precio, categoria: categoria || undefined });
                } catch (inputError) {
                    console.error('Error en la entrada de datos:', inputError.message);
                }
                break;
            case '3':
                try {
                    const id = (await new Promise(resolve => readline.question('Ingresa el ID del producto a actualizar: ', resolve))).trim();
                    if (!id) { console.log('ID no puede estar vacío.'); break; }

                    const nombre = (await new Promise(resolve => readline.question('Ingresa el nuevo nombre del producto: ', resolve))).trim();
                    const precioStr = (await new Promise(resolve => readline.question('Ingresa el nuevo precio del producto (ej. 29.99): ', resolve))).trim();
                    const categoria = (await new Promise(resolve => readline.question('Ingresa la nueva categoría (opcional, presiona Enter para omitir): ', resolve))).trim();

                    const precio = parseFloat(precioStr); // Convertimos a número nuevamente
                    await actualizarProducto(id, { nombre, precio, categoria: categoria || undefined });
                } catch (inputError) {
                    console.error('Error en la entrada de datos:', inputError.message);
                }
                break;
            case '4':
                try {
                    const id = (await new Promise(resolve => readline.question('Ingresa el ID del producto a eliminar: ', resolve))).trim();
                    if (!id) { console.log('ID no puede estar vacío.'); break; }
                    await eliminarProducto(id);
                } catch (inputError) {
                    console.error('Error en la entrada de datos:', inputError.message);
                }
                break;
            case '5':
                console.log('Saliendo del Sistema, hasta pronto...');
                readline.close();
                return; 
            default:
                console.log('Opción inválida. Por favor, selecciona un número del 1 al 5.');
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); 
    }
}

// Iniciar el programa
menuPrincipal().catch(error => console.error('Error en el menú principal:', error.message));