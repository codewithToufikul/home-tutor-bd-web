import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, FileText, Camera, Check } from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';

export default function TutorVerification() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [files, setFiles] = useState({
    nidFront: null as File | null,
    nidBack: null as File | null,
    studentId: null as File | null,
  });
  const [docType, setDocType] = useState('nid');
  const [docNumber, setDocNumber] = useState('');

  const handleFileChange = (field: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage for Admin to review
    const verificationData = {
      id: `VERIFY-${Date.now()}`,
      tutorName: 'Md Shakil Hosen',
      tutorId: 'TS-150785',
      docType,
      docNumber,
      nidFront: files.nidFront ? URL.createObjectURL(files.nidFront) : '',
      nidBack: files.nidBack ? URL.createObjectURL(files.nidBack) : '',
      studentId: files.studentId ? URL.createObjectURL(files.studentId) : '',
      status: 'Pending',
      date: 'Just now'
    };

    const existing = JSON.parse(localStorage.getItem('admin_verification_requests') || '[]');
    localStorage.setItem('admin_verification_requests', JSON.stringify([verificationData, ...existing]));

    setIsSubmitted(true);
  };

  return (
    <TutorLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-black text-[#001F3F]">Profile Verification Request</h1>
          <p className="text-xs text-ink-muted">Submit your identity and academic documents to get a verified tutor badge.</p>
        </div>

        {/* Status Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900">Verification Pending</h3>
            <p className="text-xs text-amber-700/80">Upload your NID/Passport and Student ID card to get verified by admin.</p>
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-ink/10 shadow-sm space-y-6">
          <div className="space-y-4">
            {/* Document Type */}
            <div>
              <label className="block text-xs font-bold text-[#001F3F] uppercase mb-2">Select National Identity Document*</label>
              <select 
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                required 
                className="w-full bg-gray-50 border border-ink/10 rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="nid">National ID (NID)</option>
                <option value="passport">Passport</option>
                <option value="birth_certificate">Birth Certificate</option>
              </select>
            </div>

            {/* Document Number */}
            <div>
              <label className="block text-xs font-bold text-[#001F3F] uppercase mb-2">Document ID Number*</label>
              <input 
                type="text" 
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. 1998261234567" 
                required 
                className="w-full bg-gray-50 border border-ink/10 rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Upload Front & Back */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="border-2 border-dashed border-ink/10 rounded-2xl p-6 text-center hover:border-primary/45 transition-colors cursor-pointer bg-gray-50/50 block relative">
                <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange('nidFront', e)} className="hidden" required />
                {files.nidFront ? (
                  <div className="text-emerald-600 space-y-1">
                    <Check size={24} className="mx-auto mb-1" />
                    <span className="text-xs font-bold block truncate">{files.nidFront.name}</span>
                    <span className="text-[10px] text-emerald-600/80">Uploaded Successfully</span>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto text-primary mb-2" />
                    <span className="text-xs font-bold text-[#001F3F] block">NID Front Side*</span>
                    <span className="text-[10px] text-ink-muted">JPG, PNG or PDF (Max 5MB)</span>
                  </>
                )}
              </label>

              <label className="border-2 border-dashed border-ink/10 rounded-2xl p-6 text-center hover:border-primary/45 transition-colors cursor-pointer bg-gray-50/50 block relative">
                <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange('nidBack', e)} className="hidden" required />
                {files.nidBack ? (
                  <div className="text-emerald-600 space-y-1">
                    <Check size={24} className="mx-auto mb-1" />
                    <span className="text-xs font-bold block truncate">{files.nidBack.name}</span>
                    <span className="text-[10px] text-emerald-600/80">Uploaded Successfully</span>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto text-primary mb-2" />
                    <span className="text-xs font-bold text-[#001F3F] block">NID Back Side*</span>
                    <span className="text-[10px] text-ink-muted">JPG, PNG or PDF (Max 5MB)</span>
                  </>
                )}
              </label>
            </div>

            {/* Student ID Card Upload */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-[#001F3F] uppercase mb-2">Student ID / University Certificate*</label>
              <label className="border-2 border-dashed border-ink/10 rounded-2xl p-6 text-center hover:border-primary/45 transition-colors cursor-pointer bg-gray-50/50 block relative">
                <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange('studentId', e)} className="hidden" required />
                {files.studentId ? (
                  <div className="text-emerald-600 space-y-1">
                    <Check size={24} className="mx-auto mb-1" />
                    <span className="text-xs font-bold block">{files.studentId.name}</span>
                    <span className="text-[10px] text-emerald-600/80">Uploaded Successfully</span>
                  </div>
                ) : (
                  <>
                    <Camera size={24} className="mx-auto text-primary mb-2" />
                    <span className="text-xs font-bold text-[#001F3F] block">Upload Student ID Photo*</span>
                    <span className="text-[10px] text-ink-muted">Proof of university study or graduation</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 rounded-2xl bg-[#9D174D] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-900/20 hover:bg-[#831843] transition-all cursor-pointer"
          >
            {isSubmitted ? 'Submitted for Review ✓' : 'Submit Verification Request'}
          </button>
        </form>
      </div>
    </TutorLayout>
  );
}