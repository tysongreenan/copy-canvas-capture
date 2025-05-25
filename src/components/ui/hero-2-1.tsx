"use client";

import { useState } from "react";
import { ArrowRight, Menu, X, Dog } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
const Hero2 = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Gradient background with grain effect */}
      <div className="absolute -right-60 -top-10 flex flex-col items-end blur-xl z-0">
        <div className="h-[10rem] w-[60rem] rounded-full bg-gradient-to-b from-tan to-cream blur-[6rem] z-1"></div>
        <div className="h-[10rem] w-[90rem] rounded-full bg-gradient-to-b from-charcoal to-tan blur-[6rem] z-1"></div>
        <div className="h-[10rem] w-[60rem] rounded-full bg-gradient-to-b from-tan to-cream blur-[6rem] z-1"></div>
      </div>
      <div className="absolute inset-0 bg-noise opacity-30 z-0"></div>

      {/* Content container */}
      <div className="relative z-10 w-full">
        {/* Navigation */}
        <nav className="w-full px-4 py-4 mt-6">
          <div className="container mx-auto flex items-center justify-between max-w-7xl">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tan text-charcoal">
                <Dog className="w-5 h-5" />
              </div>
              <span className="ml-2 text-xl font-bold text-white uppercase tracking-tight">BEGGOR AI Studio</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-6">
                <NavItem label="Features" />
                <NavItem label="Pricing" />
                <NavItem label="About" />
              </div>
              <div className="flex items-center space-x-3">
                <Link to="/auth">
                  <button className="h-12 rounded-full bg-tan px-8 text-base font-medium text-charcoal hover:bg-tan/90">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Menu with animation */}
        <AnimatePresence>
          {mobileMenuOpen && <motion.div initial={{
          y: "-100%"
        }} animate={{
          y: 0
        }} exit={{
          y: "-100%"
        }} transition={{
          duration: 0.3
        }} className="fixed inset-0 z-50 flex flex-col p-4 bg-black/95 md:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tan text-charcoal">
                    <Dog className="w-5 h-5" />
                  </div>
                  <span className="ml-2 text-xl font-bold text-white uppercase tracking-tight">
                    Beggor
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="mt-8 flex flex-col space-y-6">
                <MobileNavItem label="Features" />
                <MobileNavItem label="Pricing" />
                <MobileNavItem label="About" />
                <div className="pt-4">
                  <Link to="/auth">
                    <button className="w-full h-12 rounded-full bg-tan px-8 text-base font-medium text-charcoal hover:bg-tan/90">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>}
        </AnimatePresence>

        {/* Badge */}
        <div className="w-full px-4">
          <div className="mx-auto mt-6 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-tan/20 px-4 py-2 backdrop-blur-sm">
            <span className="text-sm font-medium text-cream">
              Ask Boldly, Get Brilliant Copy
            </span>
            <ArrowRight className="h-4 w-4 text-cream" />
          </div>
        </div>

        {/* Hero section */}
        <div className="w-full px-4 mt-12">
          <div className="container mx-auto text-center max-w-7xl">
            <h1 className="mx-auto max-w-4xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-white uppercase tracking-tight">
              Extract Website Content Like a Pro
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-gray-300 px-4">
              Beggor fetches clean, formatted content from any website instantly. 
              Perfect for copywriters, marketers, and developers who need content fast.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 px-4">
              <Link to="/auth">
                <button className="w-full sm:w-auto h-12 rounded-full bg-tan px-8 text-base font-medium text-charcoal hover:bg-tan/90">
                  Start Your Free Trial
                </button>
              </Link>
              <button onClick={() => document.getElementById('try-now')?.scrollIntoView({
              behavior: 'smooth'
            })} className="w-full sm:w-auto h-12 rounded-full border border-tan px-8 text-base font-medium text-tan hover:bg-tan/10">
                Try Demo
              </button>
            </div>

            <div className="relative mx-auto my-20 w-full max-w-6xl px-4">
              <div className="absolute inset-0 rounded shadow-lg bg-tan/20 blur-[10rem] opacity-20" />

              {/* Hero Image - Using Beggor mascot */}
              <div className="relative w-full bg-cream/10 rounded-lg p-8 sm:p-12 lg:p-16 backdrop-blur-sm">
                <div className="text-center">
                  <Dog className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto text-tan animate-wag origin-bottom mb-8" />
                  <h3 className="text-xl sm:text-2xl font-bold text-cream mb-4">Meet Beggor</h3>
                  <p className="text-base sm:text-lg text-gray-300">Your faithful content-fetching companion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
function NavItem({
  label
}: {
  label: string;
}) {
  return <div className="flex items-center text-sm text-gray-300 hover:text-cream cursor-pointer">
      <span>{label}</span>
    </div>;
}
function MobileNavItem({
  label
}: {
  label: string;
}) {
  return <div className="flex items-center justify-between border-b border-gray-800 pb-2 text-lg text-white">
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-gray-400" />
    </div>;
}
export { Hero2 };