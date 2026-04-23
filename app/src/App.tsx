import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import Crypto from './pages/Crypto';
import Loans from './pages/Loans';
import Savings from './pages/Savings';
import Portfolio from './pages/Portfolio';
import Cards from './pages/Cards';
import ChatSupport from './pages/ChatSupport';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/transfer" element={<Transfer />} />
      <Route path="/crypto" element={<Crypto />} />
      <Route path="/loans" element={<Loans />} />
      <Route path="/savings" element={<Savings />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/cards" element={<Cards />} />
      <Route path="/chat-support" element={<ChatSupport />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
