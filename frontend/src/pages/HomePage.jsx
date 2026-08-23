// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import LiveIncidentMap from "../components/map/LiveIncidentMap.jsx";

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-hidden bg-slate-50 font-sans text-slate-800">
      {/* =====================================================
          NAVIGATION
      ====================================================== */}
      <Navbar />

      {/* =====================================================
          HERO HEADER
      ====================================================== */}
      <section className="relative overflow-hidden bg-slate-900 px-4 pb-12 pt-8 text-white sm:px-6 sm:pb-16 sm:pt-10">
        <div className="absolute inset-0 opacity-10 [bg-size:16px_16px] bg-[radial-gradient(#00b4d8_1px,transparent_1px)]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="max-w-3xl space-y-4">
            {/* Status badge */}

            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-[10px] font-medium text-cyan-400 sm:text-xs">
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400" />

              <span className="truncate">National Disaster Response Hub</span>
            </div>

            {/* Heading */}

            <h1 className="max-w-3xl text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl sm:leading-tight">
              Real-time Emergency Response &amp; Incident Tracking
            </h1>

            {/* Description */}

            <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-lg sm:leading-relaxed">
              Connecting affected communities, emergency responders, and relief
              centers across Bangladesh with verified live field data.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="relative z-20 mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col space-y-6 overflow-visible px-3 pb-10 sm:space-y-8 sm:px-6 sm:pb-12 md:-mt-8">
        {/* ===================================================
            LIVE INCIDENT MAP CARD
        ==================================================== */}
        <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* Map Header */}

          <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Live Incident Map
                </h2>

                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 sm:text-xs">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-600" />
                  Active Monitoring
                </span>
              </div>

              <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm">
                Explore real-time verified incidents, active relief operations,
                and shelter locations
              </p>
            </div>

            {/* Shelter button */}

            <div className="w-full shrink-0 lg:w-auto">
              <Link
                to="/shelters"
                className="flex min-h-10 w-full items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-200 active:bg-slate-300 sm:min-h-0 sm:py-2 lg:w-auto"
              >
                Find Nearby Shelters
              </Link>
            </div>
          </div>

          {/* =================================================
              MAP
          ================================================== */}

          <div className="w-full min-w-0 bg-slate-100 p-2 sm:p-4">
            <div className="relative min-h-90 w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner sm:min-h-120">
              <LiveIncidentMap isCoordinator={false} />
            </div>
          </div>
        </div>

        {/* ===================================================
            FEATURE CARDS
        ==================================================== */}

        <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {/* =================================================
              CARD 1
          ================================================== */}

          <div className="group flex min-w-0 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-400 sm:p-6">
            <div className="space-y-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl font-bold text-amber-700">
                ⚠️
              </div>

              <h3 className="text-base font-bold text-slate-900 transition group-hover:text-amber-600 sm:text-lg">
                Report an Emergency
              </h3>

              <p className="text-sm leading-6 text-slate-600">
                Stranded or need urgent medical/food support? Submit a
                geo-tagged SOS alert directly to field coordination teams.
              </p>
            </div>

            <Link
              to="/report"
              className="mt-5 inline-flex min-h-10 w-fit items-center text-xs font-extrabold uppercase tracking-wider text-amber-600 transition-all hover:gap-2 sm:mt-6"
            >
              Submit Report &rarr;
            </Link>
          </div>

          {/* =================================================
              CARD 2
          ================================================== */}

          <div className="group flex min-w-0 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-400 sm:p-6">
            <div className="space-y-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-xl font-bold text-cyan-700">
                🏠
              </div>

              <h3 className="text-base font-bold text-slate-900 transition group-hover:text-cyan-600 sm:text-lg">
                Emergency Shelters
              </h3>

              <p className="text-sm leading-6 text-slate-600">
                Locate open shelters, current capacity status, available medical
                supplies, and flood safety havens in your district.
              </p>
            </div>

            <Link
              to="/shelters"
              className="mt-5 inline-flex min-h-10 w-fit items-center text-xs font-extrabold uppercase tracking-wider text-cyan-600 transition-all hover:gap-2 sm:mt-6"
            >
              Browse Shelters &rarr;
            </Link>
          </div>

          {/* =================================================
              CARD 3
          ================================================== */}

          <div className="group flex min-w-0 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-400 sm:p-6">
            <div className="space-y-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xl font-bold text-indigo-700">
                🤝
              </div>

              <h3 className="text-base font-bold text-slate-900 transition group-hover:text-indigo-600 sm:text-lg">
                Join Response Missions
              </h3>

              <p className="text-sm leading-6 text-slate-600">
                Register as a volunteer or responder to accept field
                assignments, coordinate logistics, and distribute relief goods.
              </p>
            </div>

            <Link
              to="/register"
              className="mt-5 inline-flex min-h-10 w-fit items-center text-xs font-extrabold uppercase tracking-wider text-indigo-600 transition-all hover:gap-2 sm:mt-6"
            >
              Register as Volunteer &rarr;
            </Link>
          </div>
        </div>

        {/* ===================================================
            EMERGENCY HOTLINE
        ==================================================== */}

        <div className="flex w-full min-w-0 flex-col gap-5 rounded-2xl bg-slate-900 p-5 text-white shadow-lg sm:p-6 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 sm:text-xs">
              National Helplines
            </span>

            <h4 className="mt-1 text-base font-bold text-white sm:text-lg">
              Need Direct Emergency Voice Support?
            </h4>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Reach government emergency and flood response services 24/7
            </p>
          </div>

          {/* Hotline buttons */}

          <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 md:w-auto md:flex md:flex-wrap">
            <a
              href="tel:999"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-center text-xs font-bold text-white transition hover:bg-slate-700 active:bg-slate-600 md:w-auto"
            >
              <span>📞</span>

              <span>
                National Emergency: <strong>999</strong>
              </span>
            </a>

            <a
              href="tel:1090"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-center text-xs font-bold text-white transition hover:bg-slate-700 active:bg-slate-600 md:w-auto"
            >
              <span>🌊</span>

              <span>
                Disaster Warning: <strong>1090</strong>
              </span>
            </a>
          </div>
        </div>
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="mt-auto w-full border-t border-slate-800 bg-slate-900 px-4 py-7 text-xs text-slate-400 sm:py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:gap-4 sm:text-left">
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">
              Disaster Response &amp; Relief Coordination Network
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Official emergency response situational portal for Bangladesh.
            </p>
          </div>

          <p className="shrink-0 text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DRRCS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
