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
    </Routes>
  )
}
