import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import GroqGuide from './pages/GroqGuide';
import GoogleGuide from './pages/GoogleGuide';

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

        {/* Individual Support Guides */}
        <Route path="/guide/groq" element={<GroqGuide />} />
        <Route path="/guide/google" element={<GoogleGuide />} />
      </Routes>
    </Router>
  );
}

export default App;
