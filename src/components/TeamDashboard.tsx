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
  const [showForm, setShowForm] = useState(true); // Always show form initially
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentUserProfile, setCurrentUserProfile] = useState<TeamMember | null>(null);
  const [teamMemberFromStorage, setTeamMemberFromStorage] = useState<any>(null);

  const orgDocId = localStorage.getItem('orgDocId');

  // Check for team member from localStorage
  useEffect(() => {
    const storedMember = localStorage.getItem('teamMember');
    if (storedMember) {
      try {
        const member = JSON.parse(storedMember);
        setTeamMemberFromStorage(member);
      } catch (error) {
        console.error('Error parsing stored team member:', error);
      }
    }
  }, []);

  // Add sample team members on first load if none exist
  useEffect(() => {
    const addSampleMembers = async () => {
      if (!orgDocId || teamMembers.length > 0) return;
      
      const sampleMembers = [
        {
          name: 'John Doe',
          email: 'john.doe@company.com',
          avatar: '',
          role: 'lead',
          expertise: ['React', 'TypeScript', 'Node.js'],
          isOnline: true,
          stats: { reviewsCompleted: 25, codeQualityScore: 85, issuesFixed: 12, linesReviewed: 5000 },
          activity: { lastActive: Timestamp.fromDate(new Date()), currentStreak: 5, totalContributions: 50 },
          phone: '+1-555-0123',
          location: 'San Francisco, CA',
          bio: 'Senior developer with 8 years of experience',
          linkedin: 'https://linkedin.com/in/johndoe',
          dateJoined: Timestamp.fromDate(new Date())
        },
        {
          name: 'Jane Smith',
          email: 'jane.smith@company.com',
          avatar: '',
          role: 'senior',
          expertise: ['Python', 'Django', 'PostgreSQL'],
          isOnline: false,
          stats: { reviewsCompleted: 18, codeQualityScore: 92, issuesFixed: 8, linesReviewed: 3200 },
          activity: { lastActive: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)), currentStreak: 3, totalContributions: 35 },
          phone: '+1-555-0124',
          location: 'New York, NY',
          bio: 'Backend specialist focused on scalable systems',
          linkedin: 'https://linkedin.com/in/janesmith',
          dateJoined: Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        }
      ];

      try {
        for (const member of sampleMembers) {
          await addDoc(collection(db, 'pendingOrganizations', orgDocId, 'teamMembers'), member);
        }
      } catch (error) {
        console.error('Error adding sample members:', error);
      }
    };

    // Add sample members after a short delay to ensure component is mounted
    const timer = setTimeout(addSampleMembers, 1000);
    return () => clearTimeout(timer);
  }, [orgDocId, teamMembers.length]);

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
  const displayUser = teamMember || teamMemberFromStorage || currentUserProfile;
  const isAdmin = displayUser && ['lead', 'architect'].includes(displayUser.role);
  const canAddMembers = isAdmin || !teamMemberFromStorage; // Allow if admin or if not a team member login

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
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* My Profile Card */}
      {displayUser && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h2>
          <div className="flex items-center gap-8">
          {displayUser.avatar ? (
            <img src={displayUser.avatar} alt={displayUser.name} className="w-20 h-20 rounded-full object-cover border-4 border-blue-200 shadow-md" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-2xl border-4 border-blue-200 shadow-md">
              {displayUser.name.slice(0,2).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900 dark:text-white text-2xl">{displayUser.name}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${roleColors[displayUser.role]}`}>{displayUser.role.charAt(0).toUpperCase() + displayUser.role.slice(1)}</span>
              {displayUser.isOnline && <span className="ml-1 w-2 h-2 bg-green-500 rounded-full inline-block" title="Online"></span>}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">{displayUser.email}</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {displayUser.expertise && displayUser.expertise.map((exp, idx) => (
                <span key={idx} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">{exp}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{displayUser.stats?.reviewsCompleted || 0}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{displayUser.stats?.codeQualityScore || 0}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Quality Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{displayUser.stats?.issuesFixed || 0}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Issues Fixed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{displayUser.stats?.linesReviewed || 0}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Lines Reviewed</div>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Add Member Card (only for lead/architect) */}
      {canAddMembers && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Team Member</h2>
            {/* Form is now always visible for easier access */}
            <button
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              onClick={() => setShowForm(f => !f)}
            >
              {showForm ? 'Hide Form' : 'Show Form'}
            </button>
          </div>
          {showForm && (
            <form onSubmit={handleAddMember} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                <input 
                  type="text" 
                  value={newMember.name} 
                  onChange={e => setNewMember(n => ({ ...n, name: e.target.value }))} 
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                  placeholder="Enter full name"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                <input 
                  type="email" 
                  value={newMember.email} 
                  onChange={e => setNewMember(n => ({ ...n, email: e.target.value }))} 
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                  placeholder="email@company.com"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role *</label>
                <select 
                  value={newMember.role} 
                  onChange={e => setNewMember(n => ({ ...n, role: e.target.value as any }))} 
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="developer">Developer</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="architect">Architect</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expertise (comma separated)</label>
                <input 
                  type="text" 
                  value={newMember.expertise} 
                  onChange={e => setNewMember(n => ({ ...n, expertise: e.target.value }))} 
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                  placeholder="e.g. React, Node.js, Python" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={newMember.phone} 
                  onChange={e => setNewMember(n => ({ ...n, phone: e.target.value }))} 
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                  placeholder="+1-555-0123" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input 
                  type="text" 
                  value={newMember.location} 
                  onChange={e => setNewMember(n => ({ ...n, location: e.target.value }))} 
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                  placeholder="City, State" 
                />
              </div>
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={adding} 
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  {adding ? 'Adding...' : 'Add Team Member'}
                </button>
              </div>
              {addError && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{addError}</div>}
            </form>
          )}
        </div>
      )}

      {!canAddMembers && (
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <User className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Team Member View</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              You're logged in as a team member. Contact your team lead or architect to add new members.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search & Filter Team Members</h3>
        <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-64 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="all">All Roles</option>
          <option value="developer">Developer</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead</option>
          <option value="architect">Architect</option>
        </select>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members ({filteredMembers.length})</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {error ? (
          <div className="col-span-full text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">{error}</div>
        ) : filteredMembers.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 bg-gray-50 dark:bg-gray-800 p-12 rounded-lg">
            <div className="text-6xl mb-4">👥</div>
            <h4 className="text-lg font-medium mb-2">No team members found</h4>
            <p className="text-sm">Try adjusting your search or add new team members above.</p>
          </div>
        ) : filteredMembers.map(member => (
          <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full object-cover border-3 border-blue-200 shadow-md" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg border-3 border-blue-200 shadow-md">
                  {member.name.slice(0,2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-white text-lg">{member.name}</span>
                  {member.isOnline && <span className="ml-1 w-2 h-2 bg-green-500 rounded-full inline-block" title="Online"></span>}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{member.email}</div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${roleColors[member.role]}`}>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {member.expertise && member.expertise.map((exp, idx) => (
                <span key={idx} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">{exp}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{member.stats.reviewsCompleted}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{member.stats.codeQualityScore}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Quality</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{member.stats.issuesFixed}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Issues Fixed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{member.stats.linesReviewed}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Lines Reviewed</div>
              </div>
            </div>
            <div className="flex justify-center">
              <button className="w-full px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium">View Profile</button>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Assignments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Assignments</h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Assignment Management</h4>
          <p className="text-gray-500 dark:text-gray-500">Coming soon - Assign code reviews and track progress</p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TeamDashboard;