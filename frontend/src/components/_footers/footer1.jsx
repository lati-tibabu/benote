import React from "react";
import { Link } from "react-router-dom";
import { FaLinkedin, FaGithub, FaTwitter, FaEnvelope } from "react-icons/fa";

function Footer1() {
  return (
    <footer className="mt-auto bg-gradient-to-r from-gray-50 via-white to-gray-100 border-t border-gray-100 py-8 px-4 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          {/* <img src="/rect19.png" alt="Logo" width={44} className="rounded-sm" /> */}
          <img src="/rect19.png" alt="Logo" className="w-14 animate-logo-pop" />
          <span className="text-lg font-bold text-gray-700">
            Benote
          </span>
        </div>
        <nav className="flex flex-wrap gap-6 text-base font-medium text-gray-700">
          <Link
            to="/info/about"
            className="hover:text-gray-900 transition-colors"
          >
            About
          </Link>
          <Link
            to="/info/contact-us"
            className="hover:text-gray-900 transition-colors"
          >
            Contact
          </Link>
          <Link
            to="/info/privacy-policy"
            className="hover:text-gray-900 transition-colors"
          >
            Privacy Policy
          </Link>
        </nav>
        <div className="flex gap-4 text-gray-600 text-xl">
          <a
            href="mailto:info@studenthub.com"
            aria-label="Email"
            className="hover:text-gray-900 transition-colors"
          >
            <FaEnvelope />
          </a>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:text-gray-900 transition-colors"
          >
            <FaTwitter />
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-gray-900 transition-colors"
          >
            <FaGithub />
          </a>
          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-gray-900 transition-colors"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 mt-6">
        © 2025 Benote. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer1;
