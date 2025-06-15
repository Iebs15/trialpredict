"use client"

import { Link } from "react-router-dom"
import { FlaskRoundIcon as Flask, Menu, X, Shield, Users, FileText, Phone } from "lucide-react"
import { Outlet } from "react-router-dom"
import { useState } from "react"

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 shadow-sm">
        <div className="container flex h-20 items-center px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
              <a href="/" rel="noopener noreferrer">
              <Flask className="h-7 w-7 text-white" />
              </a>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-slate-800 tracking-tight">TrialPredict</span>
              <span className="text-xs text-slate-500 font-medium">Clinical Research Platform</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="ml-auto hidden md:flex items-center gap-8">
            <Link
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-200 group"
              to="#"
            >
              <Shield className="h-4 w-4 group-hover:text-blue-600" />
              About Platform
            </Link>
            <Link
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-200 group"
              to="#"
            >
              <Users className="h-4 w-4 group-hover:text-blue-600" />
              Features
            </Link>
            <Link
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-200 group"
              to="#"
            >
              <FileText className="h-4 w-4 group-hover:text-blue-600" />
              Documentation
            </Link>
            <Link
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-200 group"
              to="https://www.insimine.com/bookings"
            >
              <Phone className="h-4 w-4 group-hover:text-blue-600" />
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="ml-auto md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-slate-600" /> : <Menu className="h-6 w-6 text-slate-600" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white shadow-lg">
            <nav className="container px-4 py-6 space-y-4">
              <Link
                className="flex items-center gap-3 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-200 py-2"
                to="#"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="h-4 w-4" />
                About Platform
              </Link>
              <Link
                className="flex items-center gap-3 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-200 py-2"
                to="#"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="h-4 w-4" />
                Features
              </Link>
              <Link
                className="flex items-center gap-3 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-200 py-2"
                to="#"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FileText className="h-4 w-4" />
                Documentation
              </Link>
              <Link
                className="flex items-center gap-3 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors duration-200 py-2"
                to="#"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone className="h-4 w-4" />
                Contact
              </Link>
              <div className="pt-4 border-t border-slate-200">
                <Link
                  to="#"
                  className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl text-center hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 bg-white">
        <Outlet />
      </main>

      <footer className="w-full border-t border-slate-200 bg-slate-50 py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg">
                  <Flask className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-slate-800">TrialPredict</span>
                  <span className="text-xs text-slate-500 font-medium">Clinical Research Platform</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                Advanced biomarker intelligence platform empowering pharmaceutical researchers and clinicians with
                data-driven insights for precision medicine and clinical trial optimization.
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield className="h-3 w-3" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Users className="h-3 w-3" />
                  <span>1000+ Researchers</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-4">Platform</h3>
              <nav className="space-y-3">
                <Link className="block text-sm text-slate-600 hover:text-blue-600 transition-colors" to="#">
                  Features
                </Link>
                <Link className="block text-sm text-slate-600 hover:text-blue-600 transition-colors" to="#">
                  Pricing
                </Link>
                <Link className="block text-sm text-slate-600 hover:text-blue-600 transition-colors" to="#">
                  API Access
                </Link>
                <Link className="block text-sm text-slate-600 hover:text-blue-600 transition-colors" to="#">
                  Integration
                </Link>
              </nav>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-4">Support</h3>
              <nav className="space-y-3">
                <Link className="block text-sm text-slate-600 hover:text-blue-600 transition-colors" to="#">
                  Documentation
                </Link>
                <Link className="block text-sm text-slate-600 hover:text-blue-600 transition-colors" to="#">
                  Help Center
                </Link>
                <Link className="block text-sm text-slate-600 hover:text-blue-600 transition-colors" to="#">
                  Contact Us
                </Link>
                <Link className="block text-sm text-slate-600 hover:text-blue-600 transition-colors" to="#">
                  Status Page
                </Link>
              </nav>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2025 TrialPredict. All rights reserved. | Advancing precision medicine through data science.
            </p>
            <nav className="flex gap-6">
              <Link className="text-sm text-slate-500 hover:text-slate-700 transition-colors" to="#">
                Terms of Service
              </Link>
              <Link className="text-sm text-slate-500 hover:text-slate-700 transition-colors" to="#">
                Privacy Policy
              </Link>
              <Link className="text-sm text-slate-500 hover:text-slate-700 transition-colors" to="#">
                Cookie Policy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
