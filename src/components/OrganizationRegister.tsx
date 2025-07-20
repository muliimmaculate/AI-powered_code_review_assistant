import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

interface OrganizationRegisterProps {
  onRegistered: (docId: string) => void;
}

const OrganizationRegister: React.FC<OrganizationRegisterProps> = ({ onRegistered }) => {
  const [orgName, setOrgName] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!orgName.trim() || !website.trim() || !phone.trim() || !address.trim() || !adminName.trim() || !adminEmail.trim()) {
      setError('All fields except message are required.');
      setLoading(false);
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'pendingOrganizations'), {
        orgName,
        website,
        phone,
        address,
        adminName,
        adminEmail,
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      localStorage.setItem('orgDocId', docRef.id);
      onRegistered(docRef.id);
    } catch (error) {
      setError('Failed to submit registration. Please try again.');
      console.error('Error submitting registration:', error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 text-white rounded-lg p-6 max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold mb-4">Register Your Organization</h2>
      {error && <div className="mb-3 text-red-400">{error}</div>}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Organization Name</label>
        <input
          type="text"
          value={orgName}
          onChange={e => setOrgName(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
          required
        />
      </div>      
      <div className="mb-4">
        <label className="block mb-1 font-medium">Website URL</label>
        <input
          type="url"
          value={website}
          onChange={e => setWebsite(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Address</label>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Admin Full Name</label>
        <input
          type="text"
          value={adminName}
          onChange={e => setAdminName(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Admin Email</label>
        <input
          type="email"
          value={adminEmail}
          onChange={e => setAdminEmail(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700 transition-colors"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Registration'}
      </button>
    </form>
  );
};

export default OrganizationRegister; 