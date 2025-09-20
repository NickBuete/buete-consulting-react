//react app router.ts
import React from 'react';

// Placeholder components (we'll replace these with actual page components later)
const HomePage = React.lazy(() => import('../pages/home'));
const TemplatesPage = React.lazy(() => import('../pages/templates'));
const TemplateDetailPage = React.lazy(() => import('../pages/templates/TemplateDetail'));
const TemplatePreviewPage = React.lazy(() => import('../pages/templates/preview/TemplatePreview'));
const PharmacyToolsPage = React.lazy(() => import('../pages/pharmacy-tools'));
const HMRTemplatesPage = React.lazy(() => import('../pages/hmr-templates'));
const AboutPage = React.lazy(() => import('../pages/about'));
const ContactPage = React.lazy(() => import('../pages/contact'));

// 1. Route path constants
export const ROUTES = {
    HOME: '/',
    TEMPLATES: '/templates',
    TEMPLATE_DETAIL: '/templates/:slug',
    TEMPLATE_PREVIEW: '/templates/preview/:slug',
    PHARMACY_TOOLS: '/pharmacy-tools',
    HMR_TEMPLATES: '/hmr-templates',
    ABOUT: '/about',
    CONTACT: '/contact',
} as const

//2. Route interface
export interface RouteConfig {
    path: string;
    component: React.ComponentType;
    title: string;
    protected?: boolean; // if the route requires authentication
}

// 3. Route configurations array
export const routes: RouteConfig[] = [
    {
        path: ROUTES.HOME,
        component: HomePage,
        title: 'Home - Buete Consulting',
        protected: false
    },
    {
        path: ROUTES.TEMPLATES,
        component: TemplatesPage,
        title: 'Website Templates - Buete Consulting',
        protected: false
    },
    {
        path: ROUTES.TEMPLATE_DETAIL,
        component: TemplateDetailPage,
        title: 'Template Detail - Buete Consulting',
        protected: false
    },
    {
        path: ROUTES.TEMPLATE_PREVIEW,
        component: TemplatePreviewPage,
        title: 'Template Preview - Buete Consulting',
        protected: false
    },
    {
        path: ROUTES.PHARMACY_TOOLS,
        component: PharmacyToolsPage,
        title: 'Pharmacy Tools - Buete Consulting',
        protected: false
    },
    {
        path: ROUTES.HMR_TEMPLATES,
        component: HMRTemplatesPage,
        title: 'HMR Templates - Buete Consulting',
        protected: false
    },
    {
        path: ROUTES.ABOUT,
        component: AboutPage,
        title: 'About Us - Buete Consulting',
        protected: false
    },
    {
        path: ROUTES.CONTACT,
        component: ContactPage,
        title: 'Contact - Buete Consulting',
        protected: false
    }
];
    
