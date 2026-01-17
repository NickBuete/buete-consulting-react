//react app router.ts
import React from 'react'
import type { UserRole } from '../types/auth'

// Placeholder components (we'll replace these with actual page components later)
const HomePage = React.lazy(() => import('../pages/home'))
const TemplatesPage = React.lazy(() => import('../pages/templates'))
const TemplateDetailPage = React.lazy(
  () => import('../pages/templates/TemplateDetail')
)
const TemplatePreviewPage = React.lazy(
  () => import('../pages/templates/preview/TemplatePreview')
)
const PharmacyToolsPage = React.lazy(() => import('../pages/pharmacy-tools'))
const DoseCalculatorPage = React.lazy(() => import('../pages/pharmacy-tools/DoseCalculatorPage'))
const PainManagementPage = React.lazy(() => import('../pages/pharmacy-tools/PainManagementPage'))
const PediatricToolsPage = React.lazy(() => import('../pages/pharmacy-tools/PediatricToolsPage'))
const PillSwallowingPage = React.lazy(() => import('../pages/pharmacy-tools/PillSwallowingPage'))
const HMRTemplatesPage = React.lazy(() => import('../pages/hmr-templates'))
const HMRDashboardPage = React.lazy(() => import('../pages/hmr'))
const HMRReviewDetailPage = React.lazy(() => import('../pages/hmr/detail'))
const AboutPage = React.lazy(() => import('../pages/about'))
const ContactPage = React.lazy(() => import('../pages/contact'))
const LoginPage = React.lazy(() => import('../pages/auth/Login'))
const RegisterPage = React.lazy(() => import('../pages/auth/Register'))
const UnauthorizedPage = React.lazy(() => import('../pages/auth/Unauthorized'))
const BookingPage = React.lazy(() => import('../pages/booking'))
const BookingConfirmationPage = React.lazy(() => import('../pages/booking/BookingConfirmation'))
const ReschedulePage = React.lazy(() => import('../pages/booking/ReschedulePage'))
const BookingDashboardPage = React.lazy(() => import('../pages/admin/booking/BookingDashboard'))

// 1. Route path constants
export const ROUTES = {
  HOME: '/',
  TEMPLATES: '/templates',
  TEMPLATE_DETAIL: '/templates/:slug',
  TEMPLATE_PREVIEW: '/templates/preview/:slug',
  PHARMACY_TOOLS: '/pharmacy-tools',
  VARIABLE_DOSE_PLANNER: '/pharmacy-tools/variable-dose-planner',
  PAIN_MANAGEMENT: '/pharmacy-tools/pain-management',
  PEDIATRIC_TOOLS: '/pharmacy-tools/pediatric',
  PILL_SWALLOWING: '/pharmacy-tools/pill-swallowing',
  HMR_TEMPLATES: '/hmr-templates',
  HMR_DASHBOARD: '/hmr',
  HMR_REVIEW_DETAIL: '/hmr/:id',
  ABOUT: '/about',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',
  BOOKING: '/book/:bookingUrl',
  BOOKING_CONFIRMATION: '/booking/confirmation',
  RESCHEDULE: '/reschedule/:token',
  BOOKING_DASHBOARD: '/admin/booking',
} as const

//2. Route interface
export interface RouteConfig {
  path: string
  component: React.ComponentType
  title: string
  protected?: boolean // if the route requires authentication
  roles?: UserRole[]
}

// 3. Route configurations array
export const routes: RouteConfig[] = [
  {
    path: ROUTES.HOME,
    component: HomePage,
    title: 'Home - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.TEMPLATES,
    component: TemplatesPage,
    title: 'Website Templates - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.TEMPLATE_DETAIL,
    component: TemplateDetailPage,
    title: 'Template Detail - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.TEMPLATE_PREVIEW,
    component: TemplatePreviewPage,
    title: 'Template Preview - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.PHARMACY_TOOLS,
    component: PharmacyToolsPage,
    title: 'Pharmacy Tools - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.VARIABLE_DOSE_PLANNER,
    component: DoseCalculatorPage,
    title: 'Variable Dose Planner - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.PAIN_MANAGEMENT,
    component: PainManagementPage,
    title: 'Pain Management Tools - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.PEDIATRIC_TOOLS,
    component: PediatricToolsPage,
    title: 'Pediatric Tools - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.PILL_SWALLOWING,
    component: PillSwallowingPage,
    title: 'Tablet Swallowing Trainer - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.HMR_TEMPLATES,
    component: HMRTemplatesPage,
    title: 'HMR Templates - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.HMR_DASHBOARD,
    component: HMRDashboardPage,
    title: 'HMR Dashboard - Buete Consulting',
    protected: true,
    roles: ['PRO', 'ADMIN'],
  },
  {
    path: ROUTES.HMR_REVIEW_DETAIL,
    component: HMRReviewDetailPage,
    title: 'HMR Review Detail - Buete Consulting',
    protected: true,
    roles: ['PRO', 'ADMIN'],
  },
  {
    path: ROUTES.ABOUT,
    component: AboutPage,
    title: 'About Us - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.CONTACT,
    component: ContactPage,
    title: 'Contact - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.LOGIN,
    component: LoginPage,
    title: 'Login - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.REGISTER,
    component: RegisterPage,
    title: 'Register - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.UNAUTHORIZED,
    component: UnauthorizedPage,
    title: 'Access Denied - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.BOOKING,
    component: BookingPage,
    title: 'Book an Appointment - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.BOOKING_CONFIRMATION,
    component: BookingConfirmationPage,
    title: 'Booking Confirmed - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.RESCHEDULE,
    component: ReschedulePage,
    title: 'Reschedule Appointment - Buete Consulting',
    protected: false,
  },
  {
    path: ROUTES.BOOKING_DASHBOARD,
    component: BookingDashboardPage,
    title: 'Booking Management - Buete Consulting',
    protected: true,
    roles: ['PRO', 'ADMIN'],
  },
]
