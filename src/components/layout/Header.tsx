import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bars3Icon, XMarkIcon, ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import Logo from '../ui/Logo';
import { ROUTES } from '../../router/routes';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  label: string;
  href?: string;
  items?: { label: string; href: string; description?: string }[];
}

const navigationItems: NavItem[] = [
  { label: 'Home', href: ROUTES.HOME },
  {
    label: 'Website Templates',
    items: [
      { label: 'Browse Templates', href: ROUTES.TEMPLATES, description: 'View all available templates' },
    ],
  },
  {
    label: 'Pharmacy Tools',
    items: [
      { label: 'All Tools', href: ROUTES.PHARMACY_TOOLS, description: 'Explore pharmacy tools' },
    ],
  },
  {
    label: 'HMR',
    items: [
      { label: 'HMR Dashboard', href: ROUTES.HMR_DASHBOARD, description: 'Manage your HMR reviews' },
      { label: 'HMR Templates', href: ROUTES.HMR_TEMPLATES, description: 'Browse HMR templates' },
      { label: 'Booking Management', href: ROUTES.BOOKING_DASHBOARD, description: 'Manage appointments' },
    ],
  },
  { label: 'About', href: ROUTES.ABOUT },
  { label: 'Contact', href: ROUTES.CONTACT },
];

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  const isActiveSection = (items?: { href: string }[]) => {
    if (!items) return false;
    return items.some((item) => location.pathname === item.href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={ROUTES.HOME} className="flex items-center hover:opacity-80 transition-opacity">
              <Logo size="md" showText={true} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) =>
              item.items ? (
                <DropdownMenu.Root key={item.label}>
                  <DropdownMenu.Trigger asChild>
                    <button
                      className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActiveSection(item.items)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="min-w-[220px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 mt-1 z-50"
                      sideOffset={5}
                    >
                      {item.items.map((subItem) => (
                        <DropdownMenu.Item key={subItem.href} asChild>
                          <Link
                            to={subItem.href}
                            className={`flex flex-col px-3 py-2 rounded-md text-sm cursor-pointer outline-none transition-colors ${
                              isActiveRoute(subItem.href)
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <span className="font-medium">{subItem.label}</span>
                            {subItem.description && (
                              <span className="text-xs text-gray-500 mt-0.5">
                                {subItem.description}
                              </span>
                            )}
                          </Link>
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              ) : (
                <Link
                  key={item.label}
                  to={item.href!}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActiveRoute(item.href!)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                    <UserCircleIcon className="h-5 w-5" />
                    <span>{user.username}</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 mt-1 z-50"
                    sideOffset={5}
                    align="end"
                  >
                    <DropdownMenu.Item asChild>
                      <Link
                        to={ROUTES.HMR_DASHBOARD}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md cursor-pointer outline-none"
                      >
                        Dashboard
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link
                        to={ROUTES.BOOKING_DASHBOARD}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md cursor-pointer outline-none"
                      >
                        Booking Management
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                    <DropdownMenu.Item asChild>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer outline-none"
                      >
                        Log out
                      </button>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={ROUTES.LOGIN}>Log in</Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link to={ROUTES.REGISTER}>Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-6">
                <Logo size="sm" showText={true} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-1">
                {navigationItems.map((item) =>
                  item.items ? (
                    <div key={item.label}>
                      <button
                        onClick={() =>
                          setMobileDropdownOpen(
                            mobileDropdownOpen === item.label ? null : item.label
                          )
                        }
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                          isActiveSection(item.items)
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {item.label}
                        <ChevronDownIcon
                          className={`h-5 w-5 transition-transform ${
                            mobileDropdownOpen === item.label ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {mobileDropdownOpen === item.label && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.href}
                              to={subItem.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                isActiveRoute(subItem.href)
                                  ? 'text-blue-600 bg-blue-50 font-medium'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.href!}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                        isActiveRoute(item.href!)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </nav>

              {/* Mobile Auth Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-600">
                      Signed in as <span className="font-medium text-gray-900">{user.username}</span>
                    </div>
                    <Link
                      to={ROUTES.HMR_DASHBOARD}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to={ROUTES.BOOKING_DASHBOARD}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-center font-medium hover:bg-gray-50 transition-colors"
                    >
                      Booking Management
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full border border-red-300 text-red-600 px-4 py-2.5 rounded-lg text-center font-medium hover:bg-red-50 transition-colors"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={ROUTES.LOGIN}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-center font-medium hover:bg-gray-50 transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
