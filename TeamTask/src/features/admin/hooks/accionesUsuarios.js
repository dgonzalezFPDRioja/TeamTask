//Llamadas al backend
import * as api from "../../../services/api.jsx";

export function crearAccionesUsuarios(ctx) {
  //Gestiono la creacion de un usuario nuevo con validaciones basicas
  const handleNuevoUsuario = async (e) => {
    e.preventDefault();
    ctx.setErrorUsuario("");
    if (
      !ctx.nuevoUsuario.nombre.trim() ||
      !ctx.nuevoUsuario.correo.trim() ||
      !ctx.nuevoUsuario.contrasena.trim()
    ) {
      ctx.setErrorUsuario(
        "Completa nombre, correo y contraseña para crear el usuario"
      );
      return;
    }

    try {
      const creado = await api.crearUsuarioApi({
        nombre: ctx.nuevoUsuario.nombre.trim(),
        correo: ctx.nuevoUsuario.correo.trim(),
        contrasena: ctx.nuevoUsuario.contrasena.trim(),
        rol: ctx.nuevoUsuario.rol,
      });
      const usuarioCreado =
        creado?.usuario || creado || {
          id: Date.now(),
          nombre: ctx.nuevoUsuario.nombre.trim(),
          correo: ctx.nuevoUsuario.correo.trim(),
          rol: ctx.nuevoUsuario.rol,
        };
      ctx.setUsuarios((prev) => [usuarioCreado, ...prev]);
      ctx.setNuevoUsuario({
        nombre: "",
        correo: "",
        contrasena: "",
        rol: "USER",
      });
      ctx.setErrorUsuario("");
    } catch (err) {
      ctx.setErrorUsuario(err.message || "Error creando usuario");
    }
  };

  //Actualizo un campo del usuario seleccionado y sincronizo en la lista
  const handleActualizarUsuario = async (campo, valor) => {
    if (!ctx.usuarioSeleccionado) return;
    const correoActual = ctx.usuarioSeleccionado.correo;
    const payload = { correo: correoActual };
    if (campo === "correo") {
      payload.nuevo_correo = valor;
    } else {
      payload[campo] = valor;
    }
    try {
      await api.actualizarUsuarioApi(correoActual, payload);
      ctx.setUsuarioSeleccionado((prev) => ({ ...prev, [campo]: valor }));
      ctx.setUsuarios((prev) =>
        prev.map((u) =>
          u.id === ctx.usuarioSeleccionado.id ? { ...u, [campo]: valor } : u
        )
      );
    } catch (err) {
      ctx.setErrorUsuario(err.message || "No se pudo actualizar el usuario");
    }
  };

  //Reseteo la contraseña de un usuario sin tocar el estado visible
  const handleResetUsuarioContrasena = async (correo, nuevaContrasena) => {
    ctx.setErrorUsuario("");
    if (!correo || !nuevaContrasena?.trim()) {
      ctx.setErrorUsuario("Indica una contraseña valida");
      return;
    }
    try {
      await api.actualizarUsuarioApi(correo, {
        correo,
        contrasena: nuevaContrasena.trim(),
      });
    } catch (err) {
      ctx.setErrorUsuario(err.message || "No se pudo resetear la contraseña");
    }
  };

  //Elimino un usuario y limpio la seleccion si corresponde
  const handleEliminarUsuario = async (id) => {
    const confirmado = window.confirm("Eliminar este usuario?");
    if (!confirmado) return;
    const usuario = ctx.usuarios.find((u) => u.id === id);
    if (usuario?.correo) {
      try {
        await api.eliminarUsuarioApi(usuario.correo);
      } catch (err) {
        console.error(err);
      }
    }
    ctx.setUsuarios((prev) => prev.filter((u) => u.id !== id));
    if (ctx.usuarioSeleccionado?.id === id) {
      ctx.setUsuarioSeleccionado(null);
    }
  };

  //Asigno un usuario a un proyecto si no estaba ya asignado
  const handleAsignarUsuario = async (proyectoId, usuarioId) => {
    if (!usuarioId) return;
    try {
      await api.asignarUsuarioProyecto(proyectoId, usuarioId);
      ctx.setAsignaciones((prev) => {
        const lista = prev[proyectoId] || [];
        if (lista.includes(usuarioId)) return prev;
        return { ...prev, [proyectoId]: [...lista, usuarioId] };
      });
    } catch (err) {
      console.error(err);
    }
  };

  //Quito la asignacion de un usuario en un proyecto
  const handleDesasignarUsuario = async (proyectoId, usuarioId) => {
    try {
      await api.desasignarUsuarioProyecto(proyectoId, usuarioId);
      ctx.setAsignaciones((prev) => {
        const lista = prev[proyectoId] || [];
        return { ...prev, [proyectoId]: lista.filter((id) => id !== usuarioId) };
      });
    } catch (err) {
      console.error(err);
    }
  };

  return {
    //Acciones disponibles para la vista
    handleNuevoUsuario,
    handleActualizarUsuario,
    handleResetUsuarioContrasena,
    handleEliminarUsuario,
    handleAsignarUsuario,
    handleDesasignarUsuario,
  };
}
