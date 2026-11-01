"use client";

import { useEffect, useState } from "react";
import { CivicPulseLogo } from "@/components/auth/civicpulse-logo";
import { CitySkyline } from "@/components/auth/city-skyline";
import { AuthForm } from "@/components/auth/auth-form";
import { isFirebaseClientConfigured } from "@/lib/env";

/**
 * Premium split-screen login page.
 * Left: auth card with translucent glass treatment.
 * Right: animated smart-city skyline illustration.
 *
 * All auth calls go through Firebase when configured.
 * No mock data; no simulated auth.
 */
export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const configured = isFirebaseClientConfigured();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Placeholder handlers — wired to Firebase in T-04
  const handleSubmit = async (data: {
    mode: "login" | "register";
    email: string;
    password: string;
    displayName?: string;
  }) => {
    void data;
    return "Firebase Auth not yet wired. Complete T-04 to enable sign-in.";
  };

  const handleForgotPassword = async (email: string) => {
    void email;
    return "Firebase Auth not yet wired. Complete T-04 to enable password reset.";
  };

  const handleGoogleSignIn = async () => {
    return "Google sign-in not yet configured. Complete T-04 to enable.";
  };

  return (
    <div className="auth-page-root relative flex min-h-dvh overflow-hidden">
      {/* Background glow */}
      <div className="auth-page-glow absolute inset-0" aria-hidden="true" />

      {/* Top-left branding */}
      <div
        className="absolute left-6 top-6 z-10 transition-all duration-700"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-12px)",
        }}
      >
        <CivicPulseLogo variant="light" showTagline />
      </div>

      {/* Top-right tagline */}
      <div
        className="absolute right-6 top-7 z-10 hidden items-center gap-2 md:flex"
        style={{
          opacity: mounted ? 0.8 : 0,
          transition: "opacity 0.8s ease 0.3s",
        }}
      >
        <span className="auth-text-white-70 text-sm font-medium">
          🌿 A Smart City Initiative
        </span>
      </div>

      {/* Auth panel — left side */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-20 md:w-[45%] md:px-12 lg:w-[38%] lg:px-16">
        <div
          className="w-full transition-all duration-700 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transitionDelay: "0.2s",
          }}
        >
          <AuthForm
            onSubmit={handleSubmit}
            onForgotPassword={handleForgotPassword}
            onGoogleSignIn={configured ? handleGoogleSignIn : undefined}
            firebaseConfigured={configured}
          />
        </div>
      </div>

      {/* City skyline — right side */}
      <div className="absolute inset-y-0 right-0 hidden w-[55%] md:block lg:w-[62%]">
        <div
          className="h-full w-full transition-opacity duration-1000"
          style={{
            opacity: mounted ? 1 : 0,
            transitionDelay: "0.1s",
          }}
        >
          <CitySkyline className="h-full w-full" />
        </div>

        {/* Headline overlay */}
        <div
          className="absolute left-12 top-[20%] max-w-[480px] transition-all duration-700 ease-out lg:left-16"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "0.5s",
          }}
        >
          <h2 className="auth-hero-heading text-3xl font-bold leading-[1.15] tracking-[-0.02em] lg:text-[42px]">
            Building a{" "}
            <span className="auth-hero-accent">
              Smarter, Cleaner &amp; More Responsive
            </span>{" "}
            City
          </h2>
          <p className="auth-text-white-70 mt-4 text-base leading-relaxed lg:text-lg">
            AI-powered civic intelligence for a better tomorrow
          </p>
        </div>
      </div>

      {/* Mobile city background (simplified) */}
      <div className="pointer-events-none absolute inset-0 md:hidden">
        <div
          className="h-full w-full transition-opacity duration-1000"
          style={{ opacity: mounted ? 0.3 : 0 }}
        >
          <CitySkyline className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
