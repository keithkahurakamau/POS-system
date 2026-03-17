import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Sidebar from './components/Sidebar';
import POS from './pages/POS';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import SalesHistory from './pages/SalesHistory';
function App() {
  return (
    <CartProvider>
      <Router>
        <div className="flex h-screen w-full bg-slate-100 overflow-hidden">
          {/* Persistent Sidebar */}
          <Sidebar />

          {/* Dynamic Page Content */}
          <main className="flex-1 overflow-hidden relative">
            <Routes>
              <Route path="/" element={<POS />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/history" element={<SalesHistory />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;