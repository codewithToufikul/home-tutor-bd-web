import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Edit3, Trash2, CheckCircle2, XCircle, 
  ExternalLink, Eye, RefreshCw, X, Code, Sparkles, 
  DollarSign, Clock, Layers, Loader2, ShieldCheck, Check
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { 
  useGetServicesQuery, 
  useCreateServiceMutation, 
  useUpdateServiceMutation, 
  useDeleteServiceMutation, 
  ITServiceItem,
  ITServiceCategory 
} from '@/src/services/itServiceApi';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';

const CATEGORY_OPTIONS: { id: ITServiceCategory; label: string }[] = [
  { id: 'web_development', label: 'Web Development' },
  { id: 'app_development', label: 'Mobile App Development' },
  { id: 'ui_ux_design', label: 'UI/UX Design' },
  { id: 'custom_software', label: 'Custom ERP & Software' },
  { id: 'digital_marketing', label: 'Digital Marketing & SEO' },
  { id: 'cloud_devops', label: 'Cloud & DevOps' },
  { id: 'ai_data_solutions', label: 'AI & Data Solutions' },
  { id: 'other', label: 'Other IT Services' },
];

export default function AdminManageServices() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ITServiceItem | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: ITServiceCategory;
    shortDescription: string;
    fullDescription: string;
    startingPrice: number;
    deliveryTime: string;
    thumbnail: string;
    featuresInput: string;
    technologiesInput: string;
    isActive: boolean;
  }>({
    title: '',
    category: 'web_development',
    shortDescription: '',
    fullDescription: '',
    startingPrice: 15000,
    deliveryTime: '5-10 Days',
    thumbnail: '',
    featuresInput: 'Responsive UI & UX\nFullstack API Integration\nSEO & Fast Performance\nAdmin Dashboard Included',
    technologiesInput: 'React, Next.js, Node.js, MongoDB, Tailwind CSS',
    isActive: true,
  });

  const { data: servicesData, isLoading, refetch } = useGetServicesQuery(undefined);
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const services = useMemo(() => servicesData?.data || [], [servicesData]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery = !q || s.title.toLowerCase().includes(q) || s.shortDescription.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [services, selectedCategory, searchQuery]);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      category: 'web_development',
      shortDescription: '',
      fullDescription: '',
      startingPrice: 15000,
      deliveryTime: '5-10 Days',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
      featuresInput: 'Responsive UI & UX\nFullstack API Integration\nSEO & Fast Performance\nAdmin Dashboard Included',
      technologiesInput: 'React, Next.js, Node.js, MongoDB, Tailwind CSS',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: ITServiceItem) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      category: service.category,
      shortDescription: service.shortDescription,
      fullDescription: service.fullDescription,
      startingPrice: service.startingPrice || 0,
      deliveryTime: service.deliveryTime || '5-10 Days',
      thumbnail: service.thumbnail || '',
      featuresInput: (service.features || []).join('\n'),
      technologiesInput: (service.technologies || []).join(', '),
      isActive: service.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const features = formData.featuresInput.split('\n').map(f => f.trim()).filter(Boolean);
    const technologies = formData.technologiesInput.split(',').map(t => t.trim()).filter(Boolean);

    const payload = {
      title: formData.title,
      category: formData.category,
      shortDescription: formData.shortDescription,
      fullDescription: formData.fullDescription,
      startingPrice: Number(formData.startingPrice),
      deliveryTime: formData.deliveryTime,
      thumbnail: formData.thumbnail,
      features,
      technologies,
      isActive: formData.isActive,
    };

    try {
      if (editingService) {
        await updateService({ id: editingService._id, data: payload }).unwrap();
      } else {
        await createService(payload).unwrap();
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to save service.');
    }
  };

  const handleToggleActive = async (service: ITServiceItem) => {
    try {
      await updateService({ id: service._id, data: { isActive: !service.isActive } }).unwrap();
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to toggle status.');
    }
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteService(serviceToDelete).unwrap();
      setServiceToDelete(null);
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to delete service.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-20 max-w-7xl mx-auto">
        
        {/* 🌟 Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-white/60 shadow-xl shadow-ink/5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider">
              <Code size={14} />
              <span>IT & Software Services</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-ink tracking-tight">
              Manage IT & Digital Services
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted font-medium">
              Create, edit, and publish IT development services for visitors and students.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="px-5 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus size={16} />
              <span>Add New IT Service</span>
            </button>
          </div>
        </div>

        {/* 🔍 Search & Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-xl p-4 rounded-[28px] border border-white/60 shadow-lg shadow-ink/5">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-ink/10 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 scrollbar-hide">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 bg-white border border-ink/10 rounded-2xl text-xs font-bold text-ink outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>

            <button
              onClick={() => refetch()}
              className="p-2.5 hover:bg-slate-100 rounded-2xl text-ink-muted cursor-pointer transition-all"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* 📋 Services Table / List */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-xl shadow-ink/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ink/5 bg-slate-50/70">
                  <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase">Service Name & Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase">Starting Price</th>
                  <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase">Delivery Time</th>
                  <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Loader2 size={24} className="animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <tr key={service._id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={service.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'}
                            alt={service.title}
                            className="w-12 h-12 rounded-2xl object-cover border border-ink/10 shrink-0"
                          />
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-black text-ink truncate max-w-xs">{service.title}</p>
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase text-slate-600">
                              {service.category.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-black text-primary">
                        {service.startingPrice ? `৳${service.startingPrice.toLocaleString()}` : 'Custom'}
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-600">
                        {service.deliveryTime || 'Flexible'}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(service)}
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                            service.isActive
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                          )}
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/services/${service.slug || service._id}`}
                            target="_blank"
                            className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-all"
                            title="Preview Public Page"
                          >
                            <Eye size={15} />
                          </Link>
                          <button
                            onClick={() => openEditModal(service)}
                            className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-all cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => setServiceToDelete(service._id)}
                            className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-all cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-xs font-bold text-ink-muted">
                      No IT services found. Click "Add New IT Service" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🚀 Create / Edit Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative bg-white rounded-[36px] shadow-2xl border border-white/40 max-w-2xl w-full p-6 sm:p-8 z-10 space-y-6 overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-ink/5 pb-4">
                  <div className="space-y-0.5">
                    <h3 className="text-xl font-display font-black text-ink">
                      {editingService ? 'Edit IT Service' : 'Create New IT Service'}
                    </h3>
                    <p className="text-xs text-ink-muted">Fill out details to publish this service on the platform.</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                  {/* Title & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-black text-ink uppercase text-[10px]">Service Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Custom Web Application Development"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-ink focus:outline-none focus:border-primary/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-black text-ink uppercase text-[10px]">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-ink focus:outline-none focus:border-primary/40"
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price, Delivery Time, Thumbnail */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-black text-ink uppercase text-[10px]">Starting Price (BDT)</label>
                      <input
                        type="number"
                        placeholder="15000"
                        value={formData.startingPrice}
                        onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-ink focus:outline-none focus:border-primary/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-black text-ink uppercase text-[10px]">Delivery Time</label>
                      <input
                        type="text"
                        placeholder="5-10 Days"
                        value={formData.deliveryTime}
                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-ink focus:outline-none focus:border-primary/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-black text-ink uppercase text-[10px]">Active Status</label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                        className={cn(
                          "w-full py-3 rounded-2xl font-black uppercase text-xs transition-all cursor-pointer",
                          formData.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        )}
                      >
                        {formData.isActive ? 'Active (Live)' : 'Draft (Inactive)'}
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail URL */}
                  <div className="space-y-1.5">
                    <label className="font-black text-ink uppercase text-[10px]">Thumbnail Image URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-ink focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1.5">
                    <label className="font-black text-ink uppercase text-[10px]">Short Description *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Brief 1-2 sentence overview for cards..."
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-ink focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  {/* Full Description */}
                  <div className="space-y-1.5">
                    <label className="font-black text-ink uppercase text-[10px]">Full Description & Specifications *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Detailed breakdown of the service, architecture, deliverables..."
                      value={formData.fullDescription}
                      onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-ink focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  {/* Features (One per line) */}
                  <div className="space-y-1.5">
                    <label className="font-black text-ink uppercase text-[10px]">Features & Deliverables (One per line)</label>
                    <textarea
                      rows={3}
                      placeholder="Responsive UI & UX&#10;Fullstack API Integration&#10;SEO Optimized"
                      value={formData.featuresInput}
                      onChange={(e) => setFormData({ ...formData, featuresInput: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-ink focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  {/* Tech Stack (Comma separated) */}
                  <div className="space-y-1.5">
                    <label className="font-black text-ink uppercase text-[10px]">Technologies (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="React, Next.js, Node.js, MongoDB, Flutter"
                      value={formData.technologiesInput}
                      onChange={(e) => setFormData({ ...formData, technologiesInput: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-ink focus:outline-none focus:border-primary/40"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-3 text-slate-500 hover:text-ink font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating || isUpdating}
                      className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer"
                    >
                      {(isCreating || isUpdating) ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      <span>{editingService ? 'Update Service' : 'Create Service'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 🗑️ Delete Confirmation Modal */}
        <AnimatePresence>
          {serviceToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setServiceToDelete(null)}
                className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-[32px] p-6 sm:p-8 max-w-sm w-full space-y-4 text-center z-10"
              >
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-lg font-black text-ink">Delete IT Service?</h3>
                <p className="text-xs text-slate-500 font-medium">Are you sure you want to permanently delete this IT service from the platform?</p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button onClick={() => setServiceToDelete(null)} className="px-4 py-2.5 text-xs font-bold text-slate-600">
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase shadow-md shadow-rose-600/20"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
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
