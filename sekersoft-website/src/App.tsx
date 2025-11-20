import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Seo from './components/Seo'
import { pageMeta } from './config/pageMeta'
import Home from './pages/Home'
import Features from './pages/Features'
import Solutions from './pages/Solutions'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Testimonials from './pages/Testimonials'
import Demo from './pages/Demo'
import Resources from './pages/Resources'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import Support from './pages/Support'
import Privacy from './pages/legal/Privacy'
import Terms from './pages/legal/Terms'
import KVKK from './pages/legal/KVKK'
import CookiePolicy from './pages/legal/CookiePolicy'
import NotFound from './pages/NotFound'

const RouteMetadata = () => {
  const location = useLocation()
  const meta = pageMeta[location.pathname] ?? pageMeta.default

  return <Seo {...meta} path={location.pathname} structuredData={meta.structuredData} />
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <RouteMetadata />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/support" element={<Support />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/kvkk" element={<KVKK />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App

