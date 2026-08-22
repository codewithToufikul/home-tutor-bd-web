import { apiGet, apiPatch } from '@/src/repositories/baseRepository';
import { useState, useEffect, useCallback } from 'react';
import CoachingLayout from '@/src/components/CoachingLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import {
  ClipboardList, Check, X, Clock, RefreshCw,
  User, BookOpen, Phone, Mail, Search, GraduationCap,
} from 'lucide-react';

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api/v1';

type EnrollStatus = 'all' | 'pending' | 'approved' | 'rejected';

interface Enrollment {
  _id: string;
  batchId: string;
  batchName: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  institution?: string;
  studentClass?: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  createdAt: string;
  studentUserId?: { name: string; email: string; avatar?: string } | null;
}

export default function CoachingEnrollments() {

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filter, setFilter] = useState<EnrollStatus>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const list = await apiGet<Enrollment[]>('/enrollments/my-enrollments');
      setEnrollments(list || []);
    } catch {
      showToast('ডেটা লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  const handleAction = async (
    enrollmentId: string,
    status: 'approved' | 'rejected',
    note?: string,
  ) => {
    setActionLoading(enrollmentId);
    try {
      const updated = await apiPatch<Enrollment>(`/enrollments/${enrollmentId}/status`, { status, note: note || '' });
      if (updated) {
        setEnrollments((prev) =>
          prev.map((e) => (e._id === enrollmentId ? { ...e, status } : e)),
        );
        showToast(
          status === 'approved' ? 'ভর্তি অনুমোদিত হয়েছে!' : 'ভর্তি বাতিল করা হয়েছে',
          'success',
        );
        setRejectModal(null);
        setRejectNote('');
      }
    } catch (err: any) {
      showToast(err.message || 'কিছু একটা ভুল হয়েছে', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = enrollments.filter((e) => {
    const matchFilter = filter === 'all' || e.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (e.studentName || e.studentUserId?.name || '').toLowerCase().includes(q) ||
      e.batchName.toLowerCase().includes(q) ||
      (e.studentEmail || e.studentUserId?.email || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const counts = {
    all: enrollments.length,
    pending: enrollments.filter((e) => e.status === 'pending').length,
    approved: enrollments.filter((e) => e.status === 'approved').length,
    rejected: enrollments.filter((e) => e.status === 'rejected').length,
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-600 border border-amber-200',
      approved: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
      rejected: 'bg-rose-50 text-rose-600 border border-rose-200',
    };
    const label: Record<string, string> = { pending: 'অপেক্ষারত', approved: 'অনুমোদিত', rejected: 'বাতিল' };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${map[status] || ''}`}>
        {status === 'pending' && <Clock size={11} />}
        {status === 'approved' && <Check size={11} />}
        {status === 'rejected' && <X size={11} />}
        {label[status] || status}
      </span>
    );
  };

  return (
    <CoachingLayout title="ভর্তির আবেদন">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[999] px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-bold flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        >
          {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Reject Note Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">ভর্তি বাতিল করুন</h3>
            <p className="text-sm text-gray-500 mb-4">
              <strong>{rejectModal.name}</strong> এর আবেদন বাতিল করতে চান?
            </p>
            <textarea
              className="w-full border border-gray-200 rounded-2xl p-4 text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-rose-300 mb-4"
              placeholder="বাতিলের কারণ লিখুন (ঐচ্ছিক)..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectNote(''); }}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
              >
                না, থাকুক
              </button>
              <button
                onClick={() => handleAction(rejectModal.id, 'rejected', rejectNote)}
                disabled={actionLoading === rejectModal.id}
                className="flex-1 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-all disabled:opacity-60"
              >
                {actionLoading === rejectModal.id ? 'প্রসেস হচ্ছে...' : 'হ্যাঁ, বাতিল করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="text-primary" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-gray-900">ভর্তির আবেদন</h2>
              <p className="text-xs text-gray-500">শিক্ষার্থীদের আবেদন অনুমোদন বা বাতিল করুন</p>
            </div>
          </div>
          <button
            onClick={fetchEnrollments}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-bold transition-all shadow-sm"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            রিফ্রেশ
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(['all', 'pending', 'approved', 'rejected'] as EnrollStatus[]).map((s) => {
            const colorMap: Record<string, string> = {
              all: 'from-indigo-500 to-violet-600',
              pending: 'from-amber-400 to-orange-500',
              approved: 'from-emerald-400 to-teal-600',
              rejected: 'from-rose-400 to-pink-600',
            };
            const labelMap: Record<string, string> = {
              all: 'মোট আবেদন', pending: 'অপেক্ষারত', approved: 'অনুমোদিত', rejected: 'বাতিল',
            };
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-2xl p-4 text-left transition-all border-2 cursor-pointer ${
                  filter === s
                    ? 'border-transparent shadow-lg bg-gradient-to-br ' + colorMap[s] + ' text-white'
                    : 'border-gray-100 bg-white hover:border-primary/20'
                }`}
              >
                <div className={`text-2xl font-extrabold ${filter === s ? 'text-white' : 'text-gray-900'}`}>
                  {counts[s]}
                </div>
                <div className={`text-xs font-bold mt-1 ${filter === s ? 'text-white/80' : 'text-gray-500'}`}>
                  {labelMap[s]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="শিক্ষার্থীর নাম, ব্যাচ বা ইমেইল দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <RefreshCw size={40} className="animate-spin mb-4 text-primary" />
            <p className="text-sm font-bold">ডেটা লোড হচ্ছে...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ClipboardList size={48} className="mb-4 opacity-30" />
            <p className="text-base font-bold text-gray-600 mb-1">কোনো আবেদন পাওয়া যায়নি</p>
            <p className="text-sm text-gray-400">
              {filter !== 'all' ? 'অন্য ফিল্টার ব্যবহার করুন' : 'শিক্ষার্থীরা আবেদন করলে এখানে দেখা যাবে।'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((enrollment) => {
              const name = enrollment.studentUserId?.name || enrollment.studentName || 'অজানা';
              const email = enrollment.studentUserId?.email || enrollment.studentEmail || '';
              const phone = enrollment.studentPhone || '';
              const avatar = (enrollment.studentUserId as any)?.avatar || '';
              const isPending = enrollment.status === 'pending';

              return (
                <div
                  key={enrollment._id}
                  className={`bg-white rounded-3xl border p-5 transition-all hover:shadow-md ${
                    isPending ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-primary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-sm">{name}</span>
                        {statusBadge(enrollment.status)}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <BookOpen size={11} /> {enrollment.batchName} {enrollment.studentClass ? `(${enrollment.studentClass})` : ''}
                        </span>
                        {enrollment.institution && (
                          <span className="flex items-center gap-1 text-indigo-600 font-medium">
                            <GraduationCap size={12} /> {enrollment.institution}
                          </span>
                        )}
                        {email && (
                          <span className="flex items-center gap-1">
                            <Mail size={11} /> {email}
                          </span>
                        )}
                        {phone && (
                          <span className="flex items-center gap-1 font-bold text-gray-700">
                            <Phone size={11} /> {phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(enrollment.createdAt).toLocaleDateString('bn-BD', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </span>
                      </div>
                      {enrollment.note && (
                        <div className="mt-2 text-xs bg-amber-50/80 border border-amber-200/60 p-2.5 rounded-xl text-amber-900">
                          <strong className="font-bold">📝 মেসেজ/নোট:</strong> {enrollment.note}
                        </div>
                      )}
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAction(enrollment._id, 'approved')}
                          disabled={actionLoading === enrollment._id}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all disabled:opacity-60 shadow-md shadow-emerald-200"
                        >
                          <Check size={14} />
                          {actionLoading === enrollment._id ? 'প্রসেস...' : 'অনুমোদন'}
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: enrollment._id, name })}
                          disabled={actionLoading === enrollment._id}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all disabled:opacity-60"
                        >
                          <X size={14} />
                          বাতিল
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CoachingLayout>
  );
}
