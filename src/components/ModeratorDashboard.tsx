import React, { useState, useEffect } from 'react';
import { useModerator } from '../hooks/useModerator';
import { 
  Users, 
  Calendar, 
  Truck, 
  BarChart3, 
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Plus,
  Search,
  Filter,
  LogOut
} from 'lucide-react';

interface ModeratorDashboardProps {
  onLogout: () => void;
}

const ModeratorDashboard: React.FC<ModeratorDashboardProps> = ({ onLogout }) => {
  const { 
    moderator, 
    fetchAllPickups, 
    fetchAllUsers, 
    fetchGreenRiders,
    assignPickupToRider,
    updatePickupStatus,
    updatePickupPriority,
    createGreenRider,
    updateRiderAvailability
  } = useModerator();

  const [activeTab, setActiveTab] = useState('overview');
  const [pickups, setPickups] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<any>(null);
  const [showRiderModal, setShowRiderModal] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'pickups', label: 'Pickup Management', icon: Calendar },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'riders', label: 'Green Riders', icon: Truck },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pickupsData, usersData, ridersData] = await Promise.all([
        fetchAllPickups(),
        fetchAllUsers(),
        fetchGreenRiders()
      ]);
      
      setPickups(pickupsData);
      setUsers(usersData);
      setRiders(ridersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPickup = async (riderId: string, notes: string) => {
    if (!selectedPickup) return;
    
    const result = await assignPickupToRider(selectedPickup.id, riderId, notes);
    if (result.success) {
      setShowAssignModal(false);
      setSelectedPickup(null);
      loadData(); // Refresh data
    }
  };

  const handleStatusUpdate = async (pickupId: string, status: string) => {
    const result = await updatePickupStatus(pickupId, status);
    if (result.success) {
      loadData(); // Refresh data
    }
  };

  const handlePriorityUpdate = async (pickupId: string, priority: string) => {
    const result = await updatePickupPriority(pickupId, priority);
    if (result.success) {
      loadData(); // Refresh data
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'scheduled': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredPickups = pickups.filter(pickup => {
    const matchesSearch = pickup.items_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pickup.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pickup.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: 'Active Pickups', value: pickups.filter(p => p.status === 'in_progress').length, icon: Calendar, color: 'text-orange-600 bg-orange-100' },
    { label: 'Available Riders', value: riders.filter(r => r.is_available).length, icon: Truck, color: 'text-green-600 bg-green-100' },
    { label: 'Completed Today', value: pickups.filter(p => p.status === 'completed' && new Date(p.updated_at).toDateString() === new Date().toDateString()).length, icon: CheckCircle, color: 'text-purple-600 bg-purple-100' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading moderator dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Moderator Control Panel</h1>
              <p className="text-sm text-gray-600">Welcome, {moderator?.name}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Pickup Requests</h3>
              <div className="space-y-4">
                {pickups.slice(0, 5).map((pickup) => (
                  <div key={pickup.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-4 ${getStatusColor(pickup.status)}`}>
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{pickup.profiles?.name}</p>
                        <p className="text-sm text-gray-600">{pickup.items_description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(pickup.priority)}`}>
                        {pickup.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pickup Management Tab */}
        {activeTab === 'pickups' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search pickups..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Pickups List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned Rider
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPickups.map((pickup) => (
                      <tr key={pickup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{pickup.profiles?.name}</p>
                            <p className="text-sm text-gray-500">{pickup.profiles?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{pickup.items_description}</p>
                          <p className="text-sm text-gray-500">{pickup.estimated_weight} kg</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pickup.status)}`}>
                            {pickup.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={pickup.priority}
                            onChange={(e) => handlePriorityUpdate(pickup.id, e.target.value)}
                            className={`text-xs font-medium border-none bg-transparent ${getPriorityColor(pickup.priority).split(' ')[0]}`}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {pickup.green_riders ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900">{pickup.green_riders.name}</p>
                              <p className="text-sm text-gray-500">{pickup.green_riders.vehicle_type}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPickup(pickup);
                                setShowAssignModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Assign
                            </button>
                            <select
                              value={pickup.status}
                              onChange={(e) => handleStatusUpdate(pickup.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="scheduled">Scheduled</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Registered Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.user_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.points}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          View
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Suspend
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Green Riders Tab */}
        {activeTab === 'riders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Green Riders Management</h3>
              <button
                onClick={() => setShowRiderModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Rider
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {riders.map((rider) => (
                <div key={rider.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${rider.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <h4 className="font-semibold text-gray-900">{rider.name}</h4>
                    </div>
                    <span className="text-sm text-gray-500">{rider.vehicle_type}</span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {rider.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {rider.phone}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rating: {rider.rating}/5</span>
                      <span>Pickups: {rider.total_pickups}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => updateRiderAvailability(rider.id, !rider.is_available)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        rider.is_available 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {rider.is_available ? 'Set Unavailable' : 'Set Available'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedPickup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Assign Pickup to Rider</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Customer: {selectedPickup.profiles?.name}</p>
              <p className="text-sm text-gray-600">Items: {selectedPickup.items_description}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Rider
                </label>
                <select
                  id="rider-select"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Choose a rider</option>
                  {riders.filter(r => r.is_available).map((rider) => (
                    <option key={rider.id} value={rider.id}>
                      {rider.name} - {rider.vehicle_type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes-input"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="Add any special instructions..."
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const riderSelect = document.getElementById('rider-select') as HTMLSelectElement;
                  const notesInput = document.getElementById('notes-input') as HTMLTextAreaElement;
                  if (riderSelect.value) {
                    handleAssignPickup(riderSelect.value, notesInput.value);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeratorDashboard;