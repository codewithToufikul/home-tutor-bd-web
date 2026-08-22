import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-16 flex items-center justify-center">
      <div className="max-w-xl w-full rounded-[32px] border border-ink/10 bg-white p-8 shadow-xl text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <ShieldAlert size={28} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-black text-[#001F3F]">Authentication Required</h1>
          <p className="text-sm text-ink-muted">
            This action needs a signed-in account. Please log in and retry the workflow.
          </p>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
        >
          <ArrowLeft size={16} />
          Go to Login
        </button>
      </div>
    </div>
  );
}
