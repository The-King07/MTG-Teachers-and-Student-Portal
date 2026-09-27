import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, UserCheck, Users, ShieldAlert, ArrowRight, BookOpen, KeyRound, Mail, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../api/client';

export const AuthPage: React.FC = () => {
  const { user, login, registerUser } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'PARENT'>('STUDENT');

  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [studentCodeToLink, setStudentCodeToLink] = useState('');
  const [classId, setClassId] = useState('');
  const [section, setSection] = useState('A');

  const [classesList, setClassesList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const dest =
        user.role === 'TEACHER'
          ? '/teacher/dashboard'
          : user.role === 'PARENT'
          ? '/parent/dashboard'
          : '/student/dashboard';
      navigate(dest, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    apiRequest<{ classes: any[] }>('/classes').then(res => setClassesList(res.classes || [])).catch(() => {});
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await apiRequest<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail: username, password })
      });
      await login(res.token, res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await registerUser({
        name,
        username,
        email,
        password,
        role,
        phone,
        qualification,
        student_code_to_link: studentCodeToLink,
        class_id: classId,
        section
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 py-12">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Make The Grade Logo"
            className="w-20 h-20 mx-auto rounded-full border-2 border-amber-500 shadow-md object-cover mb-3"
            onError={(e) => { (e.target as HTMLImageElement).src = '/logo.jpg'; }}
          />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">MAKE THE GRADE</h1>
          <p className="text-xs font-semibold tracking-widest text-amber-600 uppercase mt-1">Learning Made Simple</p>
          <p className="text-xs text-gray-500 mt-2">Academic Management & Communication Platform</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6 border border-gray-200">
          <button
            onClick={() => { setMode('LOGIN'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'LOGIN' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('REGISTER'); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'REGISTER' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Username or Email</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Enter username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { r: 'STUDENT', label: 'Student', icon: GraduationCap },
                  { r: 'TEACHER', label: 'Teacher', icon: UserCheck },
                  { r: 'PARENT', label: 'Parent', icon: Users }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = role === item.r;
                  return (
                    <button
                      key={item.r}
                      type="button"
                      onClick={() => setRole(item.r as any)}
                      className={`p-2.5 rounded-lg border text-center text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-700' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Eleanor Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="evance"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="eleanor@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Role specific extra fields */}
            {role === 'STUDENT' && (
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Class</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md bg-white outline-none font-semibold text-gray-900"
                  >
                    <option value="">Select Class...</option>
                    {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cName => {
                      const matched = classesList.find(c => c.name.toLowerCase() === cName.toLowerCase());
                      const val = matched ? matched.id : cName;
                      return <option key={cName} value={val}>{cName}</option>;
                    })}
                    {classesList.filter(c => !c.name.toLowerCase().startsWith('class ')).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    placeholder="Section A"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md bg-white outline-none"
                  />
                </div>
              </div>
            )}

            {role === 'TEACHER' && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Qualification / Title</label>
                <input
                  type="text"
                  placeholder="e.g. M.Sc Mathematics / Senior Faculty"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md bg-white outline-none"
                />
              </div>
            )}

            {role === 'PARENT' && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Link Child Student Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. STU-123456"
                  value={studentCodeToLink}
                  onChange={(e) => setStudentCodeToLink(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md bg-white outline-none"
                />
                <p className="text-[10px] text-gray-500 mt-1">You can also link child code after logging in from your parent dashboard.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating Account...' : `Register as ${role}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
