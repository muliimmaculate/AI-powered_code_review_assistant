import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { User, Mail, Building } from 'lucide-react';

interface TeamMemberLoginProps {
  onLogin?: (member: any) => void;
}

const TeamMemberLogin: React.FC<TeamMemberLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const orgDocId = localStorage.getItem('orgDocId');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!orgDocId) throw new Error('Organization not found.');
      const q = query(
        collection(db, 'pendingOrganizations', orgDocId, 'teamMembers'),
        where('email', '==', email.trim().toLowerCase())
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const member = snap.docs[0].data();
        localStorage.setItem('teamMember', JSON.stringify(member));
        if (onLogin) {
          onLogin(member);
        }
        // Force page reload to update the app state
        window.location.reload();
      } else {
        setError('You are not a member of this team. Please contact your admin.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 text-white rounded-lg p-8 w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Team Member Access</h2>
          <p className="text-gray-400 text-sm">Enter your email to access the code review system</p>
        </div>
        
        {error && <div className="mb-4 text-red-400 text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="your.email@company.com"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Checking access...</span>
              </div>
            ) : (
              'Access System'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Don't have access? Contact your team administrator to be added to the system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberLogin; 