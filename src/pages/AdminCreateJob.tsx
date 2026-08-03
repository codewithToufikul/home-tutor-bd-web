import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, MapPin, BookOpen, GraduationCap, 
  Users, Clock, Phone, MessageSquare, 
  School, Globe, CheckCircle2, X
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { TuitionJob } from '@/src/types';
import { SUBJECTS, CLASSES, MEDIUMS, DISTRICTS, DISTRICT_WISE_AREAS } from '@/src/constants';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { can } from '@/src/shared/authorization.ts';
import { PERMISSIONS } from '@/src/shared/constants/permissions.ts';

export default function AdminCreateJob() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    location: '',
    area: '',
    studentClass: '',
    subjects: [] as string[],
    customSubject: '',
    medium: '',
    tuitionType: '',
    salary: '',
    genderPreference: '',
    daysPerWeek: '',
    duration: '',
    startTime: '',
    studentGender: '',
    phone: '',
    whatsapp: '',
    schoolName: '',
    district: '',
    comment: ''
  });

  const toggleSubject = (sub: string) => {
    const upperSub = sub.toUpperCase();
    if (formData.subjects.includes(upperSub)) {
      setFormData({
        ...formData,
        subjects: formData.subjects.filter(s => s !== upperSub)
      });
    } else {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, upperSub]
      });
    }
  };

  const addCustomSubject = () => {
    if (formData.customSubject.trim()) {
      const formatted = formData.customSubject.trim().toUpperCase();
      if (!formData.subjects.includes(formatted)) {
        setFormData({
          ...formData,
          subjects: [...formData.subjects, formatted],
          customSubject: ''
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const decision = can({
      user,
      permission: PERMISSIONS.MANAGE_JOBS,
      allowedRoles: ['admin'],
    });

    if (!decision.ok) {
      alert(decision.message);
      return;
    }

    setIsSubmitting(true);

    const persistJob = async () => {
      // 1. Create Tuition Job Object
      const newJob: TuitionJob = {
        id: Math.floor(10000 + Math.random() * 90000).toString(),
        parentId: 'admin_creator',
        studentClass: formData.studentClass,
        subjects: formData.subjects.length > 0 ? formData.subjects : ['GENERAL SUBJECTS'],
        location: formData.district || formData.location,
        area: formData.area || 'Main Area',
        salary: parseInt(formData.salary) || 0,
        medium: formData.medium,
        genderPreference: (formData.genderPreference || 'Any') as any,
        status: 'Open',
        createdAt: new Date().toISOString(),
        tutoringDays: formData.daysPerWeek,
        tuitionType: formData.tuitionType,
        studentGender: formData.studentGender,
        duration: formData.duration,
        startTime: formData.startTime,
        schoolName: formData.schoolName,
        description: formData.comment || 'Tutor needed urgently.',
        category: formData.medium === 'Madrasah' ? 'Madrasah Medium' : formData.medium
      };

      // 2. Add to central job store
      await TuitionService.create(newJob);

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        navigate('/jobs');
      }, 1500);
    };

    setTimeout(() => {
      persistJob();
    }, 1500);
  };

  // ডিস্ট্রিক্ট অনুযায়ী নির্দিষ্ট এরিয়া ফিল্টার করা (অন্য জেলার এরিয়া দেখাবে না)
  const currentDistrictAreas = formData.district && DISTRICT_WISE_AREAS[formData.district] 
    ? DISTRICT_WISE_AREAS[formData.district] 
    : [];

  const inputClasses = "w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm placeholder:text-ink-muted/50";
  const labelClasses = "block text-[11px] font-black text-ink-muted uppercase mb-2 ml-1";

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-display font-black text-ink tracking-tight">
            Create Tuition Job
          </h2>
          <p className="text-sm font-medium text-ink-muted">Fill in the details below to post a new tuition opportunity.</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[40px] border border-white/40 shadow-2xl shadow-ink/5 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tuition District Name */}
            <div className="space-y-1.5">
              <label className={labelClasses}>Tuition District Name*</label>
              <select 
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value, area: '' })}
                required 
                className={inputClasses}
              >
                <option value="">Please select a Tuition District Name</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Job Area / Location Details (Dependent on District) */}
            <div className="space-y-1.5">
              <label className={labelClasses}>Job Area / Location*</label>
              <select 
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required 
                disabled={!formData.district}
                className={cn(inputClasses, "disabled:opacity-50")}
              >
                <option value="">{formData.district ? 'Select Area' : 'First Select District'}</option>
                {currentDistrictAreas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* Class Name */}
            <div className="space-y-1.5">
              <label className={labelClasses}>Class Name*</label>
              <select 
                value={formData.studentClass}
                onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                required 
                className={inputClasses}
              >
                <option value="">Please select a Class Name</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Tuition Medium */}
            <div className="space-y-1.5">
              <label className={labelClasses}>Tuition Medium*</label>
              <select 
                value={formData.medium}
                onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                required 
                className={inputClasses}
              >
                <option value="">Please select a Tuition Medium</option>
                {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Multiple Subjects Selection */}
            <div className="md:col-span-2 space-y-2">
              <label className={labelClasses}>Subjects (Multiple Selection)*</label>
              
              {/* Selected Subjects Tags */}
              {formData.subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
                  {formData.subjects.map((sub) => (
                    <span key={sub} className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                      {sub}
                      <button 
                        type="button" 
                        onClick={() => toggleSubject(sub)}
                        className="hover:bg-black/20 rounded-full p-0.5 transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Custom Subject Input */}
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Type subject name and click add..."
                  value={formData.customSubject}
                  onChange={(e) => setFormData({ ...formData, customSubject: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSubject(); } }}
                  className={inputClasses}
                />
                <button 
                  type="button"
                  onClick={addCustomSubject}
                  className="bg-primary text-white px-5 py-3 rounded-xl font-bold text-xs uppercase hover:bg-primary-dark transition-all cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>

              {/* Quick Select Popular Subjects */}
              <div className="flex flex-wrap gap-1.5 pt-2 max-h-32 overflow-y-auto">
                {SUBJECTS.map((sub) => {
                  const isSelected = formData.subjects.includes(sub.toUpperCase());
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border",
                        isSelected 
                          ? "bg-primary text-white border-primary shadow-sm" 
                          : "bg-white/60 text-ink border-ink/10 hover:border-primary/40"
                      )}
                    >
                      {sub} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Job Category */}
            <div className="space-y-1.5">
              <label className={labelClasses}>Job Category*</label>
              <select 
                value={formData.tuitionType}
                onChange={(e) => setFormData({ ...formData, tuitionType: e.target.value })}
                required 
                className={inputClasses}
              >
                <option value="">Please select a Job Category</option>
                <option value="Home Tuition">Home Tuition</option>
                <option value="Online Tuition">Online Tuition</option>
                <option value="Coaching Center">Coaching Center</option>
                <option value="Group Tuition">Group Tuition</option>
              </select>
            </div>

            {/* Tuition Salary */}
            <div className="space-y-1.5">
              <label className={labelClasses}>Tuition Salary (BDT)*</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-ink-muted">
                  <TakaIcon size={16} />
                </div>
                <input 
                  type="number"
                  placeholder="e.g. 5000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  required
                  className={cn(inputClasses, "pl-12")}
                />
              </div>
            </div>

            {/* Tuition Gender Preference */}
            <div className="space-y-1.5">
              <label className={labelClasses}>Preferred Tutor Gender*</label>
              <select 
                value={formData.genderPreference}
                onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value })}
                required 
                className={inputClasses}
              >
                <option value="">Please select a Tutor Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Any">Any</option>
              </select>
            </div>

            {/* Per Week */}
            <div className="space-y-1.5">
              <label className={labelClasses}>Days Per Week*</label>
              <select 
                value={formData.daysPerWeek}
                onChange={(e) => setFormData({ ...formData, daysPerWeek: e.target.value })}
                required 
                className={inputClasses}
              >
                <option value="">Please select Days Per Week</option>
                <option value="2 Days/Week">2 Days/Week</option>
                <option value="3 Days/Week">3 Days/Week</option>
                <option value="4 Days/Week">4 Days/Week</option>
                <option value="5 Days/Week">5 Days/Week</option>
              </select>
            </div>

            {/* Class Duration */}
            <div className="space-y-1.5">
              <label className={labelClasses}>Class Duration*</label>
              <select 
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required 
                className={inputClasses}
              >
                <option value="">Please select Class Duration</option>
                <option value="1 Hour">1 Hour</option>
                <option value="1.5 Hours">1.5 Hours</option>
                <option value="2 Hours">2 Hours</option>
              </select>
            </div>

            {/* Fixed Time */}
            <div className="space-y-1.5">
              <label className={labelClasses}>Fixed Time*</label>
              <select 
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required 
                className={inputClasses}
              >
                <option value="">Please select Fixed Time</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>

            {/* Student Gender */}
            <div className="space-y-1.5">
              <label className={labelClasses}>Student Gender*</label>
              <select 
                value={formData.studentGender}
                onChange={(e) => setFormData({ ...formData, studentGender: e.target.value })}
                required 
                className={inputClasses}
              >
                <option value="">Please select Student Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Contact Number */}
            <div className="space-y-1.5">
              <label className={labelClasses}>Contact Number*</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-ink-muted">
                  <Phone size={16} />
                </div>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="8801..." 
                  required 
                  className={cn(inputClasses, "pl-12")}
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-1.5">
              <label className={labelClasses}>WhatsApp Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-ink-muted">
                  <MessageSquare size={16} />
                </div>
                <input 
                  type="text" 
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="WhatsApp Number" 
                  className={cn(inputClasses, "pl-12")}
                />
              </div>
            </div>

            {/* Student School Name */}
            <div className="md:col-span-2 space-y-1.5">
              <label className={labelClasses}>Student School Name*</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-ink-muted">
                  <School size={16} />
                </div>
                <input 
                  type="text" 
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="Enter School/College Name" 
                  required 
                  className={cn(inputClasses, "pl-12")}
                />
              </div>
            </div>

            {/* Job Comment / Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className={labelClasses}>Job Comment / Requirements</label>
              <textarea 
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Please give your job requirements..." 
                className={cn(inputClasses, "min-h-[100px] py-4 resize-none")}
              />
            </div>

          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center gap-3 cursor-pointer",
                isSuccess 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark"
              )}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSuccess ? (
                <><CheckCircle2 size={18} /> Job Created Successfully!</>
              ) : (
                <><PlusCircle size={18} /> Create Job</>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

function TakaIcon({ size = 16, className = "" }: { size?: number, className?: string }) {
  return (
    <div 
      style={{ width: size, height: size, fontSize: size * 0.9 }} 
      className={cn("flex items-center justify-center font-black leading-none", className)}
    >
      ৳
    </div>
  );
}