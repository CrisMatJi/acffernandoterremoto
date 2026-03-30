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
import './App.css'

export default function App() {
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
