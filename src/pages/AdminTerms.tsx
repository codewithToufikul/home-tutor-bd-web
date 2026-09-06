import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, AlertCircle, CheckCircle2, ScrollText,
  PlusCircle, Trash2, Edit3, RotateCcw, Search,
  Eye, EyeOff, Loader2, Sparkles, X, Check, ArrowUpDown,
  BookOpen, Users, Building2, Scale
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import {
  useGetAdminTermsQuery,
  useCreateTermMutation,
  useUpdateTermMutation,
  useDeleteTermMutation,
  useResetTermsToDefaultMutation,
  type TermItem,
  type TermCategory,
} from '@/src/services/termsApi';
import { cn } from '@/src/lib/utils';

const CATEGORIES: Array<{ key: string; label: string; icon: any; color: string; desc: string }> = [
  { key: 'all', label: 'All Policies', icon: Scale, color: 'text-primary bg-primary/10 border-primary/20', desc: 'All platform terms & conditions' },
  { key: 'tutor', label: 'Tutor Policies', icon: BookOpen, color: 'text-purple-600 bg-purple-50 border-purple-200', desc: 'সার্ভিস চার্জ, ডেমো ক্লাস ও BTPA নীতিমালা' },
  { key: 'student_guardian', label: 'Student & Guardian', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200', desc: 'অভিভাবক ও শিক্ষার্থীদের গাইডলাইন' },
  { key: 'coaching', label: 'Coaching Center', icon: Building2, color: 'text-amber-600 bg-amber-50 border-amber-200', desc: 'কোচিং সেন্টার ও ব্যাচ নির্দেশনা' },
  { key: 'general', label: 'General Terms', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', desc: 'প্ল্যাটফর্মের সাধারণ আইনি শর্তাবলী' },
];

export default function AdminTerms() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // API Hooks
  const { data: rawTerms = [], isLoading, isFetching } = useGetAdminTermsQuery(
    selectedCategory === 'all' ? undefined : { category: selectedCategory }
  );
  const [createTerm, { isLoading: isCreating }] = useCreateTermMutation();
  const [updateTerm, { isLoading: isUpdating }] = useUpdateTermMutation();
  const [deleteTerm, { isLoading: isDeleting }] = useDeleteTermMutation();
  const [resetTerms, { isLoading: isResetting }] = useResetTermsToDefaultMutation();

  // Normalize terms
  const terms: TermItem[] = useMemo(() => {
    if (Array.isArray(rawTerms)) return rawTerms;
    if (Array.isArray((rawTerms as any)?.data)) return (rawTerms as any).data;
    return [];
  }, [rawTerms]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<TermItem | null>(null);
  const [termToDelete, setItemToDelete] = useState<TermItem | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State (Add / Edit)
  const [formCategory, setFormCategory] = useState<TermCategory>('tutor');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formOrder, setFormOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered terms
  const filteredTerms = useMemo(() => {
    return terms.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [terms, searchQuery, selectedCategory]);

  // Counts for KPIs
  const stats = useMemo(() => {
    const total = terms.length;
    const active = terms.filter((t) => t.isActive).length;
    const inactive = total - active;
    const tutorCount = terms.filter((t) => t.category === 'tutor').length;
    const studentCount = terms.filter((t) => t.category === 'student_guardian').length;
    return { total, active, inactive, tutorCount, studentCount };
  }, [terms]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormCategory(selectedCategory === 'all' ? 'tutor' : (selectedCategory as TermCategory));
    setFormTitle('');
    setFormContent('');
    setFormOrder(terms.length + 1);
    setFormIsActive(true);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (term: TermItem) => {
    setEditingTerm(term);
    setFormCategory(term.category);
    setFormTitle(term.title);
    setFormContent(term.content);
    setFormOrder(term.order ?? 1);
    setFormIsActive(term.isActive);
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('Title and content are required!', 'error');
      return;
    }

    try {
      await createTerm({
        category: formCategory,
        title: formTitle.trim(),
        content: formContent.trim(),
        order: Number(formOrder) || 1,
        isActive: formIsActive,
      }).unwrap();

      setIsAddModalOpen(false);
      showToast('✅ New policy term created successfully!');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to create policy term.', 'error');
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTerm) return;
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('Title and content are required!', 'error');
      return;
    }

    try {
      await updateTerm({
        id: editingTerm._id,
        data: {
          category: formCategory,
          title: formTitle.trim(),
          content: formContent.trim(),
          order: Number(formOrder) || 1,
          isActive: formIsActive,
        },
      }).unwrap();

      setEditingTerm(null);
      showToast('✅ Policy term updated successfully!');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to update policy term.', 'error');
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (term: TermItem) => {
    try {
      await updateTerm({
        id: term._id,
        data: { isActive: !term.isActive },
      }).unwrap();
      showToast(`Policy is now ${!term.isActive ? 'Active & Published' : 'Disabled'}`);
    } catch {
      showToast('Failed to toggle status', 'error');
    }
  };

  // Delete Term
  const handleDeleteConfirm = async () => {
    if (!termToDelete) return;
    try {
      await deleteTerm(termToDelete._id).unwrap();
      setItemToDelete(null);
      showToast('🗑️ Policy term deleted successfully.');
    } catch {
      showToast('Failed to delete term.', 'error');
    }
  };

  // Reset to Defaults
  const handleResetConfirm = async () => {
    try {
      await resetTerms().unwrap();
      setIsResetConfirmOpen(false);
      showToast('🔄 Policy terms reset to platform default policies.');
    } catch {
      showToast('Failed to reset terms.', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Toast alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                'fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2 border',
                toastMessage.type === 'success'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
                  : 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
              )}
            >
              {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{toastMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-lg shadow-ink/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
              <Scale size={24} />
            </div>
            <div>
              <h1 className="text-xl font-display font-black text-ink">Terms & Platform Policies</h1>
              <p className="text-xs font-medium text-ink-muted mt-0.5">
                Manage service charge policies, refund rules, guidelines & agreements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-ink/10 text-ink-muted hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-all font-bold text-xs cursor-pointer active:scale-95"
              title="Reset terms to default standard policies"
            >
              <RotateCcw size={14} />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-primary/25 cursor-pointer active:scale-95"
            >
              <PlusCircle size={15} />
              <span>Add New Policy</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur p-5 rounded-3xl border border-white/60 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Total Policies</span>
            <div className="text-2xl font-display font-black text-ink">{stats.total}</div>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-100 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Active & Visible</span>
            <div className="text-2xl font-display font-black text-emerald-700">{stats.active}</div>
          </div>
          <div className="bg-purple-50/70 border border-purple-100 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Tutor Rules</span>
            <div className="text-2xl font-display font-black text-purple-700">{stats.tutorCount}</div>
          </div>
          <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-3xl shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Student/Guardian</span>
            <div className="text-2xl font-display font-black text-blue-700">{stats.studentCount}</div>
          </div>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border cursor-pointer',
                      isActive
                        ? 'bg-ink text-white border-ink shadow-lg shadow-ink/15 scale-105'
                        : 'bg-white/70 text-ink-muted border-ink/5 hover:border-primary/20 hover:text-ink'
                    )}
                  >
                    <Icon size={14} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/80 border border-ink/5 rounded-2xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 size={36} className="text-primary animate-spin" />
            <p className="text-xs font-bold text-ink-muted">Loading policy terms...</p>
          </div>
        )}

        {/* Policy Cards Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredTerms.map((term, index) => {
                const catInfo = CATEGORIES.find((c) => c.key === term.category) || CATEGORIES[1];
                const CatIcon = catInfo.icon;

                return (
                  <motion.div
                    key={term._id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      'bg-white/80 backdrop-blur-xl p-6 rounded-3xl border shadow-xl shadow-ink/5 flex flex-col justify-between group transition-all duration-300 hover:shadow-2xl hover:shadow-ink/10',
                      !term.isActive ? 'opacity-60 border-dashed border-ink/20 bg-slate-50/70' : 'border-white/60'
                    )}
                  >
                    <div className="space-y-4">
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={cn('flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black border', catInfo.color)}>
                            <CatIcon size={11} />
                            {catInfo.label}
                          </span>
                          <span className="text-[10px] font-bold text-ink-muted bg-ink/5 px-2 py-0.5 rounded-md">
                            #{term.order || index + 1}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleActive(term)}
                            className={cn(
                              'p-1.5 rounded-xl border transition-colors cursor-pointer',
                              term.isActive
                                ? 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                : 'text-slate-400 bg-slate-100 border-slate-200 hover:bg-slate-200'
                            )}
                            title={term.isActive ? 'Active (Click to hide)' : 'Inactive (Click to publish)'}
                          >
                            {term.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>

                          <button
                            onClick={() => handleOpenEdit(term)}
                            className="p-1.5 rounded-xl text-primary bg-primary/10 border border-primary/20 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                            title="Edit policy content"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            onClick={() => setItemToDelete(term)}
                            className="p-1.5 rounded-xl text-rose-500 bg-rose-50 border border-rose-100 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                            title="Delete policy"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-ink/5 flex items-center justify-center text-ink shrink-0 mt-0.5">
                          <ScrollText size={16} />
                        </div>
                        <h3 className="text-base font-display font-black text-ink leading-snug">
                          {term.title}
                        </h3>
                      </div>

                      {/* Content Box */}
                      <div className="p-4 bg-ink/[0.02] rounded-2xl border border-ink/5">
                        <p className="text-xs font-medium text-ink-muted leading-relaxed text-justify whitespace-pre-wrap">
                          {term.content}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-4 mt-4 border-t border-ink/5 flex items-center justify-between text-[10px] text-ink-muted font-bold">
                      <span className={term.isActive ? 'text-emerald-600' : 'text-amber-600'}>
                        ● {term.isActive ? 'Live on platform' : 'Draft / Disabled'}
                      </span>
                      <span>Order: {term.order}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty Search Result */}
        {!isLoading && filteredTerms.length === 0 && (
          <div className="bg-white/60 p-12 rounded-3xl border border-white/60 text-center space-y-3">
            <div className="w-12 h-12 bg-ink/5 rounded-2xl flex items-center justify-center mx-auto text-ink-muted">
              <ScrollText size={24} />
            </div>
            <h3 className="text-base font-black text-ink">No policy terms found</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              {searchQuery ? `No terms match "${searchQuery}". Try a different keyword.` : 'Click "Add New Policy" to add your first platform term.'}
            </p>
          </div>
        )}

        {/* Legal Advisory Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-primary/5 to-purple-500/10 border border-primary/20 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
            <ShieldCheck size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-ink uppercase tracking-wider">Platform Compliance & Legal Notice</h4>
            <p className="text-xs font-medium text-ink-muted leading-relaxed">
              These policies represent binding terms for tutors, guardians, students, and coaching partners. Any changes made here are saved directly to the database and will reflect in all user dashboards and job applications immediately.
            </p>
          </div>
        </div>

        {/* ─── ADD MODAL ─── */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl border border-white/60 w-full max-w-lg p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-ink/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <PlusCircle size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-display font-black text-ink">Add New Policy Term</h3>
                      <p className="text-xs text-ink-muted">Create a new rule, guideline or terms clause</p>
                    </div>
                  </div>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-ink/5 rounded-xl text-ink-muted">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">Target Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setFormCategory(cat.key as TermCategory)}
                          className={cn(
                            'p-3 rounded-2xl text-xs font-bold text-left border transition-all flex items-center gap-2 cursor-pointer',
                            formCategory === cat.key
                              ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                              : 'bg-ink/[0.02] border-ink/5 hover:border-primary/20 text-ink'
                          )}
                        >
                          <cat.icon size={14} />
                          <span className="truncate">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">Policy Title (বাংলা বা ইংরেজি)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., সার্ভিস চার্জ প্রদান নীতি:"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-ink/[0.02] border border-ink/10 rounded-2xl px-4 py-3 text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">Detailed Terms & Clauses</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Enter the full policy description and conditions..."
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="w-full bg-ink/[0.02] border border-ink/10 rounded-2xl p-4 text-xs font-medium text-ink leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  {/* Order & Active */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink uppercase tracking-wider">Display Order</label>
                      <input
                        type="number"
                        min="1"
                        value={formOrder}
                        onChange={(e) => setFormOrder(Number(e.target.value))}
                        className="w-full bg-ink/[0.02] border border-ink/10 rounded-2xl px-4 py-2.5 text-xs font-bold text-ink focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink uppercase tracking-wider">Status</label>
                      <button
                        type="button"
                        onClick={() => setFormIsActive(!formIsActive)}
                        className={cn(
                          'w-full py-2.5 px-4 rounded-2xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 cursor-pointer',
                          formIsActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        )}
                      >
                        {formIsActive ? <Check size={14} /> : <X size={14} />}
                        <span>{formIsActive ? 'Active (Live)' : 'Draft (Hidden)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-ink/5">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-ink/10 text-ink-muted hover:bg-ink/5 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isCreating && <Loader2 size={14} className="animate-spin" />}
                      <span>Create Policy</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ─── EDIT MODAL ─── */}
        <AnimatePresence>
          {editingTerm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl border border-white/60 w-full max-w-lg p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-ink/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Edit3 size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-display font-black text-ink">Edit Policy Term</h3>
                      <p className="text-xs text-ink-muted">Modify existing policy content and settings</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingTerm(null)} className="p-2 hover:bg-ink/5 rounded-xl text-ink-muted">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">Target Category</label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setFormCategory(cat.key as TermCategory)}
                          className={cn(
                            'p-3 rounded-2xl text-xs font-bold text-left border transition-all flex items-center gap-2 cursor-pointer',
                            formCategory === cat.key
                              ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                              : 'bg-ink/[0.02] border-ink/5 hover:border-primary/20 text-ink'
                          )}
                        >
                          <cat.icon size={14} />
                          <span className="truncate">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">Policy Title</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-ink/[0.02] border border-ink/10 rounded-2xl px-4 py-3 text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">Detailed Content</label>
                    <textarea
                      required
                      rows={5}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="w-full bg-ink/[0.02] border border-ink/10 rounded-2xl p-4 text-xs font-medium text-ink leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  {/* Order & Active */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink uppercase tracking-wider">Order</label>
                      <input
                        type="number"
                        min="1"
                        value={formOrder}
                        onChange={(e) => setFormOrder(Number(e.target.value))}
                        className="w-full bg-ink/[0.02] border border-ink/10 rounded-2xl px-4 py-2.5 text-xs font-bold text-ink focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink uppercase tracking-wider">Status</label>
                      <button
                        type="button"
                        onClick={() => setFormIsActive(!formIsActive)}
                        className={cn(
                          'w-full py-2.5 px-4 rounded-2xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 cursor-pointer',
                          formIsActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        )}
                      >
                        {formIsActive ? <Check size={14} /> : <X size={14} />}
                        <span>{formIsActive ? 'Active (Live)' : 'Draft (Hidden)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-ink/5">
                    <button
                      type="button"
                      onClick={() => setEditingTerm(null)}
                      className="px-5 py-2.5 rounded-xl border border-ink/10 text-ink-muted hover:bg-ink/5 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isUpdating && <Loader2 size={14} className="animate-spin" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ─── DELETE CONFIRM MODAL ─── */}
        <AnimatePresence>
          {termToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl border border-white/60 w-full max-w-md p-6 space-y-5 text-center"
              >
                <div className="w-14 h-14 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-600 mx-auto">
                  <Trash2 size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-black text-ink">Delete Policy Term?</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-ink">"{termToDelete.title}"</span>? This cannot be undone.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setItemToDelete(null)}
                    className="px-5 py-2.5 rounded-xl border border-ink/10 text-ink-muted hover:bg-ink/5 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting && <Loader2 size={14} className="animate-spin" />}
                    <span>Confirm Delete</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ─── RESET CONFIRM MODAL ─── */}
        <AnimatePresence>
          {isResetConfirmOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl border border-white/60 w-full max-w-md p-6 space-y-5 text-center"
              >
                <div className="w-14 h-14 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 mx-auto">
                  <RotateCcw size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-black text-ink">Reset to Standard Policies?</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    This will replace all customized policies with the default Bangladesh Home Tutor & BTPA standard agreement policies.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsResetConfirmOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-ink/10 text-ink-muted hover:bg-ink/5 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetConfirm}
                    disabled={isResetting}
                    className="px-6 py-2.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isResetting && <Loader2 size={14} className="animate-spin" />}
                    <span>Confirm Reset</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
