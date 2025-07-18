import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';

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
  activityLog?: { action: string; by: string; comment?: string; timestamp: any }[];
}

const SuperadminDashboard: React.FC = () => {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState('');

  const fetchOrgs = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'pendingOrganizations'));
    setOrgs(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Org)));
    setLoading(false);
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleAction = async (orgId: string, status: 'approved' | 'rejected', comment?: string) => {
    const orgRef = doc(db, 'pendingOrganizations', orgId);
    await updateDoc(orgRef, {
      status,
      activityLog: arrayUnion({
        action: status,
        by: 'Superadmin',
        comment: comment || '',
        timestamp: new Date().toISOString(),
      })
    });
    setActionMsg(`Organization ${status === 'approved' ? 'approved' : 'rejected'} successfully.`);
    setComment('');
    setShowModal(false);
    fetchOrgs();
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
    <div className="min-h-screen w-full bg-gray-900">
      <div className="max-w-5xl mx-auto mt-12 bg-gray-800 text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Superadmin Dashboard</h2>
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
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
        {actionMsg && <div className="mb-4 text-green-400">{actionMsg}</div>}
        <h3 className="text-xl font-semibold mb-4">All Organizations</h3>
        {loading ? (
          <div className="text-gray-400">Loading organizations...</div>
        ) : filteredOrgs.length === 0 ? (
          <div className="text-gray-400">No organizations found.</div>
        ) : (
          <div className="space-y-4">
            {filteredOrgs.map(org => (
              <div
                key={org.id}
                className="bg-gray-900 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition"
                onClick={() => { setSelectedOrg(org); setShowModal(true); }}
              >
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <div className="font-bold text-lg">{org.orgName}</div>
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
              </div>
            ))}
          </div>
        )}
        {/* Org Details Modal */}
        {showModal && selectedOrg && (
          <div className="fixed inset-0 bg-gray-950 bg-opacity-95 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-8 max-w-lg w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-2">{selectedOrg.orgName}</h3>
              <div className="mb-2 text-sm text-gray-400">Status: <span className="font-semibold">{selectedOrg.status?.toUpperCase() || 'UNKNOWN'}</span></div>
              <div className="mb-2 text-sm"><span className="font-semibold">Contact:</span> {selectedOrg.contactEmail}</div>
              <div className="mb-2 text-sm"><span className="font-semibold">Admin:</span> {selectedOrg.adminName} ({selectedOrg.adminEmail})</div>
              <div className="mb-2 text-sm"><span className="font-semibold">Website:</span> {selectedOrg.website}</div>
              <div className="mb-2 text-sm"><span className="font-semibold">Phone:</span> {selectedOrg.phone}</div>
              <div className="mb-2 text-sm"><span className="font-semibold">Address:</span> {selectedOrg.address}</div>
              {selectedOrg.message && <div className="mb-2 text-sm"><span className="font-semibold">Message:</span> {selectedOrg.message}</div>}
              {/* Approve/Reject with comment */}
              {selectedOrg.status === 'pending' && (
                <div className="mt-4">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Add a comment (optional)"
                    className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 mb-2"
                    rows={2}
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAction(selectedOrg.id, 'approved', comment)}
                      className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 font-semibold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(selectedOrg.id, 'rejected', comment)}
                      className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
              {/* Activity Log */}
              {selectedOrg.activityLog && selectedOrg.activityLog.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Activity Log</h4>
                  <ul className="text-xs max-h-32 overflow-y-auto pr-2">
                    {selectedOrg.activityLog.map((log, idx) => (
                      <li key={idx} className="mb-1 border-b border-gray-700 pb-1">
                        <span className="font-bold">{log.action.toUpperCase()}</span> by {log.by} {log.comment && (<span>- "{log.comment}"</span>)} <span className="text-gray-400">({new Date(log.timestamp).toLocaleString()})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperadminDashboard; 