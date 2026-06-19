"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  ClipboardList,
  History,
  FileBarChart,
  Bell,
  Heart,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/register", label: "Register Woman", icon: UserPlus },
  { href: "/symptoms", label: "Log Symptoms", icon: ClipboardList },
  { href: "/history", label: "Assessment History", icon: History },
  { href: "/report", label: "Awareness Report", icon: FileBarChart },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <head>
        <title>Saheli — Women's Health Awareness</title>
        <meta name="description" content="Women's Health Awareness Support System for ASHA Workers" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-rose-100 flex flex-col fixed h-full z-10">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-rose-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-rose-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <p className="font-bold text-stone-800 leading-tight">Saheli</p>
                  <p className="text-xs text-stone-400 leading-tight">Health Awareness</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                      active
                        ? "bg-rose-50 text-rose-700"
                        : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                    }`}
                  >
                    <Icon
                      className={`w-4.5 h-4.5 ${active ? "text-rose-600" : "text-stone-400"}`}
                      size={18}
                    />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-rose-100">
              <p className="text-xs text-stone-400 leading-relaxed">
                For ASHA & community health workers. Awareness support only — not a diagnostic tool.
              </p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 ml-64 min-h-screen">
            <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
