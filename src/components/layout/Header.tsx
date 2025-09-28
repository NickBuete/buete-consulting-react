import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import Logo from '../ui/Logo';
import { ROUTES } from '../../router/routes';

// Navigation items configuration
const navigationItems = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Website Templates', href: ROUTES.TEMPLATES },
  { label: 'Pharmacy Tools', href: ROUTES.PHARMACY_TOOLS },
  { label: 'HMR Dashboard', href: ROUTES.HMR_DASHBOARD },
  { label: 'HMR Templates', href: ROUTES.HMR_TEMPLATES },
  { label: 'About', href: ROUTES.ABOUT },
  { label: 'Contact', href: ROUTES.CONTACT },
];

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={ROUTES.HOME} className="flex items-center">
              <Logo size="md" showText={true} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu.Root className="relative">
              <NavigationMenu.List className="flex space-x-8">
                {navigationItems.map((item) => (
                  <NavigationMenu.Item key={item.label}>
                    <NavigationMenu.Link asChild>
                      <Link
                        to={item.href}
                        className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                          location.pathname === item.href
                            ? 'text-brand-600 border-b-2 border-brand-600'
                            : 'text-gray-700 hover:text-brand-600'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </NavigationMenu.Link>
                  </NavigationMenu.Item>
                ))}
              </NavigationMenu.List>
            </NavigationMenu.Root>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:block">
            <Button variant="default" size="sm">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dialog */}
      <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl z-50 p-6">
            
            {/* Mobile menu header */}
            <div className="flex items-center justify-between mb-8">
              <Logo size="sm" showText={true} />
              <Dialog.Close asChild>
                <button className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </Dialog.Close>
            </div>

            {/* Mobile navigation items */}
            <nav className="flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`px-3 py-3 text-base font-medium border-b border-gray-100 transition-colors duration-200 ${
                    location.pathname === item.href
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile CTA */}
                          {/* Mobile CTA button */}
            <div className="pt-4 border-t border-gray-200">
              <Link
                to={ROUTES.CONTACT}
                className="w-full bg-brand-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-brand-700 transition-colors duration-200 text-center inline-block"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
            </nav>

          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
};

export default Header;
