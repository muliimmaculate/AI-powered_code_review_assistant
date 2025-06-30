import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, VideoOff, Users, MessageSquare, Share, Settings, Phone, UserPlus, Play, Square } from 'lucide-react';

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
  participants?: any[];
  isActive?: boolean;
  onStartSession?: () => void;
  onEndSession?: () => void;
  onNotification?: (message: string) => void;
}

export const LiveReviewSession: React.FC<LiveReviewSessionProps> = ({ 
  sessionId, 
  codeContent, 
  onCodeChange,
  participants: propParticipants,
  isActive: propIsActive,
  onStartSession,
  onEndSession,
  onNotification
}) => {
  const [participants, setParticipants] = useState<Participant[]>(propParticipants || [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face',
      role: 'reviewer',
      isVideoOn: true,
      isAudioOn: true,
      isPresenting: false,
      isOnline: true
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop&crop=face',
      role: 'author',
      isVideoOn: true,
      isAudioOn: true,
      isPresenting: true,
      isOnline: true
    }
  ]);

  const [comments, setComments] = useState<LiveComment[]>([
    {
      id: '1',
      author: participants[0],
      content: 'This function could be optimized using memoization',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      line: 15,
      resolved: false
    }
  ]);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isPresenting, setIsPresenting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(propIsActive || false);

  const codeRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [comments]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: LiveComment = {
      id: Date.now().toString(),
      author: participants[0], // Current user
      content: newComment,
      timestamp: new Date(),
      line: selectedLine || undefined,
      resolved: false
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
    setSelectedLine(null);
    
    if (onNotification) {
      onNotification(`Added comment: ${newComment.substring(0, 30)}...`);
    }
  };

  const handleResolveComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, resolved: !comment.resolved }
        : comment
    ));
    
    if (onNotification) {
      onNotification('Comment status updated');
    }
  };

  const handleLineClick = (lineNumber: number) => {
    setSelectedLine(lineNumber);
    if (onNotification) {
      onNotification(`Selected line ${lineNumber} for comment`);
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    if (onNotification) {
      onNotification(`Video ${!isVideoOn ? 'enabled' : 'disabled'}`);
    }
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    if (onNotification) {
      onNotification(`Audio ${!isAudioOn ? 'enabled' : 'disabled'}`);
    }
  };

  const togglePresenting = () => {
    setIsPresenting(!isPresenting);
    if (onNotification) {
      onNotification(`${!isPresenting ? 'Started' : 'Stopped'} presenting`);
    }
  };

  const handleStartSession = () => {
    setIsSessionActive(true);
    if (onStartSession) {
      onStartSession();
    }
    if (onNotification) {
      onNotification('Live review session started!');
    }
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    if (onEndSession) {
      onEndSession();
    }
    if (onNotification) {
      onNotification('Live review session ended');
    }
  };

  const inviteParticipant = () => {
    if (onNotification) {
      onNotification('Invitation sent to team members');
    }
  };

  const codeLines = codeContent.split('\n');

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden h-[600px] flex">
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
                  value={codeContent}
                  onChange={(e) => onCodeChange(e.target.value)}
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
                onClick={togglePresenting}
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
              {comments.map(comment => (
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
                      {comment.timestamp.toLocaleTimeString()}
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
              ))}
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
    </div>
  );
};