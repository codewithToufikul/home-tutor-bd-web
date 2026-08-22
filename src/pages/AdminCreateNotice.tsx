import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, Send, Trash2, PlusCircle, 
  AlertCircle, CheckCircle2, Type, 
  Users, Info, Clock, Megaphone
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { NoticeService } from '@/src/services/noticeService';
import { StorageService } from '@/src/services/storageService.ts';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { can } from '@/src/shared/authorization.ts';
import { PERMISSIONS } from '@/src/shared/constants/permissions.ts';

export default function AdminCreateNotice() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const decision = can({
      user,
      permission: PERMISSIONS.MANAGE_NOTICES,
      allowedRoles: ['admin'],
    });

    if (!decision.ok) {
      alert(decision.message);
      return;
    }

    setIsSubmitting(true);
    (async () => {
      try {
        const formData = new FormData(e.target as HTMLFormElement);
        const payload = {
          title: String(formData.get('title') || ''),
          audience: String(formData.get('audience') || ''),
          priority: String(formData.get('priority') || ''),
          category: String(formData.get('category') || ''),
          content: String(formData.get('content') || ''),
          displayUntil: String(formData.get('displayUntil') || ''),
          isRead: false,
        };

        const noticeId = await NoticeService.create(payload as any);

        if (attachmentFile && user?.uid) {
          const attachment = await StorageService.upload({
            folder: 'notice-attachments',
            uid: user.uid,
            file: attachmentFile,
          });

          await NoticeService.update(noticeId, {
            attachmentURL: attachment.downloadURL,
            attachmentPath: attachment.storagePath,
            attachmentName: attachment.fileName,
          } as any);
        }

        setIsSuccess(true);
      } catch (err) {
        console.error('Failed to create notice:', err);
      } finally {
        setIsSubmitting(false);
        setTimeout(() => setIsSuccess(false), 3000);
      }
    })();
  };

  const inputClasses = "w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl py-4 px-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm placeholder:text-ink-muted/40";
  const labelClasses = "block text-[11px] font-black text-ink-muted uppercase mb-2 ml-1 tracking-wider";

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto shadow-xl shadow-primary/5">
            <Bell size={32} />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-display font-black text-ink tracking-tight">
              Create New Notice
            </h2>
            <p className="text-sm font-medium text-ink-muted">Broadcast important updates to your tutors and guardians.</p>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white/40 shadow-2xl shadow-ink/5 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Notice Title - Full Width */}
            <div className="md:col-span-2 space-y-2">
              <label className={labelClasses}>Notice Title*</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted/50">
                  <Type size={18} />
                </div>
                <input 
                  type="text" 
                  name="title"
                  placeholder="e.g., New Payment Policy Update" 
                  required 
                  className={cn(inputClasses, "pl-14")}
                />
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className={labelClasses}>Target Audience*</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted/50">
                  <Users size={18} />
                </div>
                <select name="audience" required className={cn(inputClasses, "pl-14 appearance-none")}>
                  <option value="">Select Audience</option>
                  <option value="All">All Users</option>
                  <option value="Tutors">Tutors Only</option>
                  <option value="Guardians">Guardians Only</option>
                </select>
              </div>
            </div>

            {/* Notice Priority */}
            <div className="space-y-2">
              <label className={labelClasses}>Priority Level*</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted/50">
                  <Info size={18} />
                </div>
                <select name="priority" required className={cn(inputClasses, "pl-14 appearance-none")}>
                  <option value="">Select Priority</option>
                  <option value="Low">Low (Informational)</option>
                  <option value="Medium">Medium (Important)</option>
                  <option value="High">High (Urgent)</option>
                </select>
              </div>
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <label className={labelClasses}>Display Until (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted/50">
                  <Clock size={18} />
                </div>
                <input 
                  type="date" 
                  name="displayUntil"
                  className={cn(inputClasses, "pl-14")}
                />
              </div>
            </div>

            {/* Notice Category */}
            <div className="space-y-2">
              <label className={labelClasses}>Notice Category*</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted/50">
                  <Megaphone size={18} />
                </div>
                <select name="category" required className={cn(inputClasses, "pl-14 appearance-none")}>
                  <option value="">Select Category</option>
                  <option value="Policy">Policy Update</option>
                  <option value="Event">Event/Holiday</option>
                  <option value="System">System Maintenance</option>
                  <option value="General">General Announcement</option>
                </select>
              </div>
            </div>

            {/* Notice Content - Full Width */}
            <div className="md:col-span-2 space-y-2">
              <label className={labelClasses}>Notice Content*</label>
              <textarea 
                name="content"
                placeholder="Write your detailed notice message here..." 
                required
                className={cn(inputClasses, "min-h-[180px] py-5 resize-none")}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className={labelClasses}>Attachment (Optional)</label>
              <input
                type="file"
                accept="application/pdf,application/zip,image/*"
                onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-ink-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>

          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full max-w-xs py-5 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl",
                isSuccess 
                  ? "bg-emerald-500 text-white shadow-emerald-500/30" 
                  : "bg-primary text-white shadow-primary/30 hover:bg-primary-dark"
              )}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSuccess ? (
                <><CheckCircle2 size={20} /> Notice Published!</>
              ) : (
                <><Send size={20} /> Publish Notice</>
              )}
            </button>
            <p className="text-[10px] font-bold text-ink-muted/50 uppercase tracking-widest">
              This notice will be visible on the user dashboard immediately.
            </p>
          </div>
        </form>

        {/* Tip Section */}
        <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-8 flex items-start gap-5">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/5 shrink-0">
            <Info size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-ink uppercase tracking-wider">Pro Tip</h4>
            <p className="text-xs font-medium text-ink-muted leading-relaxed">
              Use clear and concise titles for your notices. High-priority notices will be highlighted with a red badge on the user's home screen to ensure maximum visibility.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
