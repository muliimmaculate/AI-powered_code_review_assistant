import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const TeamMemberLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
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
        navigate('/');
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
        <h2 className="text-2xl font-bold mb-6 text-center">Team Member Login</h2>
        {error && <div className="mb-4 text-red-400 text-center">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamMemberLogin; 