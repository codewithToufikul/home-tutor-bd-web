import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-16 flex items-center justify-center">
      <div className="max-w-xl w-full rounded-[32px] border border-ink/10 bg-white p-8 shadow-xl text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <Lock size={28} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-black text-[#001F3F]">Access Forbidden</h1>
          <p className="text-sm text-ink-muted">
            Your current account role does not have permission to complete this action.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    </div>
  );
}
