import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../AuthContext';

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

const roleColors: Record<string, string> = {
  developer: 'bg-blue-100 text-blue-700',
  senior: 'bg-sky-100 text-sky-700',
  lead: 'bg-emerald-100 text-emerald-700',
  architect: 'bg-purple-100 text-purple-700',
};

const TeamDashboard: React.FC = () => {
  const authContext = useContext(AuthContext);
  const { user, teamMember, authLoading } = authContext || {};
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<Omit<TeamMember, 'id'> & { expertise: string }>({
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
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentUserProfile, setCurrentUserProfile] = useState<TeamMember | null>(null);

  const orgDocId = localStorage.getItem('orgDocId');

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
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
      setShowForm(false);
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
        const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
        setTeamMembers(members);
        
        // Set current user profile if not authenticated through Firebase Auth
        if (!teamMember && members.length > 0) {
          // For demo purposes, use the first member as current user
          // In production, this should be based on actual authentication
          setCurrentUserProfile(members[0]);
        }
        
        setLoading(false);
      },
      () => {
        setError('Failed to load team members.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [orgDocId, teamMember]);

  const filteredMembers = teamMembers.filter(member =>
    (roleFilter === 'all' || member.role === roleFilter) &&
    (member.name.toLowerCase().includes(search.toLowerCase()) || member.email.toLowerCase().includes(search.toLowerCase()))
  );

  // Use either authenticated team member or current user profile
  const displayUser = teamMember || currentUserProfile;
  if (authLoading || loading) {
    return <div className="bg-gray-800 rounded-lg p-6 text-white">Loading team members...</div>;
  }
  
  if (!displayUser && teamMembers.length === 0) {
    return (
      <div className="bg-yellow-900 text-white p-6 rounded-lg text-center">
        <h3 className="text-lg font-semibold mb-2">No Team Members Found</h3>
        <p>Add team members to get started with your organization.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* My Profile Card */}
      {displayUser && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center gap-6 border border-gray-100 dark:border-gray-700">
          {displayUser.avatar ? (
            <img src={displayUser.avatar} alt={displayUser.name} className="w-16 h-16 rounded-full object-cover border-2 border-blue-200" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl border-2 border-blue-200">
              {displayUser.name.slice(0,2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 dark:text-white text-xl">{displayUser.name}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleColors[displayUser.role]}`}>{displayUser.role.charAt(0).toUpperCase() + displayUser.role.slice(1)}</span>
              {displayUser.isOnline && <span className="ml-1 w-2 h-2 bg-green-500 rounded-full inline-block" title="Online"></span>}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{displayUser.email}</div>
            <div className="flex flex-wrap gap-2 mb-1">
              {displayUser.expertise && displayUser.expertise.map((exp, idx) => (
                <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{exp}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-300">
              <span><strong>{displayUser.stats?.reviewsCompleted || 0}</strong> Reviews</span>
              <span><strong>{displayUser.stats?.codeQualityScore || 0}</strong> Quality</span>
              <span><strong>{displayUser.stats?.issuesFixed || 0}</strong> Issues Fixed</span>
              <span><strong>{displayUser.stats?.linesReviewed || 0}</strong> Lines Reviewed</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Card (only for lead/architect) */}
      {displayUser && (displayUser.role === 'lead' || displayUser.role === 'architect') && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Team Member</h2>
            <button
              className="text-blue-600 hover:underline text-sm font-medium"
              onClick={() => setShowForm(f => !f)}
            >
              {showForm ? 'Hide Form' : 'Show Form'}
            </button>
          </div>
          {showForm && (
            <form onSubmit={handleAddMember} className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Name</label>
                <input type="text" value={newMember.name} onChange={e => setNewMember(n => ({ ...n, name: e.target.value }))} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-44" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email</label>
                <input type="email" value={newMember.email} onChange={e => setNewMember(n => ({ ...n, email: e.target.value }))} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-52" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Role</label>
                <select value={newMember.role} onChange={e => setNewMember(n => ({ ...n, role: e.target.value as any }))} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                  <option value="developer">Developer</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="architect">Architect</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Expertise (comma separated)</label>
                <input type="text" value={newMember.expertise} onChange={e => setNewMember(n => ({ ...n, expertise: e.target.value }))} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-56" placeholder="e.g. React, Node.js, Python" />
              </div>
              <button type="submit" disabled={adding} className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">{adding ? 'Adding...' : 'Add Member'}</button>
              {addError && <div className="text-red-500 text-xs ml-2">{addError}</div>}
            </form>
          )}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-64"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">All Roles</option>
          <option value="developer">Developer</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead</option>
          <option value="architect">Architect</option>
        </select>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {error ? (
          <div className="col-span-full text-center text-red-500">{error}</div>
        ) : filteredMembers.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">No team members found.</div>
        ) : filteredMembers.map(member => (
          <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex flex-col gap-3 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-200" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg border-2 border-blue-200">
                  {member.name.slice(0,2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">{member.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleColors[member.role]}`}>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</span>
                  {member.isOnline && <span className="ml-1 w-2 h-2 bg-green-500 rounded-full inline-block" title="Online"></span>}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{member.email}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {member.expertise && member.expertise.map((exp, idx) => (
                <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{exp}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-300">
              <span><strong>{member.stats.reviewsCompleted}</strong> Reviews</span>
              <span><strong>{member.stats.codeQualityScore}</strong> Quality</span>
              <span><strong>{member.stats.issuesFixed}</strong> Issues Fixed</span>
              <span><strong>{member.stats.linesReviewed}</strong> Lines Reviewed</span>
            </div>
            <div className="flex justify-end mt-2">
              <button className="text-blue-600 hover:underline text-xs font-medium">View Profile</button>
            </div>
          </div>
        ))}
      </div>

      {/* Assignments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Assignments</h2>
        <div className="text-gray-400">Assignment management coming soon.</div>
      </div>
    </div>
  );
};

export default TeamDashboard;
