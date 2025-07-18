import React from 'react';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <BookOpen className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-bold text-gray-900">StudyHub</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-600">
            <span>© 2024 StudyHub. All rights reserved.</span>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary-600 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary-600 transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;