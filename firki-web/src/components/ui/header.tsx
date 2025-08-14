'use client';

import { useState } from 'react';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import clsx from 'clsx';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">Firki</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
              Templates
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
              Analytics
            </a>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">3</span>
              </div>
            </button>

            {/* User Profile */}
            <HeadlessMenu as="div" className="relative">
              <HeadlessMenu.Button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-900">John Doe</span>
              </HeadlessMenu.Button>

              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={clsx(
                          active ? 'bg-gray-100' : '',
                          'flex items-center px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </a>
                    )}
                  </HeadlessMenu.Item>
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={clsx(
                          active ? 'bg-gray-100' : '',
                          'flex items-center px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign out
                      </a>
                    )}
                  </HeadlessMenu.Item>
                </HeadlessMenu.Items>
              </Transition>
            </HeadlessMenu>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dashboard
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                Templates
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                Analytics
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
