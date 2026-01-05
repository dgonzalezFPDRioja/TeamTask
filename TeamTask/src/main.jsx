//Piezas basicas para arrancar la app
import React from 'react'
import ReactDOM from 'react-dom/client'
//Rutas para movernos entre pantallas
import { BrowserRouter } from 'react-router-dom'
//Pantalla principal
import App from './App'
//Estilos base y estilos propios
import 'bootstrap/dist/css/bootstrap.min.css'
import './estilo.css'
//Monto la app en modo estricto y con enrutador

ReactDOM.createRoot(document.getElementById('root')).render(
  //Envuelvo la app para tener rutas y control extra
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
