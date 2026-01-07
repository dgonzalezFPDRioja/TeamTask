//rutas
import { Routes, Route } from "react-router-dom";
//Pantallas principales
import Home from "./features/user/pages/Home";
import Login from "./features/auth/pages/Login";
import AdminUI from "./features/admin/pages/adminUI";
import ManagerUI from "./features/manager/pages/managerUI";

function App() {
  //Defino las rutas
  return (
    <Routes>
      {/*Ruta principal para usuarios*/}
      <Route path="/" element={<Home />} />
      {/*Login*/}
      <Route path="/login" element={<Login />} />
      {/*Panel admin*/}
      <Route path="/admin" element={<AdminUI />} />
      {/*Panel manager*/}
      <Route path="/manager" element={<ManagerUI />} />
    </Routes>
  );
}

export default App;
