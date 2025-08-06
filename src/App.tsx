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
  const { moderator, loading: moderatorLoading, signOut: moderatorSignOut } = useModerator();
  const [showAuth, setShowAuth] = useState(false);
  const [showModeratorLogin, setShowModeratorLogin] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const handleModeratorLogout = () => {
    moderatorSignOut();
    setShowModeratorLogin(false);
  };

  if (loading || moderatorLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show moderator login if requested
  if (showModeratorLogin && !moderator) {
    return (
      <ModeratorLogin onSuccess={() => {}} />
    );
  }

  // Show moderator dashboard if moderator is logged in
  if (moderator) {
    return <ModeratorDashboard onLogout={handleModeratorLogout} />;
  }

  // Show user dashboard if user is logged in
  if (user && profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          currentUser={profile} 
          onLogout={handleLogout}
          onBackToHome={handleLogout}
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