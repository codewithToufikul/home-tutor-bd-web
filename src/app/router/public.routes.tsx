import type { RouteObject } from 'react-router-dom';

import AuthGuard from '@/src/components/AuthGuard.tsx';
import About from '@/src/pages/About.tsx';
import Categories from '@/src/pages/Categories.tsx';
import Contact from '@/src/pages/Contact.tsx';
import ForTutors from '@/src/pages/ForTutors.tsx';
import HelpCenter from '@/src/pages/HelpCenter.tsx';
import Home from '@/src/pages/Home.tsx';
import JobDetails from '@/src/pages/JobDetails.tsx';
import Jobs from '@/src/pages/Jobs.tsx';
import Login from '@/src/pages/Login.tsx';
import PendingApproval from '@/src/pages/PendingApproval.tsx';
import PrivacyPolicy from '@/src/pages/PrivacyPolicy.tsx';
import Register from '@/src/pages/Register.tsx';
import VerifyOTP from '@/src/pages/VerifyOTP.tsx';
import RequestTutor from '@/src/pages/RequestTutor.tsx';
import SafetyTips from '@/src/pages/SafetyTips.tsx';
import TermsOfService from '@/src/pages/TermsOfService.tsx';
import TutorProfilePage from '@/src/pages/TutorProfile.tsx';
import Tutors from '@/src/pages/Tutors.tsx';

export const publicRoutes: RouteObject[] = [
  { index: true, element: <Home /> },
  { path: 'tutors', element: <Tutors /> },
  { path: 'categories', element: <Categories /> },
  { path: 'help-center', element: <HelpCenter /> },
  { path: 'terms-of-service', element: <TermsOfService /> },
  { path: 'privacy-policy', element: <PrivacyPolicy /> },
  { path: 'contact', element: <Contact /> },
  { path: 'about', element: <About /> },
  { path: 'safety-tips', element: <SafetyTips /> },
  { path: 'tutor/:id', element: <TutorProfilePage /> },
  { path: 'jobs', element: <Jobs /> },
  { path: 'job/:id', element: <JobDetails /> },
  { path: 'request-tutor', element: <AuthGuard allowedRoles={['student', 'guardian']}><RequestTutor /></AuthGuard> },
  { path: 'for-tutors', element: <ForTutors /> },
  { path: 'login', element: <AuthGuard guestOnly><Login /></AuthGuard> },
  { path: 'register', element: <AuthGuard guestOnly><Register /></AuthGuard> },
  { path: 'verify-otp', element: <VerifyOTP /> },
  { path: 'pending-approval', element: <PendingApproval /> },
];
