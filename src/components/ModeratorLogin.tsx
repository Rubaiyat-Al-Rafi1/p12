import React, { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useModerator } from '../hooks/useModerator';

interface ModeratorLoginProps {
  onSuccess: () => void;
}

const ModeratorLogin: React.FC<ModeratorLoginProps> = ({ onSuccess }) => {
  const { signIn, loading, error } = useModerator();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'moderator@gmail.com',
    password: 'md1234'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await signIn(formData.email, formData.password);
    if (data && !error) {
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Moderator Access</h1>
          <p className="text-gray-600 mt-2">System Administration Panel</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              placeholder="moderator@gmail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Enter moderator password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Access Control Panel'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Credentials</h3>
          <p className="text-xs text-gray-600">Email: moderator@gmail.com</p>
          <p className="text-xs text-gray-600">Password: md1234</p>
          <p className="text-xs text-red-600 mt-2">Note: Use these exact credentials to access the moderator panel</p>
        </div>
      </div>
    </div>
  );
};

export default ModeratorLogin;