import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, addDoc, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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

const sendInviteEmail = async (name: string, email: string) => {
  await fetch('/sendRecommendationEmail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      recommendation: [
        'Welcome to the team! You have been added to the AI Code Review Assistant system.',
        'Please log in using your email address.',
        'If you do not have a password, use the "Forgot Password" link to set one.',
        'Access the dashboard here: [Login Page URL]'
      ]
    })
  });
};

const TeamDashboard: React.FC = () => {
  const { teamMember, authLoading } = useContext(AuthContext) || {};
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<Omit<TeamMember, 'id' | 'expertise'>>({
    name: '',
    email: '',
    avatar: '',
    role: 'developer',
    isOnline: false,
    stats: { reviewsCompleted: 0, codeQualityScore: 0, issuesFixed: 0, linesReviewed: 0 },
    activity: { lastActive: new Date(), currentStreak: 0, totalContributions: 0 },
    phone: '',
    location: '',
    bio: '',
    linkedin: '',
    dateJoined: ''
  });
  const [expertiseInput, setExpertiseInput] = useState<string>('');
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editExpertiseInput, setEditExpertiseInput] = useState<string>('');
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [profileEdit, setProfileEdit] = useState<boolean>(false);
  const [profileForm, setProfileForm] = useState<{ avatar: string; expertise: string; bio: string } | null>(null);

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
        expertise: expertiseInput.split(',').map((s: string) => s.trim()).filter((s: string) => !!s),
        activity: {
          ...newMember.activity,
          lastActive: Timestamp.fromDate(new Date()),
        },
        dateJoined: newMember.dateJoined ? Timestamp.fromDate(new Date(newMember.dateJoined)) : Timestamp.fromDate(new Date()),
      });
      await sendInviteEmail(newMember.name, newMember.email.trim().toLowerCase());
      setNewMember({
        name: '',
        email: '',
        avatar: '',
        role: 'developer',
        isOnline: false,
        stats: { reviewsCompleted: 0, codeQualityScore: 0, issuesFixed: 0, linesReviewed: 0 },
        activity: { lastActive: new Date(), currentStreak: 0, totalContributions: 0 },
        phone: '',
        location: '',
        bio: '',
        linkedin: '',
        dateJoined: ''
      });
      setExpertiseInput('');
      setShowForm(false);
    } catch {
      setAddError('Failed to add member.');
    }
    setAdding(false);
  };

  // Edit member logic
  const openEditModal = (member: TeamMember) => {
    setEditMember(member);
    setEditExpertiseInput((member.expertise || []).join(', '));
    setEditModalOpen(true);
  };
  const handleEditMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editMember || !orgDocId) return;
    const memberRef = doc(db, 'pendingOrganizations', orgDocId, 'teamMembers', editMember.id);
    await updateDoc(memberRef, {
      ...editMember,
      expertise: editExpertiseInput.split(',').map((s: string) => s.trim()).filter((s: string) => !!s),
    });
    setEditModalOpen(false);
    setEditMember(null);
  };
  // Delete member logic
  const handleDeleteMember = async (id: string) => {
    if (!orgDocId) return;
    await deleteDoc(doc(db, 'pendingOrganizations', orgDocId, 'teamMembers', id));
    setDeleteMemberId(null);
  };
  // Profile edit logic
  const startProfileEdit = () => {
    setProfileForm({
      avatar: teamMember.avatar || '',
      expertise: (teamMember.expertise || []).join(', '),
      bio: teamMember.bio || ''
    });
    setProfileEdit(true);
  };
  const handleProfileEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teamMember || !orgDocId || !profileForm) return;
    const memberRef = doc(db, 'pendingOrganizations', orgDocId, 'teamMembers', teamMember.id);
    await updateDoc(memberRef, {
      avatar: profileForm.avatar,
      expertise: profileForm.expertise.split(',').map((s: string) => s.trim()).filter((s: string) => !!s),
      bio: profileForm.bio,
    });
    setProfileEdit(false);
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
      () => {
        setError('Failed to load team members.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [orgDocId]);

  const filteredMembers = teamMembers.filter((member: TeamMember) =>
    (roleFilter === 'all' || member.role === roleFilter) &&
    (member.name.toLowerCase().includes(search.toLowerCase()) || member.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (authLoading || loading) {
    return <div className="bg-gray-800 rounded-lg p-6 text-white">Loading team members...</div>;
  }
  if (!teamMember) {
    return <div className="bg-red-900 text-white p-6 rounded-lg text-center">Access denied. You are not a member of this team.</div>;
  }
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* My Profile Card */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center gap-6 border border-gray-100 dark:border-gray-700">
        {teamMember.avatar ? (
          <img src={teamMember.avatar} alt={teamMember.name} className="w-16 h-16 rounded-full object-cover border-2 border-blue-200" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl border-2 border-blue-200">
            {teamMember.name.slice(0,2).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 dark:text-white text-xl">{teamMember.name}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleColors[teamMember.role]}`}>{teamMember.role.charAt(0).toUpperCase() + teamMember.role.slice(1)}</span>
            {teamMember.isOnline && <span className="ml-1 w-2 h-2 bg-green-500 rounded-full inline-block" title="Online"></span>}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{teamMember.email}</div>
          <div className="flex flex-wrap gap-2 mb-1">
            {(teamMember.expertise || []).map((exp: string, idx: number) => (
              <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{exp}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-300">
            <span><strong>{teamMember.stats?.reviewsCompleted || 0}</strong> Reviews</span>
            <span><strong>{teamMember.stats?.codeQualityScore || 0}</strong> Quality</span>
            <span><strong>{teamMember.stats?.issuesFixed || 0}</strong> Issues Fixed</span>
            <span><strong>{teamMember.stats?.linesReviewed || 0}</strong> Lines Reviewed</span>
          </div>
        </div>
        <div>
          <button className="text-blue-600 hover:underline text-xs font-medium" onClick={startProfileEdit}>Edit Profile</button>
        </div>
      </div>
      {profileEdit && profileForm && (
        <form onSubmit={handleProfileEdit} className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col gap-4 border border-gray-100 dark:border-gray-700">
          <div className="flex gap-4">
            <input type="text" value={profileForm.avatar} onChange={e => setProfileForm((f: { avatar: string; expertise: string; bio: string } | null) => f ? { ...f, avatar: e.target.value } : f)} placeholder="Avatar URL" className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-64" />
            <input type="text" value={profileForm.expertise} onChange={e => setProfileForm((f: { avatar: string; expertise: string; bio: string } | null) => f ? { ...f, expertise: e.target.value } : f)} placeholder="Expertise (comma separated)" className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-64" />
            <input type="text" value={profileForm.bio} onChange={e => setProfileForm((f: { avatar: string; expertise: string; bio: string } | null) => f ? { ...f, bio: e.target.value } : f)} placeholder="Bio" className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-64" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">Save</button>
            <button type="button" className="px-5 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm font-medium" onClick={() => setProfileEdit(false)}>Cancel</button>
          </div>
        </form>
      )}
      {/* Add Member Card (only for lead/architect) */}
      {(teamMember.role === 'lead' || teamMember.role === 'architect') && (
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
                <select value={newMember.role} onChange={e => setNewMember(n => ({ ...n, role: e.target.value as 'developer' | 'senior' | 'lead' | 'architect' }))} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                  <option value="developer">Developer</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="architect">Architect</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Expertise (comma separated)</label>
                <input type="text" value={expertiseInput} onChange={e => setExpertiseInput(e.target.value)} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-56" placeholder="e.g. React, Node.js, Python" />
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
        ) : filteredMembers.map((member: TeamMember) => (
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
              {(member.expertise || []).map((exp: string, idx: number) => (
                <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{exp}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-300">
              <span><strong>{member.stats.reviewsCompleted}</strong> Reviews</span>
              <span><strong>{member.stats.codeQualityScore}</strong> Quality</span>
              <span><strong>{member.stats.issuesFixed}</strong> Issues Fixed</span>
              <span><strong>{member.stats.linesReviewed}</strong> Lines Reviewed</span>
            </div>
            {(teamMember.role === 'lead' || teamMember.role === 'architect') && (
              <div className="flex justify-end mt-2 gap-2">
                <button className="text-blue-600 hover:underline text-xs font-medium" onClick={() => openEditModal(member)}>Edit</button>
                <button className="text-red-600 hover:underline text-xs font-medium" onClick={() => setDeleteMemberId(member.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Edit Member Modal */}
      {editModalOpen && editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form onSubmit={handleEditMember} className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 flex flex-col gap-4 border border-gray-100 dark:border-gray-700 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Edit Member</h3>
            <input type="text" value={editMember.name} onChange={e => setEditMember(m => m ? { ...m, name: e.target.value } : m)} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm" required />
            <input type="text" value={editMember.avatar} onChange={e => setEditMember(m => m ? { ...m, avatar: e.target.value } : m)} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm" placeholder="Avatar URL" />
            <input type="text" value={editExpertiseInput} onChange={e => setEditExpertiseInput(e.target.value)} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm" placeholder="Expertise (comma separated)" />
            <select value={editMember.role} onChange={e => setEditMember(m => m ? { ...m, role: e.target.value as 'developer' | 'senior' | 'lead' | 'architect' } : m)} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              <option value="developer">Developer</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="architect">Architect</option>
            </select>
            <div className="flex gap-2 mt-2">
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">Save</button>
              <button type="button" className="px-5 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm font-medium" onClick={() => setEditModalOpen(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Member Modal */}
      {deleteMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-700 w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-4">Remove Team Member?</h3>
            <p className="mb-6">Are you sure you want to remove this member from the team?</p>
            <div className="flex gap-2 justify-center">
              <button className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium" onClick={() => handleDeleteMember(deleteMemberId)}>Remove</button>
              <button className="px-5 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm font-medium" onClick={() => setDeleteMemberId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Assignments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Assignments</h2>
        <div className="text-gray-400">Assignment management coming soon.</div>
      </div>
    </div>
  );
};

export default TeamDashboard;
