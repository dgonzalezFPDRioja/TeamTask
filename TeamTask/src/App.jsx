import { Routes, Route } from "react-router-dom";
import Home from "./features/user/pages/Home";
import Login from "./features/auth/pages/Login";
import AdminUI from "./features/admin/pages/adminUI";

function App() {
  //Defino las rutas principales de la app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminUI />} />
    </Routes>
  );
}

export default App;
