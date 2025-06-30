import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, VideoOff, Users, MessageSquare, Share, Settings, Phone, UserPlus, Play, Square } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, updateDoc, arrayUnion, collection, addDoc, query, where, orderBy, serverTimestamp, getDocs, deleteDoc } from 'firebase/firestore';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: 'reviewer' | 'author' | 'observer';
  isVideoOn: boolean;
  isAudioOn: boolean;
  isPresenting: boolean;
  cursor?: { x: number; y: number };
  isOnline: boolean;
}

interface LiveComment {
  id: string;
  author: Participant;
  content: string;
  timestamp: Date;
  line?: number;
  resolved: boolean;
}

interface LiveReviewSessionProps {
  sessionId: string;
  codeContent: string;
  onCodeChange: (code: string) => void;
  participants: any[];
  isActive: boolean;
  onStartSession: () => void;
  onEndSession: () => void;
  onNotification: (msg: string) => void;
}

const firebaseConfig = {
  apiKey: "AIzaSyCESdNqE4J3FfVVFJTmyFEK1lJmB-tEPMI",
  authDomain: "project-70cbf.firebaseapp.com",
  databaseURL: "https://project-70cbf-default-rtdb.firebaseio.com",
  projectId: "project-70cbf",
  storageBucket: "project-70cbf.firebasestorage.app",
  messagingSenderId: "266192526810",
  appId: "1:266192526810:web:db8a75abeb35cc505a34e3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// WebRTC helpers
const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

export const LiveReviewSession: React.FC<LiveReviewSessionProps> = ({ sessionId, ...props }) => {
  // Use sessionId for all Firebase/WebRTC room logic
  // Example: const roomRef = firebase.firestore().collection('sessions').doc(sessionId);
  const [participants, setParticipants] = useState<Participant[]>(props.participants || []);
  const [comments, setComments] = useState<LiveComment[]>([]);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isPresenting, setIsPresenting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(props.isActive || false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const codeRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Generate a random user for this session (in real app, use auth)
  const [currentUser] = useState(() => ({
    id: Math.random().toString(36).substring(2, 10),
    name: 'Immaculate Muli',
    avatar: 'https://ui-avatars.com/api/?name=Immaculate+Muli&background=random',
    role: 'reviewer',
    isVideoOn: true,
    isAudioOn: true,
    isPresenting: false,
    isOnline: true
  }));

  const [remoteStreams, setRemoteStreams] = useState<{ [id: string]: MediaStream }>({});
  const peerConnections = useRef<{ [id: string]: RTCPeerConnection }>({});
  const signalingUnsubs = useRef<(() => void)[]>([]);

  const [isLobby, setIsLobby] = useState(true);
  const [isWaitingApproval, setIsWaitingApproval] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [hostId, setHostId] = useState<string | null>(null);

  const [showJoinPrompt, setShowJoinPrompt] = useState(true);
  const [declinedJoin, setDeclinedJoin] = useState(false);

  const [preJoinName, setPreJoinName] = useState('');
  const [preJoinReady, setPreJoinReady] = useState(false);
  const [preJoinStream, setPreJoinStream] = useState<MediaStream | null>(null);
  const [notAdmitted, setNotAdmitted] = useState(false);

  // Firestore listeners for participants and comments
  useEffect(() => {
    const sessionRef = doc(db, 'sessions', sessionId);
    const participantsRef = collection(sessionRef, 'participants');
    const commentsRef = collection(sessionRef, 'comments');

    // Add self to participants on join
    setDoc(doc(participantsRef, currentUser.id), {
      ...currentUser,
      joinedAt: serverTimestamp(),
    }, { merge: true });

    // Listen for participants
    const unsubParticipants = onSnapshot(participantsRef, (snapshot) => {
      setParticipants(snapshot.docs.map(doc => doc.data() as Participant));
    });

    // Listen for comments
    const q = query(commentsRef, orderBy('timestamp', 'asc'));
    const unsubComments = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ ...doc.data(), timestamp: doc.data().timestamp?.toDate?.() || new Date() }) as LiveComment));
    });

    // Cleanup on unmount
    return () => {
      unsubParticipants();
      unsubComments();
      // Optionally: set self offline or remove from participants
    };
  }, [sessionId, currentUser.id]);

  // WebRTC: Setup local media and signaling
  useEffect(() => {
    let localStream: MediaStream | null = null;
    let unsubSignals: (() => void)[] = [];
    let isMounted = true;
    let currentStreamType: 'camera' | 'screen' = 'camera';

    async function setup() {
      // 1. Get local media
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = localStream;
      }
      // 2. Listen for new participants
      const sessionRef = doc(db, 'sessions', sessionId);
      const participantsRef = collection(sessionRef, 'participants');
      const signalsRef = collection(sessionRef, 'signals');

      // 3. For each other participant, create a peer connection
      const unsub = onSnapshot(participantsRef, async (snapshot) => {
        const others = snapshot.docs.map(doc => doc.data()).filter((p: any) => p.id !== currentUser.id);
        for (const other of others) {
          if (!peerConnections.current[other.id]) {
            // Create peer connection
            const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
            peerConnections.current[other.id] = pc;
            // Add local tracks
            localStream!.getTracks().forEach(track => pc.addTrack(track, localStream!));
            // Handle remote stream
            pc.ontrack = (event) => {
              if (!isMounted) return;
              setRemoteStreams(prev => ({ ...prev, [other.id]: event.streams[0] }));
            };
            // ICE candidates
            pc.onicecandidate = (event) => {
              if (event.candidate) {
                addDoc(signalsRef, {
                  from: currentUser.id,
                  to: other.id,
                  type: 'ice',
                  candidate: event.candidate.toJSON(),
                  timestamp: Date.now()
                });
              }
            };
            // Create offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            addDoc(signalsRef, {
              from: currentUser.id,
              to: other.id,
              type: 'offer',
              sdp: offer.sdp,
              timestamp: Date.now()
            });
          }
        }
      });
      unsubSignals.push(unsub);
      // 4. Listen for incoming signals
      const q = query(signalsRef, where('to', '==', currentUser.id));
      const unsubSignal = onSnapshot(q, async (snapshot) => {
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const fromId = data.from;
          let pc = peerConnections.current[fromId];
          if (!pc) {
            pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
            peerConnections.current[fromId] = pc;
            localStream!.getTracks().forEach(track => pc.addTrack(track, localStream!));
            pc.ontrack = (event) => {
              if (!isMounted) return;
              setRemoteStreams(prev => ({ ...prev, [fromId]: event.streams[0] }));
            };
            pc.onicecandidate = (event) => {
              if (event.candidate) {
                addDoc(signalsRef, {
                  from: currentUser.id,
                  to: fromId,
                  type: 'ice',
                  candidate: event.candidate.toJSON(),
                  timestamp: Date.now()
                });
              }
            };
          }
          if (data.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            addDoc(signalsRef, {
              from: currentUser.id,
              to: fromId,
              type: 'answer',
              sdp: answer.sdp,
              timestamp: Date.now()
            });
          } else if (data.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }));
          } else if (data.type === 'ice' && data.candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (e) {}
          }
        }
      });
      unsubSignals.push(unsubSignal);
    }
    setup();
    signalingUnsubs.current = unsubSignals;
    return () => {
      isMounted = false;
      unsubSignals.forEach(unsub => unsub());
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      setRemoteStreams({});
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [sessionId, currentUser.id]);

  // Screen sharing (Presenting)
  const startPresenting = async () => {
    if (!isSessionActive) return;
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      // Replace video track in all peer connections
      Object.values(peerConnections.current).forEach(pc => {
        const senders = pc.getSenders().filter(s => s.track && s.track.kind === 'video');
        if (senders[0]) senders[0].replaceTrack(screenStream.getVideoTracks()[0]);
      });
      // Show screen in local video
      if (videoRef.current) videoRef.current.srcObject = screenStream;
      // When screen sharing stops, revert to camera
      screenStream.getVideoTracks()[0].onended = async () => {
        await stopPresenting();
      };
      setIsPresenting(true);
    } catch (e) {}
  };

  const stopPresenting = async () => {
    // Switch back to camera
    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    Object.values(peerConnections.current).forEach(pc => {
      const senders = pc.getSenders().filter(s => s.track && s.track.kind === 'video');
      if (senders[0]) senders[0].replaceTrack(cameraStream.getVideoTracks()[0]);
    });
    if (videoRef.current) videoRef.current.srcObject = cameraStream;
    setIsPresenting(false);
  };

  // Mute/unmute audio
  const toggleAudio = () => {
    setIsAudioOn(a => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getAudioTracks().forEach(track => (track.enabled = !a));
      }
      updateSelf({ isAudioOn: !a });
      return !a;
    });
  };

  // Presenting button handler
  const handlePresenting = () => {
    if (isPresenting) {
      stopPresenting();
    } else {
      startPresenting();
    }
    updateSelf({ isPresenting: !isPresenting });
  };

  // Add comment to Firestore
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const sessionRef = doc(db, 'sessions', sessionId);
    const commentsRef = collection(sessionRef, 'comments');
    await addDoc(commentsRef, {
      id: Date.now().toString(),
      author: currentUser,
      content: newComment,
      timestamp: new Date(),
      line: selectedLine || undefined,
      resolved: false
    });
    setNewComment('');
    setSelectedLine(null);
  };

  // Update participant state in Firestore
  const updateSelf = async (fields: Partial<Participant>) => {
    const sessionRef = doc(db, 'sessions', sessionId);
    const participantsRef = collection(sessionRef, 'participants');
    await updateDoc(doc(participantsRef, currentUser.id), fields);
  };

  const toggleVideo = () => {
    setIsVideoOn(v => {
      updateSelf({ isVideoOn: !v });
      return !v;
    });
  };

  const handleStartSession = () => {
    setIsSessionActive(true);
    if (props.onStartSession) {
      props.onStartSession();
    }
    if (props.onNotification) {
      props.onNotification('Live review session started!');
    }
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    if (props.onEndSession) {
      props.onEndSession();
    }
    if (props.onNotification) {
      props.onNotification('Live review session ended');
    }
  };

  const inviteParticipant = () => {
    // Always use the deployed Netlify domain for the invite link
    const url = `https://aicodereviewassist.netlify.app${window.location.pathname}?session=${sessionId}`;
    setInviteLink(url);
    setShowInviteModal(true);
    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    if (props.onNotification) {
      props.onNotification('Invite link copied to clipboard!');
    }
  };

  const codeLines = props.codeContent.split('\n');

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [comments]);

  useEffect(() => {
    if (isVideoOn && isSessionActive) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          localStreamRef.current = stream;
        })
        .catch(err => {
          if (props.onNotification) props.onNotification('Could not access webcam: ' + err.message);
        });
    } else {
      // Stop the video stream if it exists
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    // Cleanup on unmount
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isVideoOn, isSessionActive]);

  const handleResolveComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, resolved: !comment.resolved }
        : comment
    ));
    
    if (props.onNotification) {
      props.onNotification('Comment status updated');
    }
  };

  const handleLineClick = (lineNumber: number) => {
    setSelectedLine(lineNumber);
    if (props.onNotification) {
      props.onNotification(`Selected line ${lineNumber} for comment`);
    }
  };

  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.name);
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveSettings = () => {
    // Optionally update display name in Firestore
    setShowSettings(false);
    // Optionally: set dark mode globally
  };

  // Firestore: host/participant/join request logic
  useEffect(() => {
    const sessionRef = doc(db, 'sessions', sessionId);
    const hostField = async () => {
      const sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) {
        // First user becomes host
        await setDoc(sessionRef, { hostId: currentUser.id }, { merge: true });
        setIsHost(true);
        setHostId(currentUser.id);
      } else {
        const data = sessionSnap.data();
        setHostId(data.hostId);
        setIsHost(data.hostId === currentUser.id);
      }
    };
    hostField();
    // Listen for hostId changes
    const unsub = onSnapshot(sessionRef, (snap) => {
      const data = snap.data();
      if (data?.hostId) {
        setHostId(data.hostId);
        setIsHost(data.hostId === currentUser.id);
      }
    });
    return () => unsub();
  }, [sessionId, currentUser.id]);

  // Listen for join requests (host only)
  useEffect(() => {
    if (!isHost) return;
    const sessionRef = doc(db, 'sessions', sessionId);
    const joinRequestsRef = collection(sessionRef, 'joinRequests');
    const unsub = onSnapshot(joinRequestsRef, (snap) => {
      setPendingRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [isHost, sessionId]);

  // Listen for participant status (guest)
  useEffect(() => {
    if (isHost) return;
    const sessionRef = doc(db, 'sessions', sessionId);
    const participantsRef = collection(sessionRef, 'participants');
    const unsub = onSnapshot(participantsRef, (snap) => {
      const found = snap.docs.find(doc => doc.id === currentUser.id);
      if (found) {
        setIsLobby(false);
        setIsWaitingApproval(false);
      }
    });
    return () => unsub();
  }, [isHost, sessionId, currentUser.id]);

  // Pre-join camera/mic preview
  useEffect(() => {
    if (!isHost && isLobby && showJoinPrompt && !declinedJoin && !preJoinReady) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => setPreJoinStream(stream))
        .catch(() => setPreJoinStream(null));
      return () => {
        if (preJoinStream) preJoinStream.getTracks().forEach(track => track.stop());
      };
    }
  }, [isHost, isLobby, showJoinPrompt, declinedJoin, preJoinReady]);

  // Request to join handler
  const handleRequestToJoin = async () => {
    const sessionRef = doc(db, 'sessions', sessionId);
    const joinRequestsRef = collection(sessionRef, 'joinRequests');
    await setDoc(doc(joinRequestsRef, currentUser.id), {
      ...currentUser,
      name: preJoinName || currentUser.name,
      requestedAt: serverTimestamp(),
    });
    setIsWaitingApproval(true);
  };

  // Host: approve/deny join request
  const handleApproveRequest = async (request: any) => {
    const sessionRef = doc(db, 'sessions', sessionId);
    const participantsRef = collection(sessionRef, 'participants');
    await setDoc(doc(participantsRef, request.id), {
      ...request,
      joinedAt: serverTimestamp(),
    }, { merge: true });
    // Remove join request
    const joinRequestsRef = collection(sessionRef, 'joinRequests');
    await deleteDoc(doc(joinRequestsRef, request.id));
  };
  const handleDenyRequest = async (request: any) => {
    const sessionRef = doc(db, 'sessions', sessionId);
    const joinRequestsRef = collection(sessionRef, 'joinRequests');
    await deleteDoc(doc(joinRequestsRef, request.id));
    if (request.id === currentUser.id) setNotAdmitted(true);
  };

  // Pre-join lobby UI
  if (isLobby && !isHost && showJoinPrompt && !declinedJoin && !preJoinReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">Ready to join?</h2>
          <div className="mb-4">
            {preJoinStream ? (
              <video
                autoPlay
                playsInline
                muted
                ref={el => { if (el && preJoinStream) el.srcObject = preJoinStream; }}
                className="w-48 h-36 rounded bg-black mb-2"
              />
            ) : (
              <div className="w-48 h-36 rounded bg-gray-700 flex items-center justify-center mb-2">No Camera</div>
            )}
          </div>
          <input
            type="text"
            placeholder="Your name"
            value={preJoinName}
            onChange={e => setPreJoinName(e.target.value)}
            className="mb-4 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
          />
          <button
            onClick={() => setPreJoinReady(true)}
            className="px-6 py-3 bg-blue-600 rounded text-lg font-semibold hover:bg-blue-700"
            disabled={!preJoinName.trim()}
          >
            Ask to join
          </button>
        </div>
      </div>
    );
  }
  // Only show join prompt if not host/participant and not declined
  if (isLobby && !isHost && showJoinPrompt && !declinedJoin && preJoinReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">Do you want to join this session?</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setShowJoinPrompt(false)}
              className="px-6 py-3 bg-blue-600 rounded text-lg font-semibold hover:bg-blue-700"
            >
              Yes
            </button>
            <button
              onClick={() => { setDeclinedJoin(true); setShowJoinPrompt(false); }}
              className="px-6 py-3 bg-gray-600 rounded text-lg font-semibold hover:bg-gray-700"
            >
              No
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (isLobby && !isHost && declinedJoin) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">You did not join the session.</h2>
          <p className="text-lg">If you change your mind, refresh the page to join.</p>
        </div>
      </div>
    );
  }
  // Only show lobby/join UI if not a participant
  if (isLobby && !isHost && !showJoinPrompt && !declinedJoin) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
        <h2 className="text-2xl font-bold mb-4">Request to Join Session</h2>
        {!isWaitingApproval ? (
          <button onClick={async () => { await handleRequestToJoin(); if (preJoinStream) preJoinStream.getTracks().forEach(track => track.stop()); }} className="px-6 py-3 bg-blue-600 rounded text-lg font-semibold hover:bg-blue-700">Request to Join</button>
        ) : (
          <div className="text-lg mt-4">Waiting for host to approve your request...</div>
        )}
      </div>
    );
  }
  // If not admitted
  if (isLobby && !isHost && notAdmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">You were not admitted to the session.</h2>
          <p className="text-lg">Please contact the host or try again later.</p>
        </div>
      </div>
    );
  }

  // Host: show pending join requests
  const renderHostJoinRequests = () => isHost && pendingRequests.length > 0 && (
    <div className="fixed top-8 right-8 z-50 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-bold mb-2 text-white">Pending Join Requests</h3>
      {pendingRequests.map(req => (
        <div key={req.id} className="flex items-center justify-between mb-2 bg-gray-900 p-2 rounded">
          <div className="flex items-center gap-2">
            <img src={req.avatar} alt={req.name} className="w-8 h-8 rounded-full" />
            <span className="text-white font-medium">{req.name}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleApproveRequest(req)} className="bg-green-600 px-3 py-1 rounded text-white hover:bg-green-700">Approve</button>
            <button onClick={() => handleDenyRequest(req)} className="bg-red-600 px-3 py-1 rounded text-white hover:bg-red-700">Deny</button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden h-[600px] flex">
      {renderHostJoinRequests()}
      {/* Invite Modal */}
      {showInviteModal && inviteLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-width-md w-full text-center">
            <h2 className="text-lg font-bold mb-2 text-gray-900">Share this meeting link</h2>
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="w-full p-2 border border-gray-300 rounded mb-4 text-gray-800"
              onFocus={e => e.target.select()}
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
              onClick={() => {
                if (navigator.clipboard) navigator.clipboard.writeText(inviteLink);
              }}
            >
              Copy Link
            </button>
            <button
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={() => setShowInviteModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Video Grid */}
      <div className="absolute top-4 left-4 z-30 grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))`, maxWidth: '90vw' }}>
        {/* For each participant, show their video or avatar, name, and status */}
        {[currentUser, ...participants.filter(p => p.id !== currentUser.id)].map(participant => {
          const isLocal = participant.id === currentUser.id;
          const remoteStream = remoteStreams[participant.id];
          const showVideo = (isLocal && isVideoOn) || (!isLocal && participant.isVideoOn && remoteStream);
          return (
            <div key={participant.id} className="flex flex-col items-center bg-gray-900 rounded-lg p-2 shadow border border-gray-700 min-w-[160px]">
              {showVideo ? (
                <video
                  ref={isLocal ? videoRef : (el => { if (el && remoteStream) el.srcObject = remoteStream; })}
                  autoPlay
                  muted={isLocal}
                  playsInline
                  className="w-36 h-28 rounded bg-black border border-gray-700 mb-1"
                />
              ) : (
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-20 h-20 rounded-full object-cover bg-gray-700 mb-1"
                />
              )}
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-white font-medium truncate max-w-[80px]">{participant.name}</span>
                {participant.isPresenting && <Share className="w-3 h-3 text-blue-400" />}
                {!participant.isAudioOn && <MicOff className="w-3 h-3 text-red-400" />}
                {!participant.isVideoOn && <VideoOff className="w-3 h-3 text-gray-400" />}
              </div>
            </div>
          );
        })}
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isSessionActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <h2 className="text-white font-medium">Live Review Session</h2>
              <span className="text-sm text-gray-400">Session ID: {sessionId}</span>
              {isSessionActive && (
                <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded-full">
                  {participants.filter(p => p.isOnline).length} active
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {!isSessionActive ? (
                <button
                  onClick={handleStartSession}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Session</span>
                </button>
              ) : (
                <button
                  onClick={handleEndSession}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Square className="w-4 h-4" />
                  <span>End Session</span>
                </button>
              )}
              
              <button
                onClick={inviteParticipant}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite</span>
              </button>
              
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className={`p-2 rounded-lg transition-colors ${
                  showParticipants ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Users className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-2 rounded-lg transition-colors ${
                  showChat ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="h-full bg-gray-900 rounded-lg overflow-hidden">
            <div className="h-full flex">
              {/* Line Numbers */}
              <div className="bg-gray-800 p-4 text-right text-sm text-gray-500 font-mono select-none">
                {codeLines.map((_, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer hover:bg-gray-700 px-2 transition-colors ${
                      selectedLine === index + 1 ? 'bg-blue-900 text-blue-300' : ''
                    }`}
                    onClick={() => handleLineClick(index + 1)}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              
              {/* Code Content */}
              <div className="flex-1 relative">
                <textarea
                  ref={codeRef}
                  value={props.codeContent}
                  onChange={(e) => props.onCodeChange(e.target.value)}
                  className="w-full h-full p-4 bg-transparent text-white font-mono text-sm resize-none focus:outline-none"
                  spellCheck={false}
                  disabled={!isSessionActive}
                />
                
                {/* Live Comments Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {comments.filter(c => c.line).map(comment => (
                    <div
                      key={comment.id}
                      className="absolute right-4 pointer-events-auto"
                      style={{ top: `${(comment.line! - 1) * 24 + 16}px` }}
                    >
                      <div className={`p-2 rounded-lg shadow-lg max-w-xs transition-all hover:scale-105 ${
                        comment.resolved ? 'bg-green-900 border border-green-700' : 'bg-yellow-900 border border-yellow-700'
                      }`}>
                        <div className="flex items-center space-x-2 mb-1">
                          <img
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            className="w-4 h-4 rounded-full"
                          />
                          <span className="text-xs text-white font-medium">{comment.author.name}</span>
                          <button
                            onClick={() => handleResolveComment(comment.id)}
                            className="text-xs text-gray-300 hover:text-white transition-colors"
                          >
                            {comment.resolved ? 'Reopen' : 'Resolve'}
                          </button>
                        </div>
                        <p className="text-xs text-gray-200">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {!isSessionActive && (
                  <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-300 mb-2">Session Not Active</h3>
                      <p className="text-gray-500 mb-4">Start a live session to collaborate in real-time</p>
                      <button
                        onClick={handleStartSession}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Start Live Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleVideo}
                disabled={!isSessionActive}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
                } ${!isSessionActive ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleAudio}
                disabled={!isSessionActive}
                className={`p-3 rounded-full transition-colors ${
                  isAudioOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
                } ${!isSessionActive ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
              >
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={handlePresenting}
                disabled={!isSessionActive}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isPresenting ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                } ${!isSessionActive ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
              >
                <Share className="w-4 h-4" />
                <span>{isPresenting ? 'Stop Presenting' : 'Present'}</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                disabled={!isSessionActive}
                className={`p-2 rounded-lg transition-colors ${
                  !isSessionActive ? 'opacity-50 cursor-not-allowed bg-gray-700' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
        {/* Participants Panel */}
        {showParticipants && (
          <div className="border-b border-gray-700 p-4">
            <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Participants ({participants.length})</span>
            </h3>
            <div className="space-y-2">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center space-x-3 p-2 bg-gray-800 rounded-lg">
                  <div className="relative">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    {participant.isPresenting && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                    {participant.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-gray-800"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{participant.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{participant.role}</div>
                  </div>
                  <div className="flex space-x-1">
                    <div className={`w-2 h-2 rounded-full ${participant.isVideoOn ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${participant.isAudioOn ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Panel */}
        {showChat && (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-medium flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Comments & Chat</span>
              </h3>
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {comments.length === 0 ? (
                <div className="text-gray-500 text-center">No comments yet. Start the conversation!</div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className={`p-3 rounded-lg transition-all hover:bg-gray-700 ${
                    comment.resolved ? 'bg-green-900/20 border border-green-700/30' : 'bg-gray-800'
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-sm text-white font-medium">{comment.author.name}</span>
                      {comment.line && (
                        <span className="text-xs text-blue-400">Line {comment.line}</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {comment.timestamp instanceof Date ? comment.timestamp.toLocaleTimeString() : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                    <button
                      onClick={() => handleResolveComment(comment.id)}
                      className="text-xs text-blue-400 hover:text-blue-300 mt-1 transition-colors"
                    >
                      {comment.resolved ? 'Reopen' : 'Resolve'}
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-700">
              {selectedLine && (
                <div className="mb-2 text-xs text-blue-400">
                  Adding comment to line {selectedLine}
                </div>
              )}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a comment..."
                  disabled={!isSessionActive}
                  className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || !isSessionActive}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full text-center">
            <h2 className="text-lg font-bold mb-2 text-gray-900">Settings</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-gray-800"
              />
            </div>
            <div className="mb-4 flex items-center justify-center gap-2">
              <label className="text-gray-700">Dark Mode</label>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={e => setDarkMode(e.target.checked)}
              />
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
              onClick={handleSaveSettings}
            >
              Save
            </button>
            <button
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              onClick={() => setShowSettings(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};