import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { Megaphone, PlusCircle, CheckCircle2 } from 'lucide-react';

export const TeacherAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'IMPORTANT'>('NORMAL');
  const [targetClassId, setTargetClassId] = useState('');
  const [targetSection, setTargetSection] = useState('');

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const [annRes, clsRes] = await Promise.all([
        apiRequest('/announcements'),
        apiRequest('/classes')
      ]);
      setAnnouncements(annRes.announcements || []);
      setClassesList(clsRes.classes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      await apiRequest('/announcements/create', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          priority,
          target_class_id: targetClassId,
          target_section: targetSection
        })
      });

      setMsg('Announcement created and broadcasted successfully.');
      setTitle('');
      setDescription('');
      setTimeout(() => setMsg(null), 3000);
      fetchAnnouncements();
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading announcements...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Broadcast Announcements</h1>
        <p className="text-xs text-gray-500">Create target notifications for specific classes, sections, or entire school</p>
      </div>

      {msg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Megaphone className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-gray-900">Create New Announcement</h3>
        </div>

        <form onSubmit={handleCreateAnnouncement} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Announcement Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Science Fair Submission Deadline"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white font-semibold"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="IMPORTANT">🚨 Important / Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Class (Optional - Leave blank for all)</label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none bg-white"
              >
                <option value="">All Classes</option>
                {classesList.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Section (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Section A"
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Announcement Details</label>
            <textarea
              required
              rows={3}
              placeholder="Enter complete announcement content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Publish Announcement
          </button>
        </form>
      </div>

      {/* Published Announcements List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900">Published Announcements</h3>
        {announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((a: any) => (
              <div key={a.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-gray-900">{a.title}</h4>
                    <StatusBadge status={a.priority} />
                  </div>
                  <span className="text-[11px] text-gray-400">{a.date}</span>
                </div>
                <p className="text-xs text-gray-700">{a.description}</p>
                <div className="text-[10px] text-gray-500 pt-1">
                  Target: <span className="font-semibold">{a.class_name || 'All Classes'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No published announcements" description="Publish announcements to inform students and parents." />
        )}
      </div>
    </div>
  );
};
