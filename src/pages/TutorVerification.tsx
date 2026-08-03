import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, Camera, Check } from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { VerificationService } from '@/src/services/verificationService.ts';

export default function TutorVerification() {
  const { user } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      alert('You must be signed in as a tutor to submit a verification request.');
      return;
    }

    if (!docNumber || !files.nidFront || !files.nidBack || !files.studentId) {
      alert('Please provide all required documents and your document number.');
      return;
    }

    try {
      await VerificationService.create({
        uid: user.uid,
        name: user.name || user.displayName || 'Tutor',
        email: user.email || '',
        docType,
        docNumber,
        nidFrontName: files.nidFront.name,
        nidBackName: files.nidBack.name,
        studentIdName: files.studentId.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit verification request:', error);
      alert('Verification request could not be submitted. Please try again later.');
    }
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
