import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import GroqGuide from './pages/GroqGuide';
import ElevenLabsGuide from './pages/ElevenLabsGuide';
import GroqKeysPage from './pages/GroqKeysPage';
import ElevenKeysPage from './pages/ElevenKeysPage';
import InterestingWordsPage from './pages/InterestingWordsPage';

/**
 * Smart-Lern Core Application Entry Point
 * Handles routing and high-level layout with error boundary protection.
 */
const App = () => {
  return (
    <ErrorBoundary>
      <Router basename="/talk-with-ai">
        <Routes>
          {/* Welcome & Onboarding */}
          <Route path="/" element={<HomePage />} />

          {/* Main Interface */}
          <Route path="/chat" element={<ErrorBoundary><ChatPage /></ErrorBoundary>} />

          {/* Settings & Management */}
          <Route path="/settings/groq-keys" element={<GroqKeysPage />} />
          <Route path="/settings/eleven-keys" element={<ElevenKeysPage />} />
          <Route path="/settings/vocabulary" element={<InterestingWordsPage />} />

          {/* Individual Support Guides */}
          <Route path="/guide/groq" element={<GroqGuide />} />
          <Route path="/guide/eleven" element={<ElevenLabsGuide />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
