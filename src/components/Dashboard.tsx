import React, { useState } from 'react';
import ConsumerDashboard from './dashboards/ConsumerDashboard';
import BusinessDashboard from './dashboards/BusinessDashboard';
import FacilityDashboard from './dashboards/FacilityDashboard';

interface DashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    type: string;
    points?: number;
    joinDate: string;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const renderDashboard = () => {
    switch (user.type) {
      case 'consumer':
        return <ConsumerDashboard user={user} />;
      case 'business':
        return <BusinessDashboard user={user} />;
      case 'facility':
        return <FacilityDashboard user={user} />;
      default:
        return <ConsumerDashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;