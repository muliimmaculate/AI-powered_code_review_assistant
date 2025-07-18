import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const OrganizationRegister: React.FC = () => {
  const [orgName, setOrgName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!orgName.trim() || !contactEmail.trim() || !website.trim() || !phone.trim() || !address.trim() || !adminName.trim() || !adminEmail.trim()) {
      setError('All fields except message are required.');
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'pendingOrganizations'), {
        orgName,
        contactEmail,
        website,
        phone,
        address,
        adminName,
        adminEmail,
        message,
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      localStorage.setItem('orgDocId', docRef.id);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit registration. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="bg-gray-800 text-white rounded-lg p-6 max-w-md mx-auto mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Registration Submitted</h2>
        <p className="mb-4">Your organization registration request has been submitted and is pending approval by a superadmin.</p>
        <p className="mb-6">Please <span className="font-semibold">log in with your admin email</span> to check your approval status. You will be automatically redirected to the main app once your organization is approved.</p>
        <a
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </a>
      </div>
    );
  }

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
        <label className="block mb-1 font-medium">Contact Email</label>
        <input
          type="email"
          value={contactEmail}
          onChange={e => setContactEmail(e.target.value)}
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
      <div className="mb-4">
        <label className="block mb-1 font-medium">Message (optional)</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
          rows={3}
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 rounded text-white font-semibold hover:bg-blue-700 transition-colors"
      >
        Submit Registration
      </button>
    </form>
  );
};

export default OrganizationRegister; 