import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { MessageSquare, Send, PlusCircle } from 'lucide-react';

export const TeacherChat: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showContactsModal, setShowContactsModal] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await apiRequest('/chat/conversations');
      setConversations(res.conversations || []);
      if (res.conversations && res.conversations.length > 0 && !activeConversation) {
        setActiveConversation(res.conversations[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await apiRequest('/chat/contacts');
      setContacts(res.contacts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await apiRequest(`/chat/messages/${convId}`);
      setMessages(res.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchContacts();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.conversation_id);
      const interval = setInterval(() => fetchMessages(activeConversation.conversation_id), 4000);
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  const handleStartChat = async (targetUserId: string) => {
    try {
      const res = await apiRequest('/chat/start', {
        method: 'POST',
        body: JSON.stringify({ target_user_id: targetUserId })
      });
      setShowContactsModal(false);
      await fetchConversations();
      const targetUser = contacts.find(c => c.id === targetUserId);
      setActiveConversation({
        conversation_id: res.conversation.id,
        other_user_id: targetUserId,
        other_user_name: targetUser?.name || 'User',
        other_user_role: targetUser?.role || 'STUDENT'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversation) return;

    try {
      const text = inputMessage;
      setInputMessage('');
      const res = await apiRequest('/chat/send', {
        method: 'POST',
        body: JSON.stringify({
          conversation_id: activeConversation.conversation_id,
          content: text
        })
      });
      setMessages(prev => [...prev, res.message]);
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading chat portal...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Academic Messaging Center</h1>
          <p className="text-xs text-gray-500">Communicate directly with students and parents</p>
        </div>
        <button
          onClick={() => setShowContactsModal(true)}
          className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-4 h-4" /> Start New Chat
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs grid grid-cols-1 md:grid-cols-3 min-h-[500px] overflow-hidden">
        {/* Left Col: Conversations */}
        <div className="border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-3 border-b border-gray-200 bg-white">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {conversations.length > 0 ? (
              conversations.map(c => {
                const isActive = activeConversation?.conversation_id === c.conversation_id;
                return (
                  <button
                    key={c.conversation_id}
                    onClick={() => setActiveConversation(c)}
                    className={`w-full p-3 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      isActive ? 'bg-amber-50/80 border-l-4 border-amber-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-300">
                      {c.other_user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-900 truncate">{c.other_user_name}</p>
                        <span className="text-[10px] text-amber-700 font-semibold">{c.other_user_role}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{c.last_message || 'No messages yet'}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-gray-400">
                No conversations active. Click "Start New Chat" to select a student or parent.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Chat Screen */}
        <div className="md:col-span-2 flex flex-col h-full bg-white">
          {activeConversation ? (
            <>
              <div className="p-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                    {activeConversation.other_user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{activeConversation.other_user_name}</p>
                    <p className="text-[10px] text-amber-700 font-semibold">{activeConversation.other_user_role}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[350px] max-h-[420px] bg-gray-50/30">
                {messages.length > 0 ? (
                  messages.map(m => {
                    const isMe = m.sender_id === user?.id;
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs ${
                            isMe
                              ? 'bg-amber-600 text-white rounded-br-none'
                              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-2xs'
                          }`}
                        >
                          <p>{m.content}</p>
                          <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-amber-100' : 'text-gray-400'}`}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-gray-400">
                    No message history yet. Send a message below.
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Write message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center">
              <EmptyState title="No conversation selected" description="Select a contact to begin academic messaging." />
            </div>
          )}
        </div>
      </div>

      {showContactsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Start Chat with Student or Parent</h3>
              <button onClick={() => setShowContactsModal(false)} className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer">✕</button>
            </div>
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {contacts.length > 0 ? (
                contacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => handleStartChat(contact.id)}
                    className="w-full p-3 text-left hover:bg-amber-50 flex items-center justify-between rounded-lg transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{contact.name}</p>
                      <p className="text-[10px] text-gray-500">{contact.role} • {contact.email}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-700">Chat</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-gray-400">No contacts found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
