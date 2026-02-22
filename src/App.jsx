import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import GuidePage from './pages/GuidePage';

/**
 * Smart-Lern Core Application Entry Point
 * Handles routing and high-level layout.
 */
const App = () => {
  return (
    <Router basename="/talk-with-ai">
      <Routes>
        {/* Welcome & Onboarding */}
        <Route path="/" element={<HomePage />} />

        {/* Main Interface */}
        <Route path="/chat" element={<ChatPage />} />

        {/* Support & Docs */}
        <Route path="/guide" element={<GuidePage />} />
      </Routes>
    </Router>
  );
}

export default App;
