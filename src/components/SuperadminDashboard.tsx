import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

interface Org {
  id: string;
  orgName: string;
  contactEmail: string;
  website: string;
  phone: string;
  address: string;
  adminName: string;
  adminEmail: string;
  message?: string;
  status: string;
  createdAt: any;
}

const SuperadminDashboard: React.FC = () => {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchOrgs = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'pendingOrganizations'));
    setOrgs(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Org)));
    setLoading(false);
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleAction = async (orgId: string, status: 'approved' | 'rejected') => {
    await updateDoc(doc(db, 'pendingOrganizations', orgId), { status });
    setActionMsg(`Organization ${status === 'approved' ? 'approved' : 'rejected'} successfully.`);
    fetchOrgs();
  };

  const stats = {
    total: orgs.length,
    pending: orgs.filter(o => o.status === 'pending').length,
    approved: orgs.filter(o => o.status === 'approved').length,
    rejected: orgs.filter(o => o.status === 'rejected').length,
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 bg-gray-800 text-white rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Superadmin Dashboard</h2>
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold">{stats.total}</div>
          <div className="text-gray-400 mt-1">Total Organizations</div>
        </div>
        <div className="bg-yellow-900/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-300">{stats.pending}</div>
          <div className="text-yellow-200 mt-1">Pending</div>
        </div>
        <div className="bg-green-900/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-300">{stats.approved}</div>
          <div className="text-green-200 mt-1">Approved</div>
        </div>
        <div className="bg-red-900/30 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-red-300">{stats.rejected}</div>
          <div className="text-red-200 mt-1">Rejected</div>
        </div>
      </div>
      {actionMsg && <div className="mb-4 text-green-400">{actionMsg}</div>}
      <h3 className="text-xl font-semibold mb-4">All Organizations</h3>
      {loading ? (
        <div className="text-gray-400">Loading organizations...</div>
      ) : orgs.length === 0 ? (
        <div className="text-gray-400">No organizations found.</div>
      ) : (
        <div className="space-y-4">
          {orgs.map(org => (
            <div key={org.id} className="bg-gray-900 rounded-lg p-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{org.orgName}</div>
                  <div className="text-xs text-gray-400">{org.status.toUpperCase()}</div>
                </div>
                <div className="text-sm">
                  <div><span className="font-semibold">Contact:</span> {org.contactEmail}</div>
                  <div><span className="font-semibold">Admin:</span> {org.adminName} ({org.adminEmail})</div>
                  <div><span className="font-semibold">Website:</span> {org.website}</div>
                  <div><span className="font-semibold">Phone:</span> {org.phone}</div>
                  <div><span className="font-semibold">Address:</span> {org.address}</div>
                </div>
                <div className="text-xs text-gray-400">Registered: {org.createdAt?.toDate?.().toLocaleString?.() || ''}</div>
              </div>
              {org.message && <div className="mt-2 text-gray-300"><span className="font-semibold">Message:</span> {org.message}</div>}
              {org.status === 'pending' && (
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleAction(org.id, 'approved')}
                    className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 font-semibold"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(org.id, 'rejected')}
                    className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 font-semibold"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperadminDashboard; 