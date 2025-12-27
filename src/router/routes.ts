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

// 1. Route path constants
export const ROUTES = {
  HOME: '/',
  TEMPLATES: '/templates',
  TEMPLATE_DETAIL: '/templates/:slug',
  TEMPLATE_PREVIEW: '/templates/preview/:slug',
  PHARMACY_TOOLS: '/pharmacy-tools',
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
]
