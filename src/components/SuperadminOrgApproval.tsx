import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

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

const SuperadminOrgApproval: React.FC = () => {
  const [pendingOrgs, setPendingOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchPendingOrgs = async () => {
    setLoading(true);
    const q = query(collection(db, 'pendingOrganizations'), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    setPendingOrgs(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Org)));
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingOrgs();
  }, []);

  const handleAction = async (orgId: string, status: 'approved' | 'rejected') => {
    await updateDoc(doc(db, 'pendingOrganizations', orgId), { status });
    setActionMsg(`Organization ${status === 'approved' ? 'approved' : 'rejected'} successfully.`);
    fetchPendingOrgs();
  };

  if (loading) return <div className="text-center text-white mt-12">Loading pending organizations...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-12 bg-gray-800 text-white rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Pending Organization Approvals</h2>
      {actionMsg && <div className="mb-4 text-green-400">{actionMsg}</div>}
      {pendingOrgs.length === 0 ? (
        <div className="text-gray-400">No pending organizations.</div>
      ) : (
        <div className="space-y-6">
          {pendingOrgs.map(org => (
            <div key={org.id} className="bg-gray-900 rounded-lg p-6 shadow">
              <div className="mb-2"><span className="font-semibold">Organization:</span> {org.orgName}</div>
              <div className="mb-2"><span className="font-semibold">Contact Email:</span> {org.contactEmail}</div>
              <div className="mb-2"><span className="font-semibold">Website:</span> {org.website}</div>
              <div className="mb-2"><span className="font-semibold">Phone:</span> {org.phone}</div>
              <div className="mb-2"><span className="font-semibold">Address:</span> {org.address}</div>
              <div className="mb-2"><span className="font-semibold">Admin Name:</span> {org.adminName}</div>
              <div className="mb-2"><span className="font-semibold">Admin Email:</span> {org.adminEmail}</div>
              {org.message && <div className="mb-2"><span className="font-semibold">Message:</span> {org.message}</div>}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperadminOrgApproval; 