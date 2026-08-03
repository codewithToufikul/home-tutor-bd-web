import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Ban, Trash2, ShieldCheck, UserCheck, Users, 
  Filter, ChevronLeft, ChevronRight, AlertCircle 
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';

const ITEMS_PER_PAGE = 5;

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [users, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const toggleBan = (userId: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, status: user.status === 'active' ? 'banned' : 'active' };
      }
      return user;
    });
    setUsers(updatedUsers);
    syncWithStorage(updatedUsers);
  };

  const approveUser = (userId: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, status: 'active' };
      }
      return user;
    });
    setUsers(updatedUsers);
    syncWithStorage(updatedUsers);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(user => user.id !== userToDelete));
      setUserToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 relative pb-20">
        {/* Sticky Topbar Section */}
        <div className="sticky top-[-24px] lg:top-[-48px] z-20 bg-[#F8FAFC]/95 backdrop-blur-md -mx-6 lg:-mx-12 px-6 lg:px-12 py-3 border-b border-ink/5 shadow-sm">
          <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            <div className="flex items-center gap-4 shrink-0">
              {/* Title */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="text-sm md:text-base font-display font-black text-ink leading-none">
                  User Information
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative w-32 md:w-48 group shrink-0">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ink-muted group-focus-within:text-primary transition-colors">
                  <Search size={14} />
                </div>
                <input 
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 pl-9 pr-3 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 shrink-0">
                <select 
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 px-3 text-[11px] font-bold text-ink-muted appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm min-w-[90px]"
                >
                  <option value="All">All Roles</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Student">Student</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Coaching">Coaching</option>
                </select>

                <select 
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 px-3 text-[11px] font-bold text-ink-muted appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm min-w-[80px]"
                >
                  <option value="All">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>

            {/* Total Users */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10 shrink-0">
              <Users size={14} className="text-primary" />
              <span className="text-[11px] font-bold text-ink-muted">Total: <span className="text-primary">{filteredUsers.length}</span></span>
            </div>
          </div>
        </div>

        {/* Users Table Section */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-2xl shadow-ink/5 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ink/5">
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Serial</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Name</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Email</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Role</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">User Id</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase text-center">Banned</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                <AnimatePresence mode="popLayout">
                  {paginatedUsers.map((user, index) => (
                    <motion.tr 
                      key={user.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group hover:bg-white/40 transition-colors"
                    >
                      <td className="px-8 py-5 text-sm font-bold text-ink-muted">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-ink">{user.name}</span>
                          <span className="text-[10px] font-bold text-ink-muted/60 uppercase tracking-tight">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-ink-muted">{user.email}</td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                          user.role === 'Tutor' ? "bg-blue-100 text-blue-600" : 
                          user.role === 'Coaching' ? "bg-cyan-100 text-cyan-600" :
                          user.role === 'Guardian' ? "bg-emerald-100 text-emerald-600" :
                          "bg-amber-100 text-amber-600"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-mono font-bold text-primary">{user.id}</td>
                      <td className="px-8 py-5 text-center">
                        {user.status === 'pending' ? (
                          <button 
                            onClick={() => approveUser(user.id)}
                            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                          >
                            <UserCheck size={14} />
                            Approve
                          </button>
                        ) : (
                          <button 
                            onClick={() => toggleBan(user.id)}
                            className={cn(
                              "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 flex items-center gap-2 mx-auto",
                              user.status === 'active' 
                                ? "bg-[#F59E0B] text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600" 
                                : "bg-[#EF4444] text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600"
                            )}
                          >
                            {user.status === 'active' ? <Ban size={14} /> : <ShieldCheck size={14} />}
                            {user.status === 'active' ? 'Ban' : 'UnBan'}
                          </button>
                        )}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button 
                          onClick={() => setUserToDelete(user.id)}
                          className="p-2.5 rounded-xl bg-[#991B1B] text-white shadow-lg shadow-rose-900/20 hover:bg-rose-900 transition-all active:scale-95 mx-auto flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          <AnimatePresence mode="popLayout">
            {paginatedUsers.map((user, index) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-lg shadow-ink/5 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase">
                      #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1} • {user.id}
                    </p>
                    <h3 className="text-lg font-black text-ink leading-tight">{user.name}</h3>
                    <p className="text-sm font-medium text-ink-muted">{user.email}</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                    user.role === 'Tutor' ? "bg-blue-100 text-blue-600" : 
                    user.role === 'Coaching' ? "bg-cyan-100 text-cyan-600" :
                    user.role === 'Guardian' ? "bg-emerald-100 text-emerald-600" :
                    "bg-amber-100 text-amber-600"
                  )}>
                    {user.role}
                  </span>
                </div>
                <div className="flex gap-3 pt-2">
                  {user.status === 'pending' ? (
                    <button 
                      onClick={() => approveUser(user.id)}
                      className="flex-grow py-3 rounded-2xl text-[10px] font-black uppercase bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <UserCheck size={14} />
                      Approve User
                    </button>
                  ) : (
                    <button 
                      onClick={() => toggleBan(user.id)}
                      className={cn(
                        "flex-grow py-3 rounded-2xl text-[10px] font-black uppercase transition-all active:scale-95 flex items-center justify-center gap-2",
                        user.status === 'active' 
                          ? "bg-[#F59E0B] text-white shadow-lg shadow-amber-500/20" 
                          : "bg-[#EF4444] text-white shadow-lg shadow-rose-500/20"
                      )}
                    >
                      {user.status === 'active' ? <Ban size={14} /> : <ShieldCheck size={14} />}
                      {user.status === 'active' ? 'Ban' : 'UnBan'}
                    </button>
                  )}
                  <button 
                    onClick={() => setUserToDelete(user.id)}
                    className="w-12 h-12 rounded-2xl bg-[#991B1B] text-white shadow-lg shadow-rose-900/20 flex items-center justify-center active:scale-95 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-8">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl shadow-sm">
              <span className="text-sm font-bold text-ink-muted">
                Page <span className="text-primary">{currentPage}</span> of {totalPages}
              </span>
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted">
              <Search size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-ink">No users found</h3>
              <p className="text-sm font-medium text-ink-muted max-w-xs">
                We couldn't find any users matching your current search or filter criteria.
              </p>
            </div>
            <button 
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('All');
                setStatusFilter('All');
              }}
              className="text-primary font-bold text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUserToDelete(null)}
              className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-white/40 p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-ink">Are you sure?</h3>
                <p className="text-sm font-medium text-ink-muted leading-relaxed">
                  This action cannot be undone. This will permanently delete the user account and remove their data from our servers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-4 rounded-2xl bg-ink/5 text-ink font-bold text-sm hover:bg-ink/10 transition-all"
                >
                  No, Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 rounded-2xl bg-[#EF4444] text-white font-bold text-sm shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}