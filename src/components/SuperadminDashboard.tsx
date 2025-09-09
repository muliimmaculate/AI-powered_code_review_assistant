import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';

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

const statusColors: Record<string, string> = {
  pending: 'border-yellow-400 bg-yellow-900/20',
  approved: 'border-green-400 bg-green-900/20',
  rejected: 'border-red-400 bg-red-900/20',
};

const SuperadminDashboard: React.FC = () => {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState<{orgId: string, action: 'approved' | 'rejected' | null} | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(collection(db, 'pendingOrganizations'), (snap) => {
      setOrgs(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Org)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAction = async (orgId: string, status: 'approved' | 'rejected') => {
    setConfirm(null);
    const orgRef = doc(db, 'pendingOrganizations', orgId);
    await updateDoc(orgRef, { status });
    setActionMsg(`Organization ${status === 'approved' ? 'approved' : 'rejected'} successfully.`);
    setTimeout(() => setActionMsg(''), 2000);
  };

  const stats = {
    total: orgs.length,
    pending: orgs.filter(o => o.status === 'pending').length,
    approved: orgs.filter(o => o.status === 'approved').length,
    rejected: orgs.filter(o => o.status === 'rejected').length,
  };

  const filteredOrgs = orgs.filter(org => {
    const matchesSearch =
      org.orgName.toLowerCase().includes(search.toLowerCase()) ||
      org.adminEmail.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || org.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center">
      <div className="max-w-4xl w-full mt-0 bg-gray-800 text-white rounded-lg p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Superadmin Dashboard</h2>
        {/* Stats Bar */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-gray-400 mt-1">Total Orgs</div>
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
        {/* Search/Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by org name or admin email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        {actionMsg && <div className="mb-4 text-green-400 text-center">{actionMsg}</div>}
        <h3 className="text-xl font-semibold mb-4 text-center">All Organizations</h3>
        {loading ? (
          <div className="text-gray-400 text-center">Loading organizations...</div>
        ) : filteredOrgs.length === 0 ? (
          <div className="text-gray-400 text-center">No organizations found.</div>
        ) : (
          <div className="space-y-4">
            {filteredOrgs.map(org => (
              <div
                key={org.id}
                className={`rounded-lg p-4 shadow border-2 flex flex-col gap-2 ${statusColors[org.status] || 'border-gray-700 bg-gray-900'}`}
              >
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <div className="font-bold text-lg flex items-center gap-2">
                      {org.orgName}
                      {org.status === 'pending' && <span className="text-xs px-2 py-1 rounded bg-yellow-400 text-black ml-2">Pending</span>}
                      {org.status === 'approved' && <span className="text-xs px-2 py-1 rounded bg-green-400 text-black ml-2">Approved</span>}
                      {org.status === 'rejected' && <span className="text-xs px-2 py-1 rounded bg-red-400 text-white ml-2">Rejected</span>}
                    </div>
                    <div className="text-xs text-gray-400">{org.status?.toUpperCase() || 'UNKNOWN'}</div>
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
                {org.status === 'pending' && (
                  <div className="mt-4 flex gap-4 justify-center">
                    <button
                      onClick={() => setConfirm({ orgId: org.id, action: 'approved' })}
                      className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 font-semibold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setConfirm({ orgId: org.id, action: 'rejected' })}
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
        {/* Confirmation Dialog */}
        {confirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
            <div className="bg-gray-800 rounded-lg p-8 shadow-lg text-center">
              <h4 className="text-xl font-bold mb-4">Confirm {confirm.action === 'approved' ? 'Approval' : 'Rejection'}</h4>
              <p className="mb-6">Are you sure you want to {confirm.action} this organization?</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleAction(confirm.orgId, confirm.action!)}
                  className={`px-6 py-2 rounded font-semibold ${confirm.action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                >
                  Yes, {confirm.action === 'approved' ? 'Approve' : 'Reject'}
                </button>
                <button
                  onClick={() => setConfirm(null)}
                  className="px-6 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperadminDashboard; 