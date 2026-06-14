'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Linkedin, Mail, Youtube, ChevronRight } from 'lucide-react'

const links = {
  Subjects: [
    { href: '/courses?subject=mathematics', label: 'Mathematics' },
    { href: '/courses?subject=french', label: 'French' },
  ],
  Platform: [
    { href: '/courses', label: 'Course & Content' },
    { href: '/packages', label: 'Our Packages' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/team', label: 'Our Team' },
    { href: '/partners', label: 'Our Partners' },
    { href: '/contact', label: 'Career & Contact Us' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white text-slate-800 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <Link href="/" className="mb-8 block">
              <div className="relative w-[280px] h-[70px] sm:w-[380px] sm:h-[95px] mb-6 -ml-4">
                <Image
                  src="/full-logo.png"
                  alt="Beyond Classroom"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <p className="mb-8 max-w-md text-slate-600 leading-relaxed font-medium">
              Beyond Classroom is a dedicated platform for high-quality mathematics practice, created to support students from Grade 1 to Grade 8. Our focus is simple: provide structured, reliable, and flexible practice resources that make learning mathematics more effective and consistent.
            </p>
            <div className="mb-8 inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-100 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Secure payments &middot; Verified educators
            </div>
            
            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-500 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/30 hover:text-primary group" aria-label="Social">
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 lg:pl-12 pt-4">
            {Object.entries(links).map(([title, items]) => (
              <div key={title}>
                <h4 className="mb-6 font-bold text-slate-900 tracking-wide">{title}</h4>
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="group flex items-center text-slate-500 transition-all hover:text-primary font-medium">
                        <ChevronRight className="h-4 w-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                        <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-slate-200 pt-8 md:flex-row">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <Mail className="h-4 w-4 text-primary" /> 
            <a href="mailto:beyondclassroom247@gmail.com" className="hover:text-primary transition-colors">beyondclassroom247@gmail.com</a>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} Beyond Classroom. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
