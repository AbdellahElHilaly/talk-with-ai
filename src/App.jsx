import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import GroqGuide from './pages/GroqGuide';
import ElevenLabsGuide from './pages/ElevenLabsGuide';
import GroqKeysPage from './pages/GroqKeysPage';
import ElevenKeysPage from './pages/ElevenKeysPage';
import InterestingWordsPage from './pages/InterestingWordsPage';

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

        {/* Settings & Management */}
        <Route path="/settings/groq-keys" element={<GroqKeysPage />} />
        <Route path="/settings/eleven-keys" element={<ElevenKeysPage />} />
        <Route path="/settings/vocabulary" element={<InterestingWordsPage />} />

        {/* Individual Support Guides */}
        <Route path="/guide/groq" element={<GroqGuide />} />
        <Route path="/guide/eleven" element={<ElevenLabsGuide />} />
      </Routes>
    </Router>
  );
}

export default App;
