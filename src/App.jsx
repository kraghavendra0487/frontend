import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useLocation, Navigate, useParams } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import Contact from './pages/Contact';
import { Login } from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import ViewAllStudents from './pages/ViewAllStudents';
import AdminStudentDetail from './pages/AdminStudentDetail';
import StudentsLayout from './components/StudentsLayout';
import PlacementOverviewPage from './pages/students/PlacementOverviewPage';
import StudentEligibilityPage from './pages/students/StudentEligibilityPage';
import ManageAcademicPage from './pages/students/ManageAcademicPage';
import CalendarOfEvents from './pages/admin/CalendarOfEvents';
import Events from './pages/admin/Events';
import DriveRegistrations from './pages/admin/DriveRegistrations';
const DriveProcess = lazy(() =>
  import('./pages/admin/DriveProcess').then((m) => ({ default: m.default ?? m.DriveProcess }))
);
import Process from './pages/admin/Process';
import AlumniList from './pages/admin/AlumniList';
import AlumniDetails from './pages/admin/AlumniDetails';
import AlumniConnect from './pages/admin/AlumniConnect';
import AdminCompanies from './pages/admin/Companies';
import CompanyDetails from './pages/admin/CompanyDetails';
import Notifications from './pages/admin/Notifications';
import NotificationDetail from './pages/admin/NotificationDetail';
import BulkEmail from './pages/admin/BulkEmail';
import CronJobs from './pages/admin/CronJobs';
import UserLoginManagement from './pages/admin/UserLoginManagement';
import AdminProjects from './pages/admin/AdminProjects';
import AdminHrRecommendations from './pages/admin/AdminHrRecommendations';
import Violations from './pages/admin/Violations';
import JobOffers from './pages/admin/JobOffers';
import { Companies } from './pages/Companies';
import { StudentDashboard } from './pages/StudentDashboard';
import { PersonalProfile } from './pages/student/profile/PersonalProfile';
import { ContactProfile as ContactDetails } from './pages/student/profile/ContactProfile';
import { FamilyProfile as FamilyDetails } from './pages/student/profile/FamilyProfile';
import { EducationProfile as EducationDetails } from './pages/student/profile/EducationProfile';
import { AcademicsProfile as AcademicPerformance } from './pages/student/profile/AcademicsProfile';
import { ProjectsProfile as Projects } from './pages/student/profile/ProjectsProfile';
import { InternshipsProfile as Internships } from './pages/student/profile/InternshipsProfile';
import { TrainingsProfile as Trainings } from './pages/student/profile/TrainingsProfile';
import { CertificationsProfile as Certifications } from './pages/student/profile/CertificationsProfile';
import { PublicationsProfile as Publications } from './pages/student/profile/PublicationsProfile';
import { ExtraCurricularProfile as ExtraCurricular } from './pages/student/profile/ExtraCurricularProfile';
import { OtherExperiencesProfile as OtherExperiences } from './pages/student/profile/OtherExperiencesProfile';
import { CareerProfile as CareerOverview } from './pages/student/profile/CareerProfile';
import { ResumeProfile as Resume } from './pages/student/profile/ResumeProfile';
import { SummerImmersionProfile as SummerImmersion } from './pages/student/profile/SummerImmersionProfile';
import { SummerInternshipProfile as SummerInternship } from './pages/student/profile/SummerInternshipProfile';
import { StudentPlacementPolicy } from './pages/student/profile/StudentPlacementPolicy';
import { PlacementFeed } from './pages/student/profile/PlacementFeed';
import { StudentJobOffers } from './pages/student/profile/StudentJobOffers';
import StudentEvents from './pages/student/profile/StudentEvents';
import { StudentCalendarOfEvents } from './pages/student/profile/StudentCalendarOfEvents';
import { StudentDriveDetails } from './pages/student/profile/StudentDriveDetails';
import { StudentNotifications } from './pages/student/StudentNotifications';
import AlumniRegistration from './pages/AlumniRegistration';
import AlumniDashboard from './pages/alumni/AlumniDashboard';
import AlumniDirectory from './pages/alumni/AlumniDirectory';
import AlumniProfile from './pages/alumni/AlumniProfile';
import AlumniProjects from './pages/alumni/AlumniProjects';
import AlumniViewStudent from './pages/alumni/AlumniViewStudent';
import ReferralForm from './pages/alumni/ReferralForm';
// Company pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyProfile from './pages/company/CompanyProfile';
import CompanyDrives from './pages/company/CompanyDrives';
import CompanyDriveDetail from './pages/company/CompanyDriveDetail';
import CompanyStudentView from './pages/company/CompanyStudentView';
import CompanyOffers from './pages/company/CompanyOffers';
import CompanyNotifications from './pages/company/CompanyNotifications';
import CompanyEvents from './pages/company/CompanyEvents';
import { UniversalProjectShowcase } from './pages/UniversalProjectShowcase';
import ProjectsShowcase from './pages/ProjectsShowcase';
import EventsPage from './pages/EventsPage';
import './App.css';
import { Flex, Box } from '@chakra-ui/react';
import { AuthProvider } from './context/AuthContext';
import { PlacementTrackPolicyProvider } from './context/PlacementTrackPolicyProvider';
import { StudentDataCacheProvider } from './context/StudentDataCacheContext';
import PlacementProtectedRoute from './components/PlacementProtectedRoute';
import { StudentProfileLayout } from './components/student/StudentProfileLayout';

/** Redirects /placement/events/:driveId to /placement/events/:driveId/process */
const EventsDriveRedirect = () => {
  const { driveId } = useParams();
  return <Navigate to={`/placement/events/${driveId}/process`} replace />;
};

/** Student paths use StudentProfileLayout (single shared layout, no remount on nav). */
const isStudentPath = (path) =>
  path === '/student-dashboard' || path.startsWith('/student/');

const Layout = () => {
  const location = useLocation();
  const isStudentDashboard = location.pathname.startsWith('/student-dashboard');
  const isStudentProfile = location.pathname.startsWith('/student/');
  const isAlumniPage = location.pathname.startsWith('/placement/alumni-');
  const isCompanyPage = location.pathname.startsWith('/company/');
  const onStudentPath = isStudentPath(location.pathname);

  // Hide Navbar on student pages, alumni dashboard, and company pages (they have their own layouts)
  const hideNavbar = isStudentDashboard || isStudentProfile || isAlumniPage || isCompanyPage;

  // Show Footer only on dashboard pages
  const isDashboard =
    location.pathname === '/placement/dashboard' ||
    location.pathname === '/placement/alumni-dashboard' ||
    location.pathname === '/student-dashboard';
  const showFooter = isDashboard;

  return (
    <Flex direction="column" minH="100vh">
      {!hideNavbar && <Navbar />}
      <Box flex="1">
        <StudentDataCacheProvider>
          {onStudentPath ? (
            <StudentProfileLayout>
              <Outlet />
            </StudentProfileLayout>
          ) : (
            <Outlet />
          )}
        </StudentDataCacheProvider>
      </Box>
      {showFooter && <Footer />}
    </Flex>
  );
};

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/companies", element: <Companies /> },
      { path: "/contact", element: <Contact /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/alumni/register", element: <AlumniRegistration /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/showcase/:usn", element: <UniversalProjectShowcase /> },
      { path: "/projects", element: <ProjectsShowcase /> },
      { path: "/events", element: <EventsPage /> },
      { 
        path: "/placement/dashboard", 
        element: (
          <PlacementProtectedRoute requiredRole={['admin', 'vc']}>
            <AdminDashboard />
          </PlacementProtectedRoute>
        ) 
      },
      {
        path: "/placement/calendar",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <CalendarOfEvents />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/process",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <Process />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/events",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <Events />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/events/:driveId",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <EventsDriveRedirect />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/events/:driveId/process",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>Loading…</div>}>
              <DriveProcess />
            </Suspense>
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/events/:driveId/registrations",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <DriveRegistrations />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/companies",
        element: (
          <PlacementProtectedRoute requiredRole={['admin', 'vc']}>
            <AdminCompanies />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/company/:id",
        element: (
          <PlacementProtectedRoute requiredRole={['admin', 'vc']}>
            <CompanyDetails />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/user-login",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <UserLoginManagement />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/notifications",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <Notifications />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/notifications/:id",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <NotificationDetail />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/email",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <BulkEmail />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/cron-jobs",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <CronJobs />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/alumni-connect",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <AlumniConnect />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/gallery",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <AdminProjects />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/violations",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <Violations />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/job-offers",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <JobOffers />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/alumni",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <AlumniList />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/alumni/:identifier",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <AlumniDetails />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/alumni-dashboard",
        element: (
          <PlacementProtectedRoute requiredRole="alumni">
            <AlumniDashboard />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/alumni-profile",
        element: (
          <PlacementProtectedRoute requiredRole="alumni">
            <AlumniProfile />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/alumni-directory",
        element: (
          <PlacementProtectedRoute requiredRole="alumni">
            <AlumniDirectory />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/alumni-projects",
        element: (
          <PlacementProtectedRoute requiredRole="alumni">
            <AlumniProjects />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/alumni-hr-recommendations",
        element: (
          <PlacementProtectedRoute requiredRole="alumni">
            <ReferralForm />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/alumni-student/:usn",
        element: (
          <PlacementProtectedRoute requiredRole="alumni">
            <AlumniViewStudent />
          </PlacementProtectedRoute>
        )
      },
      // Company Routes
      {
        path: "/company/dashboard",
        element: (
          <PlacementProtectedRoute requiredRole="company">
            <CompanyDashboard />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/company/profile",
        element: (
          <PlacementProtectedRoute requiredRole="company">
            <CompanyProfile />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/company/drives",
        element: (
          <PlacementProtectedRoute requiredRole="company">
            <CompanyDrives />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/company/drive/:id",
        element: (
          <PlacementProtectedRoute requiredRole="company">
            <CompanyDriveDetail />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/company/student/:usn",
        element: (
          <PlacementProtectedRoute requiredRole="company">
            <CompanyStudentView />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/company/offers",
        element: (
          <PlacementProtectedRoute requiredRole="company">
            <CompanyOffers />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/company/notifications",
        element: (
          <PlacementProtectedRoute requiredRole="company">
            <CompanyNotifications />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/company/events",
        element: (
          <PlacementProtectedRoute requiredRole="company">
            <CompanyEvents />
          </PlacementProtectedRoute>
        )
      },
      {
        path: "/placement/overview",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <PlacementOverviewPage />
          </PlacementProtectedRoute>
        ),
      },
      {
        path: "/placement/students",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <StudentsLayout />
          </PlacementProtectedRoute>
        ),
        children: [
          { index: true, element: <ViewAllStudents /> },
          { path: "eligibility", element: <StudentEligibilityPage /> },
          { path: "academic", element: <ManageAcademicPage /> },
          { path: ":usn", element: <AdminStudentDetail /> },
        ],
      },
      {
        path: "/placement/hr-recommendations",
        element: (
          <PlacementProtectedRoute requiredRole="admin">
            <AdminHrRecommendations />
          </PlacementProtectedRoute>
        )
      },
      { 
        path: "/student-dashboard", 
        element: (
          <PlacementProtectedRoute>
            <StudentDashboard />
          </PlacementProtectedRoute>
        ) 
      },
      {
        path: "/student/notifications",
        element: (
          <PlacementProtectedRoute>
            <StudentNotifications />
          </PlacementProtectedRoute>
        )
      },
      // Student Profile Routes
      { path: "/student/profile", element: <PlacementProtectedRoute><PersonalProfile /></PlacementProtectedRoute> },
      { path: "/student/profile/personal", element: <PlacementProtectedRoute><PersonalProfile /></PlacementProtectedRoute> },
      { path: "/student/profile/contact", element: <PlacementProtectedRoute><ContactDetails /></PlacementProtectedRoute> },
      { path: "/student/profile/family", element: <PlacementProtectedRoute><FamilyDetails /></PlacementProtectedRoute> },
      { path: "/student/profile/education", element: <PlacementProtectedRoute><EducationDetails /></PlacementProtectedRoute> },
      { path: "/student/profile/academics", element: <PlacementProtectedRoute><AcademicPerformance /></PlacementProtectedRoute> },
      { path: "/student/profile/projects", element: <PlacementProtectedRoute><Projects /></PlacementProtectedRoute> },
      { path: "/student/profile/internships", element: <PlacementProtectedRoute><Internships /></PlacementProtectedRoute> },
      { path: "/student/profile/trainings", element: <PlacementProtectedRoute><Trainings /></PlacementProtectedRoute> },
      { path: "/student/profile/certifications", element: <PlacementProtectedRoute><Certifications /></PlacementProtectedRoute> },
      { path: "/student/profile/publications", element: <PlacementProtectedRoute><Publications /></PlacementProtectedRoute> },
      { path: "/student/profile/extra-curricular", element: <PlacementProtectedRoute><ExtraCurricular /></PlacementProtectedRoute> },
      { path: "/student/profile/other", element: <PlacementProtectedRoute><OtherExperiences /></PlacementProtectedRoute> },
      { path: "/student/profile/career", element: <PlacementProtectedRoute><CareerOverview /></PlacementProtectedRoute> },
      { path: "/student/profile/resume", element: <PlacementProtectedRoute><Resume /></PlacementProtectedRoute> },
      { path: "/student/profile/summer-immersion", element: <PlacementProtectedRoute><SummerImmersion /></PlacementProtectedRoute> },
      { path: "/student/profile/summer-internship", element: <PlacementProtectedRoute><SummerInternship /></PlacementProtectedRoute> },
      { path: "/student/placements/policy", element: <PlacementProtectedRoute><StudentPlacementPolicy /></PlacementProtectedRoute> },
      { path: "/student/placements/feed", element: <PlacementProtectedRoute><PlacementFeed /></PlacementProtectedRoute> },
      { path: "/student/placements/offers", element: <PlacementProtectedRoute><StudentJobOffers /></PlacementProtectedRoute> },
      { path: "/student/placements/events", element: <PlacementProtectedRoute><StudentEvents /></PlacementProtectedRoute> },
      { path: "/student/calendar", element: <PlacementProtectedRoute><StudentCalendarOfEvents /></PlacementProtectedRoute> },
      { path: "/student/placements/drive/:id", element: <PlacementProtectedRoute><StudentDriveDetails /></PlacementProtectedRoute> },
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <PlacementTrackPolicyProvider>
        <RouterProvider router={router} />
      </PlacementTrackPolicyProvider>
    </AuthProvider>
  );
}

export default App;
