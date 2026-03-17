import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import POS from './pages/POS';
// import Dashboard from './pages/Dashboard';
// import Products from './pages/Products';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<POS />} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          {/* <Route path="/products" element={<Products />} /> */}
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;