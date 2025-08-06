import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useModerator } from './hooks/useModerator';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ModeratorLogin from './components/ModeratorLogin';
import ModeratorDashboard from './components/ModeratorDashboard';

function App() {
  const { user, profile, loading, signOut } = useAuth();
  const { moderator, signOut: moderatorSignOut } = useModerator();
  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showModeratorLogin, setShowModeratorLogin] = useState(false);
  const [showModeratorDashboard, setShowModeratorDashboard] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowDashboard(false);
  };

  const handleModeratorLogout = () => {
    moderatorSignOut();
    setShowModeratorDashboard(false);
    setShowModeratorLogin(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading GreenLoop...</p>
        </div>
      </div>
    );
  }

  // Show moderator login if requested
  if (showModeratorLogin && !moderator) {
    return (
      <ModeratorLogin 
        onSuccess={() => {
          setShowModeratorLogin(false);
          setShowModeratorDashboard(true);
        }}
      />
    );
  }

  // Show moderator dashboard if logged in
  if (showModeratorDashboard && moderator) {
    return <ModeratorDashboard onLogout={handleModeratorLogout} />;
  }

  if (showDashboard && user && profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          currentUser={profile} 
          onLogout={handleLogout}
          onBackToHome={() => setShowDashboard(false)}
        />
        <Dashboard user={profile} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        currentUser={profile} 
        onLogin={() => setShowAuth(true)}
        onLogout={handleLogout}
        onDashboard={() => setShowDashboard(true)}
      />
      <Hero onGetStarted={() => setShowAuth(true)} />
      <Features />
      <Footer onModeratorAccess={() => setShowModeratorLogin(true)} />
      
      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}

export default App;