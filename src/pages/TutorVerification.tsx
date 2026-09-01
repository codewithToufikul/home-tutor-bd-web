import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Check, 
  Clock, 
  XCircle, 
  FileText, 
  Eye, 
  ExternalLink,
  Loader2,
  Info,
  ChevronRight
} from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { useGetMyTutorProfileQuery, useSubmitTutorVerificationMutation } from '@/src/services/tutorApi.ts';
import { uploadFile } from '@/src/repositories/storageRepository.ts';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';

export default function TutorVerification() {
  const { user } = useAuth();
  const { data: profileResponse, isLoading: isFetchingProfile, refetch } = useGetMyTutorProfileQuery(undefined);
  const [submitVerification, { isLoading: isSubmitting }] = useSubmitTutorVerificationMutation();

  const tutorProfile = (profileResponse as any)?.data || profileResponse;

  const [nidNumber, setNidNumber] = useState('');
  const [nidCardUrl, setNidCardUrl] = useState('');
  const [studentIdCardUrl, setStudentIdCardUrl] = useState('');

  const [uploadingNid, setUploadingNid] = useState(false);
  const [uploadingStudentId, setUploadingStudentId] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (tutorProfile) {
      if (tutorProfile.nid) setNidNumber(tutorProfile.nid);
      if (tutorProfile.nidCard) setNidCardUrl(tutorProfile.nidCard);
      if (tutorProfile.studentIdCard) setStudentIdCardUrl(tutorProfile.studentIdCard);
    }
  }, [tutorProfile]);

  const handleFileUpload = async (type: 'nid' | 'studentId', file: File) => {
    setErrorMessage(null);
    try {
      if (type === 'nid') setUploadingNid(true);
      if (type === 'studentId') setUploadingStudentId(true);

      const url = await uploadFile(file, 'home-tutor-bd/documents');
      if (type === 'nid') {
        setNidCardUrl(url);
      } else {
        setStudentIdCardUrl(url);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'ডকুমেন্ট আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      if (type === 'nid') setUploadingNid(false);
      if (type === 'studentId') setUploadingStudentId(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!nidCardUrl || !studentIdCardUrl) {
      setErrorMessage('অনুগ্রহ করে NID কার্ড এবং স্টুডেন্ট/টিউটর আইডি কার্ড উভয় ডকুমেন্ট আপলোড করুন।');
      return;
    }

    try {
      await submitVerification({
        nidCard: nidCardUrl,
        studentIdCard: studentIdCardUrl,
        nid: nidNumber.trim(),
      }).unwrap();

      setSuccessMessage('আপনার ভেরিফিকেশন আবেদনটি সফলভাবে জমা হয়েছে! অ্যাডমিন পর্যালোচনার পর প্রোফাইল ভেরিফাই করা হবে।');
      refetch();
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err.message || 'ভেরিফিকেশন সাবমিট করতে সমস্যা হয়েছে।');
    }
  };

  const isVerified = tutorProfile?.isVerified;
  const verificationStatus = tutorProfile?.verificationStatus || (isVerified ? 'Approved' : (tutorProfile?.nidCard && tutorProfile?.studentIdCard ? 'Pending' : 'Unsubmitted'));
  const rejectionReason = tutorProfile?.rejectionReason;

  return (
    <TutorLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-black text-ink">Tutor Identity Verification</h1>
            <p className="text-sm font-medium text-ink-muted mt-1">
              Upload your National ID (NID) and Student / Tutor ID card to get verified and unlock tuition job applications.
            </p>
          </div>

          {/* Current Verification Status Badge */}
          <div>
            {isVerified || verificationStatus === 'Approved' ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 shadow-sm">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Verified Tutor Profile</span>
              </span>
            ) : verificationStatus === 'Pending' ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100 text-amber-900 text-xs font-black border border-amber-300 shadow-sm animate-pulse">
                <Clock size={16} className="text-amber-600" />
                <span>Under Review (Pending Approval)</span>
              </span>
            ) : verificationStatus === 'Rejected' ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-100 text-rose-900 text-xs font-black border border-rose-300 shadow-sm">
                <XCircle size={16} className="text-rose-600" />
                <span>Verification Rejected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300">
                <AlertCircle size={16} className="text-slate-500" />
                <span>Verification Required</span>
              </span>
            )}
          </div>
        </div>

        {/* Status Callout Box */}
        {isVerified || verificationStatus === 'Approved' ? (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
              <ShieldCheck size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-emerald-950">আপনার প্রোফাইল শতভাগ ভেরিফাইড! 🎉</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                আপনার NID ও স্টুডেন্ট আইডি কার্ড অ্যাডমিন কর্তৃক সফলভাবে অনুমোদিত হয়েছে। আপনি এখন সরাসরি সকল টিউশন জবে আবেদন করতে পারবেন এবং আপনার প্রোফাইল পাবলিক টিউটর তালিকায় দৃশ্যমান।
              </p>
              <div className="pt-2">
                <Link to="/tutor/jobs" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline">
                  <span>Browse Tuition Jobs</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        ) : verificationStatus === 'Pending' ? (
          <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <Clock size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-amber-950">ডকুমেন্ট অ্যাডমিন পর্যালোচনায় রয়েছে ⏳</h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                আপনার আপলোডকৃত NID এবং স্টুডেন্ট আইডি কার্ড অ্যাডমিন ও মডারেটর টিম পর্যালোচনা করছেন। সাধারণত কয়েক ঘণ্টার মধ্যে ভেরিফিকেশন সম্পন্ন হয়। ভেরিফিকেশন সম্পূর্ণ হলে আপনি নোটিফিকেশন পাবেন।
              </p>
            </div>
          </div>
        ) : verificationStatus === 'Rejected' ? (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
              <XCircle size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-rose-950">ভেরিফিকেশন আবেদন প্রত্যাখ্যাত হয়েছে</h3>
              <p className="text-xs text-rose-800 leading-relaxed">
                {rejectionReason ? (
                  <><strong>অ্যাডমিন মন্তব্য:</strong> {rejectionReason}</>
                ) : (
                  'আপনার আপলোডকৃত ডকুমেন্ট অস্পষ্ট বা অসম্পূর্ণ হওয়ায় তা প্রত্যাখ্যাত হয়েছে। অনুগ্রহ করে পরিষ্কার ও সঠিক ডকুমেন্ট পুনরায় আপলোড করুন।'
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50/80 border border-blue-200 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
              <Info size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">টিউশন জবে আবেদন করতে ভেরিফিকেশন বাধ্যতামূলক</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                অভিভাবক ও শিক্ষার্থীদের নিরাপত্তা নিশ্চিত করতে প্ল্যাটফর্মের সকল টিউটরকে NID এবং বিশ্ববিদ্যালয় স্টুডেন্ট আইডি কার্ড আপলোড করে ভেরিফাই হতে হয়। ডকুমেন্ট যাচাইয়ের পর আপনার প্রোফাইল অ্যাক্টিভ হবে।
              </p>
            </div>
          </div>
        )}

        {/* Error / Success Messages */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}

        {/* Document Upload Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-ink/10 shadow-sm space-y-8">
          
          {/* NID Number Field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-ink uppercase tracking-wider">
              National ID (NID) Number / Smart Card No
            </label>
            <input
              type="text"
              value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value)}
              placeholder="e.g. 1998261234567890"
              className="w-full bg-slate-50 border border-ink/10 rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
            />
          </div>

          {/* 2-Column Document Upload Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. NID Card Upload Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                1. National ID (NID) Card Photo <span className="text-rose-500">*</span>
              </label>
              
              <div className="border-2 border-dashed border-ink/15 rounded-3xl p-6 text-center hover:border-primary/40 transition-all bg-slate-50/60 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
                {uploadingNid ? (
                  <div className="space-y-3 py-6 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="text-xs font-bold text-primary">Uploading to Cloudinary...</p>
                  </div>
                ) : nidCardUrl ? (
                  <div className="space-y-3 w-full flex flex-col items-center">
                    <div className="relative w-full max-w-[240px] h-32 rounded-2xl overflow-hidden border border-ink/10 shadow-sm group">
                      <img
                        src={nidCardUrl}
                        alt="NID Card Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewImage(nidCardUrl)}
                        className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                      >
                        <Eye size={16} /> View Full
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        <Check size={12} /> NID Uploaded
                      </span>
                      <label className="text-[11px] font-bold text-primary hover:underline cursor-pointer">
                        <span>Change</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('nid', e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-3 py-4 w-full flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                      <Upload size={22} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-ink block">Upload NID Card</span>
                      <span className="text-[10px] text-ink-muted mt-0.5 block">JPG, PNG, WebP or PDF (Max 5MB)</span>
                    </div>
                    <span className="inline-block text-xs font-bold text-primary bg-white border border-primary/20 px-3.5 py-1.5 rounded-xl shadow-xs">
                      Choose File
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('nid', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* 2. Student ID Card Upload Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                2. Student ID / Tutor ID Card <span className="text-rose-500">*</span>
              </label>

              <div className="border-2 border-dashed border-ink/15 rounded-3xl p-6 text-center hover:border-primary/40 transition-all bg-slate-50/60 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
                {uploadingStudentId ? (
                  <div className="space-y-3 py-6 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="text-xs font-bold text-primary">Uploading to Cloudinary...</p>
                  </div>
                ) : studentIdCardUrl ? (
                  <div className="space-y-3 w-full flex flex-col items-center">
                    <div className="relative w-full max-w-[240px] h-32 rounded-2xl overflow-hidden border border-ink/10 shadow-sm group">
                      <img
                        src={studentIdCardUrl}
                        alt="Student ID Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewImage(studentIdCardUrl)}
                        className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                      >
                        <Eye size={16} /> View Full
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        <Check size={12} /> ID Card Uploaded
                      </span>
                      <label className="text-[11px] font-bold text-primary hover:underline cursor-pointer">
                        <span>Change</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('studentId', e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-3 py-4 w-full flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center shadow-sm">
                      <Camera size={22} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-ink block">Upload Student / University ID</span>
                      <span className="text-[10px] text-ink-muted mt-0.5 block">Student ID Card, Admit Card or Certificate</span>
                    </div>
                    <span className="inline-block text-xs font-bold text-primary bg-white border border-primary/20 px-3.5 py-1.5 rounded-xl shadow-xs">
                      Choose File
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('studentId', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

          </div>

          {/* Submit Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || uploadingNid || uploadingStudentId || !nidCardUrl || !studentIdCardUrl}
              className="w-full py-4 px-6 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Submitting Verification Request...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>{verificationStatus === 'Approved' ? 'Update & Re-Submit Documents' : 'Submit for Admin Verification'}</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              🔒 Your documents are encrypted and securely stored. Only authorized admin staff can view verification documents.
            </p>
          </div>

        </form>

      </div>

      {/* Full-Screen Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-3xl max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Document Preview"
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              />
              <div className="p-3 flex items-center justify-between">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={14} /> Open in New Tab
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </TutorLayout>
  );
}
