import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="layout">
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gurvindersingh" element={<Dashboard />} />
          </Routes>
        </main>
        <footer style={{
          padding: '2rem 0',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          <div className="container">
            &copy; {new Date().getFullYear()} VideoHub Premium. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
