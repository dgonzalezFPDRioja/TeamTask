<?php
//API para los proyectos de la base de datos

//Incluyo archivos php cabeceras/conexion/autenticación
require_once __DIR__ . '/config/headers.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/autenticacion.php';

//Consigo los datos del usuario logueado
$usuarioLogueado = getUsuarioDeToken($conn);
$rol = $usuarioLogueado['rol'];

//Leo el metodo utilizado de peticion, leo la peticion y lo convierto en array
$metodo = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

//*****GET | Listar los proyectos de un usuario
if ($metodo === 'GET' && isset($_GET['accion']) && $_GET['accion'] === 'mis') {
    try {
        //Snetencia SQL
        $sentSQL = $conn->prepare("SELECT t.* FROM proyectos t 
            INNER JOIN proyectos_usuarios ta ON t.id = ta.proyecto_id 
            WHERE ta.usuario_id = ? ORDER BY t.fecha_creacion DESC");
        $sentSQL->execute([$usuarioLogueado['id']]);
        $proyectos = $sentSQL->fetchAll(PDO::FETCH_ASSOC);

        //Devuelvo las proyectos
        echo json_encode($proyectos);
        exit;
    } catch (PDOException $e) {
        //Error en la BBDD
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error obteniendo los proyectos",
            //Depuracion
            //"error" => $e->getMessage()
        ]);
        exit;
    }
}

//*****GET | Si paso un ID devuelve el proyecto concreto, si no pasa la lista de proyectos
if ($metodo === 'GET') {
    try {

        //Comprueba si la query tiene un id
        if (isset($_GET['id'])) {
            //Anade el id a la variable
            $id = $_GET['id'];
            //Sentencia SQL
            $sentSQL = $conn->prepare("SELECT * FROM proyectos WHERE id = ?");
            //Paso el parametro id
            $sentSQL->execute([$id]);
            $proyecto = $sentSQL->fetch(PDO::FETCH_ASSOC);

            //Si existe el proyecto lo devuelve en JSON, si no error 404
            if ($proyecto) {
                echo json_encode($proyecto);
            } else {
                http_response_code(404);
                echo json_encode(["mensaje" => "Proyecto no encontrado"]);
            }
        } else {
            //Si la query no tiene ID devuelve toda la lsita de proyecto
            $sentSQL = $conn->query("SELECT * FROM proyectos ORDER BY id asc");
            $proyectos = $sentSQL->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($proyectos);
        }
        exit;
    } catch (PDOException $e) {
        //Error en la BBDD
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error obteniendo los proyectos",
            //DEPURACION
            //"error" => $e->getMessage()
        ]);
        exit;
    }
}

//*****POST | Asignar un proyecto a un usuario
if ($metodo === 'POST' && isset($_GET['accion']) && $_GET['accion'] === 'asignar') {

    $proyecto_id   = $input['proyecto_id'] ?? null;
    $usuario_id = $input['usuario_id'] ?? null;

    //Compruebo si se han pasado los ID
    if ($proyecto_id === null || $usuario_id === null) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Faltan proyecto_id o usuario_id"]);
        exit;
    }

    try {
        //Sentencia SQL
        $sentSQL = $conn->prepare("INSERT INTO proyectos_usuarios (proyecto_id, usuario_id) VALUES (?, ?)");
        $sentSQL->execute([$proyecto_id, $usuario_id]);
        //Mensaje de asignacion correcta
        http_response_code(201);
        echo json_encode([
            "mensaje" => "Usuario asignado al proyecto",
            "asignacion" => [
                "proyecto_id"   => (int)$proyecto_id,
                "usuario_id" => (int)$usuario_id
            ]
        ]);
        exit;
    } catch (PDOException $e) {
        //Mensaje de error
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error asignando el proyecto",
            "error" => $e->getMessage()
        ]);
        exit;
    }
}

//*****POST | Creacion de proyectos
if ($metodo === 'POST') {
    //El campo nombre esta vacio manda un error 400
    if (empty($input['nombre'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "El nombre no puede estar vacio"]);
        exit;
    }
    //Pongo en variables el nombre y descripcion
    $nombre = trim($input['nombre']);
    $descripcion = trim($input['descripcion']);
    //Sentencia SQL
    $sentSQL = $conn->prepare("INSERT INTO proyectos (nombre, descripcion, creador_id) VALUES (?, ?, ?)");
    try {
        $sentSQL->execute([$nombre, $descripcion, $usuarioLogueado['id']]);
        //Pillo el ID asignado
        $id = $conn->lastInsertId();

        //Validacion de creacion 
        http_response_code(201);
        echo json_encode([
            "id" => $id,
            "nombre" => $nombre,
            "descripcion" => $descripcion,
            "creador_id" => $usuarioLogueado['id']
        ]);
        exit;
    } catch (PDOException $e) {
        //Devuelvo el error
        http_response_code(500);
        echo json_encode([
            "codigo" => $e->getCode(),
            "error"  => $e->getMessage()
        ]);
        exit;
    }
}

//*****PUT | Modificacion de proyectos
if ($metodo === 'PUT') {
    //El campo nombre esta vacio manda un error 400
    if (empty($input['nombre'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Falta el nombre"]);
        exit;
    }
    $nombre = $input['nombre'];
    //Si no se manda nombre nuevo, se queda el mismo
    $nuevoNombre = $input['nuevo_nombre'] ?? $nombre;
    $descripcion = $input['descripcion'] ?? null;

    try {

        //Comprobacion que existe el proyecto
        $sentSQL = $conn->prepare("SELECT * FROM proyectos WHERE nombre = ?");
        $sentSQL->execute([$nombre]);
        //Mando error si no se encuentra el usuario
        if (!$sentSQL->fetch(PDO::FETCH_ASSOC)) {
            http_response_code(404);
            echo json_encode(["mensaje" => "Proyecto no encontrado"]);
            exit;
        }
        //Creo un array con los campos que se tienen que actualizar
        $campos = [];
        $valores = [];
        //Voy anadiendo al array los campos que se actualizan
        if ($nuevoNombre !== null) {
            $campos[] = "nombre = ?";
            $valores[] = $nuevoNombre;
        }
        if ($descripcion !== null) {
            $campos[] = "descripcion = ?";
            $valores[] = $descripcion;
        }
        //Cuento los campos del array para saber si no hay nada que actualizar
        if (count($campos) === 0) {
            http_response_code(400);
            echo json_encode(["mensaje" => "No se ha enviado ningun campo para actualizar"]);
            exit;
        }
        $valores[] = $nombre;
        //Ejecuto el update
        $sentSQL = "UPDATE proyectos SET " . implode(", ", $campos) . " WHERE nombre = ?";
        $update = $conn->prepare($sentSQL);
        $update->execute($valores);
        //Hago un select para saber como ha quedado el usuario
        $sentSQL = $conn->prepare("SELECT * FROM proyectos WHERE nombre = ?");
        $sentSQL->execute([$nuevoNombre]);
        $proyectoFinal = $sentSQL->fetch(PDO::FETCH_ASSOC);
        //Mensaje de confirmacion y como ha queado el usuario
        echo json_encode([
            "proyecto" => $proyectoFinal
        ]);
        exit;
    } catch (PDOException $e) {
        //Error en la BBDD
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error modificando los proyectos",
            //DEPURACION
            //"error" => $e->getMessage()
        ]);
        exit;
    }
}

//*****DELETE | Borrar asignacion de proyecto
if ($metodo === 'DELETE' && isset($_GET['accion']) && $_GET['accion'] === 'desasignar') {

    //Pillo tarea y usuario
    $proyecto_id = $input['proyecto_id'] ?? null;
    $usuario_id  = $input['usuario_id']  ?? null;

    //Compruebo si lso ID de usurio o proyecto estan vacios
    if ($proyecto_id === null || $usuario_id === null) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Falta el ID de proyecto o tarea"]);
        exit;
    }

    try {
        //Sentencia SQL
        $sentSQL = $conn->prepare("DELETE FROM proyectos_usuarios WHERE proyecto_id = ? AND usuario_id = ?");
        $sentSQL->execute([$proyecto_id, $usuario_id]);

        //Mensaje de eliminacion correcta
        http_response_code(200);
        echo json_encode([
            "mensaje" => "Asignacion eliminada correctamente",
            "proyecto_id" => $proyecto_id,
            "usuario_id" => $usuario_id
        ]);
        exit;
    } catch (PDOException $e) {
        //Mensaje de error
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error eliminando la asignacion",
            "error" => $e->getMessage()
        ]);
        exit;
    }
}

//*****DELETE | Paso un nonbre para eliminar el proyecto
if ($metodo === 'DELETE') {
    //Compruebo si si ha passado un nombre
    if (empty($input['nombre'])) {
        http_response_code(400);
        echo json_encode(["mensaje" => "Falta el nombre"]);
        exit;
    }
    $nombre = $input['nombre'];
    try {
        //Compruebo que el proyecto existe
        $sentSQL = $conn->prepare("SELECT * FROM proyectos WHERE nombre = ?");
        $sentSQL->execute([$nombre]);
        $proyecto = $sentSQL->fetch(PDO::FETCH_ASSOC);
        //Si la respuesta esta vacia no se ha encontrado el proyecto
        if (!$proyecto) {
            http_response_code(404);
            echo json_encode(["mensaje" => "Proyecto no encontrado"]);
            exit;
        }
        //Ejecuto el borrado
        $delSQL = $conn->prepare("DELETE FROM proyectos WHERE nombre = ?");
        $delSQL->execute([$nombre]);
        //Si la sentencia no esta vacia es que el proyecto se ha borrado
        if ($delSQL->rowCount() > 0) {
            http_response_code(200);
            echo json_encode([
                "mensaje" => "Proyecto eliminado",
            ]);
        } else {
            //Si esta vacia es que ha salido mal
            http_response_code(500);
            echo json_encode([
                "mensaje" => "Error al eliminar el proyecto"
            ]);
        }
        exit;
    } catch (PDOException $e) {
        //Si recibo error 500 saco error de BBDD
        http_response_code(500);
        echo json_encode([
            "mensaje" => "Error en la base de datos al eliminar el proyecto"
            //DEPURACION
            //"error" => $e->getMessage()
        ]);
        exit;
    }
}

//Para cualquier metodo raro
http_response_code(405);
echo json_encode(["mensaje" => "Metodo no permitido"]);