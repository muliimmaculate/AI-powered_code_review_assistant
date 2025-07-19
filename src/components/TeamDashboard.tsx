import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'developer' | 'senior' | 'lead' | 'architect';
  expertise: string[];
  stats: {
    reviewsCompleted: number;
    codeQualityScore: number;
    issuesFixed: number;
    linesReviewed: number;
  };
  activity: {
    lastActive: Date;
    currentStreak: number;
    totalContributions: number;
  };
  isOnline: boolean;
  phone?: string;
  location?: string;
  bio?: string;
  linkedin?: string;
  dateJoined?: any;
}

const TeamDashboard: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    avatar: '',
    role: 'developer',
    expertise: '',
    isOnline: false,
    stats: { reviewsCompleted: 0, codeQualityScore: 0, issuesFixed: 0, linesReviewed: 0 },
    activity: { lastActive: new Date(), currentStreak: 0, totalContributions: 0 },
    phone: '',
    location: '',
    bio: '',
    linkedin: '',
    dateJoined: ''
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const orgDocId = localStorage.getItem('orgDocId');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAdding(true);
    try {
      if (!orgDocId) throw new Error('Organization not found.');
      await addDoc(collection(db, 'pendingOrganizations', orgDocId, 'teamMembers'), {
        ...newMember,
        email: newMember.email.trim().toLowerCase(),
        expertise: newMember.expertise.split(',').map(s => s.trim()).filter(Boolean),
        activity: {
          ...newMember.activity,
          lastActive: Timestamp.fromDate(new Date()),
        },
        dateJoined: newMember.dateJoined ? Timestamp.fromDate(new Date(newMember.dateJoined)) : Timestamp.fromDate(new Date()),
      });
      setNewMember({
        name: '',
        email: '',
        avatar: '',
        role: 'developer',
        expertise: '',
        isOnline: false,
        stats: { reviewsCompleted: 0, codeQualityScore: 0, issuesFixed: 0, linesReviewed: 0 },
        activity: { lastActive: new Date(), currentStreak: 0, totalContributions: 0 },
        phone: '',
        location: '',
        bio: '',
        linkedin: '',
        dateJoined: ''
      });
    } catch (err) {
      setAddError('Failed to add member.');
    }
    setAdding(false);
  };

  useEffect(() => {
    setLoading(true);
    if (!orgDocId) {
      setError('Organization not found.');
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(
      collection(db, 'pendingOrganizations', orgDocId, 'teamMembers'),
      (snapshot) => {
        setTeamMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember)));
        setLoading(false);
      },
      (err) => {
        setError('Failed to load team members.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [orgDocId]);

  if (loading) {
    return <div className="bg-gray-800 rounded-lg p-6 text-white">Loading team members...</div>;
  }
  if (error) {
    return <div className="bg-red-900 text-white p-6 rounded-lg">{error}</div>;
  }
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Add member form */}
      <form onSubmit={handleAddMember} className="mb-6 bg-gray-900 p-4 rounded-lg flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Name</label>
          <input type="text" value={newMember.name} onChange={e => setNewMember(n => ({ ...n, name: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-sm" required />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Email</label>
          <input type="email" value={newMember.email} onChange={e => setNewMember(n => ({ ...n, email: e.target.value }))} className="px-2 py-1 rounded bg-gray-700 text-white text-sm" required />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Role</label>
          <select value={newMember.role} onChange={e => setNewMember(n => ({ ...n, role: e.target.value as any }))} className="px-2 py-1 rounded bg-gray-700 text-white text-sm">
            <option value="developer">Developer</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
            <option value="architect">Architect</option>
          </select>
        </div>
        <button type="submit" disabled={adding} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{adding ? 'Adding...' : 'Add Member'}</button>
        {addError && <div className="text-red-400 text-xs ml-2">{addError}</div>}
      </form>
      {/* Team member list */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-white">Team Members</h3>
        <ul className="divide-y divide-gray-700">
          {teamMembers.map(member => (
            <li key={member.id} className="py-2 flex items-center justify-between">
              <span>{member.name} ({member.email}) - {member.role}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Assignment placeholder */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-white">Assignments</h3>
        <div className="text-gray-400">[Assignment management UI goes here]</div>
      </div>
    </div>
  );
};

export default TeamDashboard;
