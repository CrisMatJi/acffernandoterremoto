import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Referentes from './components/Referentes'
import Historia from './components/Historia'
import Eventos from './components/Eventos'
import Galeria from './components/Galeria'
import JuntaDirectiva from './components/JuntaDirectiva'
import VideoYoutube from './components/VideoYoutube'
import Contacto from './components/Contacto'
import Footer from './components/Footer'
import EventosLogin from './eventos/EventosLogin'
import SeatMap from './eventos/SeatMap'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import Socios from './admin/Socios'
import Actuaciones from './admin/Actuaciones'
import Reservas from './admin/Reservas'
import Configuracion from './admin/Configuracion'
import './App.css'

function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Referentes />
        <Historia />
        <Eventos />
        <Galeria />
        <JuntaDirectiva />
        <VideoYoutube />
        <Contacto />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/eventos" element={<EventosLogin />} />
      <Route path="/eventos/reserva" element={<SeatMap />} />
      {/* Admin — index = login, layout route sin path = panel protegido */}
      <Route path="/eventos/admin">
        <Route index element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="resumen"       element={<Dashboard />} />
          <Route path="socios"        element={<Socios />} />
          <Route path="actuaciones"   element={<Actuaciones />} />
          <Route path="reservas"      element={<Reservas />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Route>
    </Routes>
  )
}
