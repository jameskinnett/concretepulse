import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, Truck, Users, Building2, MapPin,
  BarChart2, TrendingUp, CheckCircle2, Zap, Shield, Bell,
  MessageCircle, Clock, ArrowRight, ChevronDown, Globe2,
  FileDown, Radio, Star, Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Active Orders Tracked', value: '10,000+' },
  { label: 'Avg. Dispatch Time', value: '< 90 sec' },
  { label: 'Driver Utilization Gain', value: '+34%' },
  { label: 'Delivery Accuracy', value: '98.7%' },
];

const MODULES = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    color: 'bg-orange-500',
    title: 'Dispatch Dashboard',
    tagline: 'Command Center for Real-Time Operations',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
    description:
      'The nerve center of ConcretePulse. Dispatchers see every active order on a live Kanban board — from freshly received requests to trucks en route and completed pours. Built for speed: assign trucks, trigger WhatsApp broadcasts, and mark orders delivered in seconds.',
    features: [
      { title: 'Live Kanban Board', desc: 'Four-column workflow (New → Assigned → In Progress → Delivered) with drag-and-drop ready cards showing ETA, mix type, and client info.' },
      { title: 'Demo Mode', desc: 'Auto-progresses orders every 6 seconds to simulate real dispatch activity — perfect for presentations and team training.' },
      { title: 'WhatsApp Broadcast', desc: 'One-click blast to the driver WhatsApp group. First driver to reply YES is automatically locked in — no back-and-forth.' },
      { title: 'Batch Delivery Confirmation', desc: 'Select multiple in-progress orders and mark them all delivered in one action with a single button.' },
      { title: 'Smart Filters', desc: 'Filter the board by status, truck, or client company instantly — zero page reload.' },
      { title: 'Real-Time Notifications', desc: 'Every status change triggers an in-app alert visible to dispatchers and admins simultaneously.' },
    ],
  },
  {
    id: 'orders',
    icon: Package,
    color: 'bg-blue-500',
    title: 'Order Management',
    tagline: 'Full Lifecycle Tracking from Pour to Proof',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=80',
    description:
      'Every delivery order lives here — searchable, filterable, and actionable. Create new orders with concrete mix specs, assign resources, and track from scheduling through final delivery with timestamped milestones.',
    features: [
      { title: 'Structured Order Creation', desc: 'Guided form captures company, delivery location, mix strength (210–420 kg/cm²), volume (m³), priority, and scheduled time.' },
      { title: 'Status History', desc: 'Full timestamp trail: creation, assignment, departure, arrival, and completion times all recorded automatically.' },
      { title: 'Priority Flagging', desc: 'Mark orders as Normal or Urgent — urgent orders surface at the top of the Kanban with visual badges.' },
      { title: 'Compensation Auto-Link', desc: 'When an order is delivered, the compensation calculator automatically pre-fills driver, truck, and order data.' },
      { title: 'Advanced Search & Filter', desc: 'Full-text search by order number or client, combined with status and date filters.' },
    ],
  },
  {
    id: 'trucks',
    icon: Truck,
    color: 'bg-yellow-500',
    title: 'Fleet Management',
    tagline: 'Know Where Every Mixer Is, Right Now',
    image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=1200&q=80',
    description:
      'Manage your entire concrete mixer fleet from a single screen. Real-time status tracking, capacity management, and driver assignment ensure no truck sits idle and no schedule conflict goes unnoticed.',
    features: [
      { title: 'Real-Time Status Board', desc: 'Every truck shows its current state: Available, Loading, In Transit, Maintenance, or Off Duty — updated the moment an order is assigned or completed.' },
      { title: 'Capacity Tracking', desc: 'Capacity (m³) is shown on every truck card — dispatchers match truck capacity to order volume automatically.' },
      { title: 'Driver Assignment', desc: 'See which driver is currently operating each truck. Driver availability updates in sync.' },
      { title: 'Map Overlay', desc: 'Visual minimap shows active trucks in the service region with live status icons.' },
      { title: 'Fleet Sidebar', desc: 'At-a-glance count of trucks in each status category, always visible on the dispatch dashboard.' },
    ],
  },
  {
    id: 'drivers',
    icon: Users,
    color: 'bg-green-500',
    title: 'Driver Management',
    tagline: 'Workforce Visibility and Compensation in One Place',
    image: 'https://images.unsplash.com/photo-1537726235470-8504e3beef77?w=1200&q=80',
    description:
      'Track every driver — employees and contractors — with real-time availability, licensing status, and compensation rates. Paired with the performance analytics module, this becomes your complete workforce intelligence layer.',
    features: [
      { title: 'Employee & Contractor Profiles', desc: 'Differentiate between salaried employees and independent contractors with separate compensation models.' },
      { title: 'Availability Tracking', desc: 'Four states: Available, On Route, Off Duty, and Vacation — updated automatically as orders progress.' },
      { title: 'Multi-Rate Compensation', desc: 'Configure Rate/Hour, Rate/Order, and Rate/Km independently per driver. Set overtime multipliers for secondary rate scenarios.' },
      { title: 'License Expiry Alerts', desc: 'Store license expiry dates and surface upcoming renewals — avoid compliance risk.' },
      { title: 'Performance Link', desc: 'Every driver links to the Driver Performance module for monthly delivery counts, on-time rates, and revenue generated.' },
    ],
  },
  {
    id: 'companies',
    icon: Building2,
    color: 'bg-purple-500',
    title: 'Client & Company Management',
    tagline: 'Your Full Client Roster with Credit Intelligence',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    description:
      'Manage every construction company you serve. Track contacts, credit status, and credit limits. Know at a glance which clients are approved for credit, which are cash-only, and which are suspended.',
    features: [
      { title: 'Company Profiles', desc: 'Contact name, phone, and email stored per company with notes for account managers.' },
      { title: 'Credit Status Management', desc: 'Four states: Approved, Pending, Suspended, and C.O.D. — visible at order creation to prevent unapproved deliveries.' },
      { title: 'Credit Limit Tracking', desc: 'Set USD credit limits per company to enforce accounts-receivable policy.' },
      { title: 'Linked Locations', desc: 'Each company links to its registered delivery sites — dispatchers see only valid drop-off points when creating orders.' },
    ],
  },
  {
    id: 'locations',
    icon: MapPin,
    color: 'bg-red-500',
    title: 'Delivery Locations',
    tagline: 'Smart Job Sites with Mix Restrictions & ETA Intelligence',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
    description:
      'Each delivery location is more than an address. Restrict allowed concrete mixes per site, store special on-site instructions, and benefit from auto-computed average delivery time estimates based on historical orders.',
    features: [
      { title: 'Mix Allowlist', desc: 'Define which concrete strengths (kg/cm²) are permitted at each site — enforced at order creation to eliminate spec errors.' },
      { title: 'Historical ETA Engine', desc: 'Automatically calculates average delivery time from past orders to the same location, shown to dispatchers when scheduling new pours.' },
      { title: 'GPS Coordinates', desc: 'Store lat/lng per location for future map integration and route optimization.' },
      { title: 'Special Instructions', desc: 'Site-specific notes — access codes, unloading procedures, contact on-site — travel with every order created for that location.' },
    ],
  },
  {
    id: 'reports',
    icon: BarChart2,
    color: 'bg-teal-500',
    title: 'Analytics & Reports',
    tagline: 'Delivery Intelligence That Drives Better Decisions',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    description:
      'Visual delivery analytics with bar charts, performance tables, and sortable breakdowns by location. Admin users can export PDF reports for operations review, billing reconciliation, and executive dashboards.',
    features: [
      { title: 'Location Performance Chart', desc: 'Bar chart of average delivery completion time per location — instantly spot slow routes and top performers.' },
      { title: 'Delivery Volume Metrics', desc: 'Total orders, volume (m³), and completion rate at a glance from summary cards.' },
      { title: 'Sortable Breakdown Table', desc: 'Sort locations by average time, order count, or total volume — ascending or descending.' },
      { title: 'Today\'s Dispatch Export', desc: 'One-click PDF of all orders dispatched today — shareable with operations managers.' },
      { title: 'Delivery History Export', desc: 'Full history PDF including company, location, mix, volume, and completion times.' },
      { title: 'Role-Gated Access', desc: 'PDF exports are restricted to Admin and Dispatcher roles — Viewers see charts but cannot export.' },
    ],
  },
  {
    id: 'driver-performance',
    icon: TrendingUp,
    color: 'bg-indigo-500',
    title: 'Driver Performance',
    tagline: 'Monthly KPIs for Every Driver on Your Payroll',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    description:
      'Month-by-month breakdown of every driver\'s contribution: orders completed, total distance, on-time delivery rate, and revenue attributed. Managers can export a PDF report for payroll review or driver performance conversations.',
    features: [
      { title: 'Monthly Filter', desc: 'Select any historical month to view a snapshot of driver activity during that period.' },
      { title: 'KPI Cards per Driver', desc: 'Orders completed, distance covered (km), on-time percentage, and compensation earned — all in one driver card.' },
      { title: 'League Table Ranking', desc: 'Drivers ranked by deliveries completed, making top performers immediately visible.' },
      { title: 'Employee vs. Contractor Split', desc: 'Visual distinction between payroll employees and independent contractors.' },
      { title: 'PDF Export', desc: 'Export the full driver performance table for the selected month for payroll and HR review.' },
    ],
  },
];

const ROLES = [
  { role: 'Admin', color: 'bg-orange-100 text-orange-700 border-orange-200', capabilities: ['Full read/write access to all modules', 'Export PDF reports', 'Manage users and roles', 'Override driver compensation', 'View financial data'] },
  { role: 'Dispatcher', color: 'bg-blue-100 text-blue-700 border-blue-200', capabilities: ['Create and assign orders', 'Broadcast to driver WhatsApp', 'Mark orders delivered', 'View fleet and driver status', 'Export PDF reports'] },
  { role: 'Viewer', color: 'bg-gray-100 text-gray-600 border-gray-200', capabilities: ['Read-only access to all modules', 'View Kanban board and charts', 'Monitor fleet and driver availability', 'No create, edit, or export actions'] },
];

const INTEGRATIONS = [
  { icon: MessageCircle, label: 'WhatsApp', desc: 'Driver broadcast and first-reply auto-assignment via WhatsApp group' },
  { icon: Globe2, label: 'Bilingual', desc: 'Full English / Spanish interface — toggle per-user in the header' },
  { icon: FileDown, label: 'PDF Reports', desc: 'jsPDF-powered exports for dispatch, history, and driver performance' },
  { icon: Bell, label: 'In-App Notifications', desc: 'Real-time bell alerts for order events, gated by role' },
  { icon: Radio, label: 'Demo Simulation', desc: 'Auto-progression engine for demos and training sessions' },
  { icon: Shield, label: 'RBAC', desc: 'Role-based access control: Admin, Dispatcher, Viewer' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeaturePill({ title, desc }) {
  return (
    <div className="flex gap-3 items-start">
      <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
      <div>
        <span className="font-semibold text-sm text-gray-900">{title} — </span>
        <span className="text-sm text-gray-600">{desc}</span>
      </div>
    </div>
  );
}

function ModuleSection({ module, reverse }) {
  const Icon = module.icon;
  return (
    <div id={module.id} className="py-20 border-b border-gray-100">
      <div className={cn('max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-12 items-center', reverse && 'lg:flex-row-reverse')}>
        {/* Image */}
        <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-xl shrink-0">
          <img src={module.image} alt={module.title} className="w-full h-72 object-cover" />
        </div>

        {/* Text */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white', module.color)}>
              <Icon className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wide">{module.tagline}</Badge>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">{module.title}</h2>
          <p className="text-gray-600 leading-relaxed">{module.description}</p>
          <div className="space-y-3 pt-2">
            {module.features.map(f => <FeaturePill key={f.title} {...f} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductDoc() {
  const [activeNav, setActiveNav] = useState(null);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-body">

      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 mr-4">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">ConcretePulse</span>
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] font-bold ml-1">PRODUCT BRIEF</Badge>
          </div>
          <div className="hidden md:flex items-center gap-1 flex-1 flex-wrap">
            {MODULES.map(m => (
              <a key={m.id} href={`#${m.id}`} className="text-xs text-gray-500 hover:text-orange-600 px-2 py-1 rounded-md hover:bg-orange-50 transition-colors font-medium">
                {m.title}
              </a>
            ))}
          </div>
          <Link to="/">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5 text-xs h-8">
              <ArrowRight className="w-3.5 h-3.5" /> Open App
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative bg-gray-950 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1565710971154-5ee2fc4a7a15?w=1600&q=80"
          alt="Concrete plant operations"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative max-w-6xl mx-auto px-6 py-28 text-center space-y-6">
          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs font-bold uppercase tracking-widest px-4 py-1">
            Concrete Delivery Management · Panama
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">
            <span className="text-white">Concrete</span>
            <span className="text-orange-400">Pulse</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            The all-in-one dispatch management platform built for concrete ready-mix plants.
            From first call to final pour — tracked, assigned, and delivered.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white gap-2 font-bold px-8">
                <Zap className="w-4 h-4" /> Live Demo
              </Button>
            </Link>
            <a href="#dashboard">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 px-8">
                <ChevronDown className="w-4 h-4" /> Explore Modules
              </Button>
            </a>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative border-t border-white/10 bg-black/30">
          <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-2xl font-black text-orange-400">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem / Solution ── */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <Badge variant="outline" className="text-xs uppercase tracking-wide font-bold">The Problem</Badge>
            <h2 className="text-3xl font-black text-gray-900">Concrete delivery is chaotic without the right tools.</h2>
            <ul className="space-y-3">
              {[
                'Orders tracked in WhatsApp threads and paper logs',
                'Dispatchers manually calling drivers one by one',
                'No visibility into truck location or status',
                'Driver compensation calculated in spreadsheets',
                'No historic delivery data for route optimization',
              ].map(p => (
                <li key={p} className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-red-500 font-bold mt-0.5">✕</span> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs uppercase tracking-wide font-bold">The Solution</Badge>
            <h2 className="text-3xl font-black text-gray-900">ConcretePulse unifies every layer of dispatch operations.</h2>
            <ul className="space-y-3">
              {[
                'Real-time Kanban board — every order visible at a glance',
                'WhatsApp broadcast with auto first-reply assignment',
                'Live fleet status across all trucks and drivers',
                'Built-in compensation calculator with override capability',
                'Analytics with historical delivery time per location',
              ].map(s => (
                <li key={s} className="flex items-start gap-2 text-gray-600 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Modules ── */}
      {MODULES.map((m, i) => <ModuleSection key={m.id} module={m} reverse={i % 2 !== 0} />)}

      {/* ── Roles & Permissions ── */}
      <section id="roles" className="bg-gray-950 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 space-y-3">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs uppercase tracking-wider font-bold">Access Control</Badge>
            <h2 className="text-3xl font-black">Role-Based Permissions</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">ConcretePulse ships with three pre-configured roles. Every action in the system is gated to ensure the right people have the right access.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {ROLES.map(r => (
              <div key={r.role} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
                <Badge className={cn('text-xs font-bold uppercase tracking-wide border', r.color)}>{r.role}</Badge>
                <ul className="space-y-2">
                  {r.capabilities.map(c => (
                    <li key={c} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" /> {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations & Capabilities ── */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="outline" className="text-xs uppercase tracking-wider font-bold">Platform Capabilities</Badge>
            <h2 className="text-3xl font-black text-gray-900">Everything Included. No Add-Ons.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTEGRATIONS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex gap-4 p-5 rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{label}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Architecture ── */}
      <section className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="outline" className="text-xs uppercase tracking-wider font-bold">Architecture</Badge>
            <h2 className="text-3xl font-black text-gray-900">Built on Modern, Scalable Infrastructure</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Activity, title: 'React + Vite Frontend', desc: 'Single-page application with React 18, Tanstack Query for server state, and Framer Motion for transitions. Responsive from mobile to 4K.' },
              { icon: Shield, title: 'Base44 Backend-as-a-Service', desc: 'Serverless entity storage, real-time subscriptions, and built-in authentication. No separate database to manage.' },
              { icon: Star, title: 'Recharts + jsPDF', desc: 'Production-grade charting with Recharts and server-side PDF generation via jsPDF — no third-party report tools needed.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-orange-500 py-20 text-white text-center">
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="text-4xl font-black">Ready to modernize your plant operations?</h2>
          <p className="text-orange-100 text-lg">ConcretePulse is live, functional, and ready for your team. Open the app and explore with demo data loaded.</p>
          <Link to="/">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-bold text-base px-10 gap-2 shadow-xl">
              <Zap className="w-5 h-5" /> Launch ConcretePulse
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-gray-500 py-8 text-center text-xs">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center">
              <Truck className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-400 font-semibold">ConcretePulse</span>
            <span>· by Conversely.net</span>
          </div>
          <div className="flex items-center gap-4">
            <span>v1.0 Prototype</span>
            <span>·</span>
            <span>Panama Concrete Plant Dispatch System</span>
            <span>·</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}