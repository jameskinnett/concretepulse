import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import {
  LayoutDashboard, Package, Truck, Users, Building2, MapPin,
  BarChart2, TrendingUp, CheckCircle2, Zap, Shield, Bell,
  MessageCircle, ArrowRight, ChevronDown, Globe2,
  FileDown, FileSpreadsheet, Radio, Star, Activity,
  UserCog, Settings, Map as MapIcon, CalendarRange
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Bilingual content ────────────────────────────────────────────────────────

const CONTENT = {
  en: {
    navBadge: 'PRODUCT BRIEF',
    openApp: 'Open App',
    heroBadge: 'Concrete Delivery Management · Panama',
    heroSub: 'The all-in-one dispatch management platform built for concrete ready-mix plants. From first call to final pour — tracked, assigned, and delivered.',
    liveDemo: 'Live Demo',
    exploreModules: 'Explore Modules',
    stats: [
      { label: 'Active Orders Tracked', value: '10,000+' },
      { label: 'Avg. Dispatch Time', value: '< 90 sec' },
      { label: 'Driver Utilization Gain', value: '+34%' },
      { label: 'Delivery Accuracy', value: '98.7%' },
    ],
    problemBadge: 'The Problem',
    problemTitle: 'Concrete delivery is chaotic without the right tools.',
    problems: [
      'Orders tracked in WhatsApp threads and paper logs',
      'Dispatchers manually calling drivers one by one',
      'No visibility into truck location or status',
      'Driver compensation calculated in spreadsheets',
      'No historic delivery data for route optimization',
    ],
    solutionBadge: 'The Solution',
    solutionTitle: 'ConcretePulse unifies every layer of dispatch operations.',
    solutions: [
      'Real-time Kanban board — every order visible at a glance',
      'WhatsApp broadcast with group targeting and auto first-reply assignment',
      'Live fleet status across all trucks and drivers',
      'Built-in compensation calculator with override capability',
      'Analytics dashboards with date-range filters, trend charts, and CSV export',
      'Driver groups for targeted broadcast and auto-escalation',
    ],
    rolesBadge: 'Access Control',
    rolesTitle: 'Role-Based Permissions',
    rolesSub: 'ConcretePulse ships with three pre-configured roles. Every action in the system is gated to ensure the right people have the right access.',
    roles: [
      { role: 'Admin', color: 'bg-orange-100 text-orange-700 border-orange-200', capabilities: ['Full read/write access to all modules', 'Export PDF reports', 'Manage users and roles', 'Override driver compensation', 'View financial data'] },
      { role: 'Dispatcher', color: 'bg-blue-100 text-blue-700 border-blue-200', capabilities: ['Create and assign orders', 'Broadcast to driver WhatsApp', 'Mark orders delivered', 'View fleet and driver status', 'Export PDF reports'] },
      { role: 'Viewer', color: 'bg-gray-100 text-gray-600 border-gray-200', capabilities: ['Read-only access to all modules', 'View Kanban board and charts', 'Monitor fleet and driver availability', 'No create, edit, or export actions'] },
    ],
    capsBadge: 'Platform Capabilities',
    capsTitle: 'Everything Included. No Add-Ons.',
    integrations: [
      { icon: MessageCircle, label: 'WhatsApp Broadcast', desc: 'Driver broadcast and first-reply auto-assignment via WhatsApp group, with group targeting and escalation' },
      { icon: Globe2, label: 'Bilingual', desc: 'Full English / Spanish interface — toggle per-user in the header, persisted across sessions' },
      { icon: FileSpreadsheet, label: 'CSV Export', desc: 'One-click CSV downloads for orders, customers, drivers, trucks, and locations — spreadsheet-ready' },
      { icon: FileDown, label: 'PDF Reports', desc: 'jsPDF-powered exports for daily dispatch, delivery history, and driver performance' },
      { icon: Bell, label: 'In-App Notifications', desc: 'Real-time bell alerts for order events, gated by role and target audience' },
      { icon: CalendarRange, label: 'Date-Range Analytics', desc: 'Global filter bar with quick presets (7/30/90 days, this month, all time) across all report tabs' },
      { icon: MapIcon, label: 'Map Location Picker', desc: 'Interactive Leaflet map for placing delivery sites — no manual coordinate entry' },
      { icon: Radio, label: 'Demo Simulation', desc: 'Auto-progression engine for demos and training sessions' },
      { icon: Shield, label: 'RBAC', desc: 'Role-based access control: Admin, Dispatcher, Viewer — enforced at entity level' },
    ],
    archBadge: 'Architecture',
    archTitle: 'Built on Modern, Scalable Infrastructure',
    arch: [
      { icon: Activity, title: 'React + Vite Frontend', desc: 'Single-page application with React 18, Tanstack Query for server state, and Framer Motion for transitions. Responsive from mobile to 4K.' },
      { icon: Shield, title: 'Base44 Backend-as-a-Service', desc: 'Serverless entity storage, real-time subscriptions, and built-in authentication. No separate database to manage.' },
      { icon: Star, title: 'Recharts + jsPDF + CSV', desc: 'Production-grade charting with Recharts, PDF generation via jsPDF, and native CSV export — no third-party report tools needed.' },
    ],
    ctaTitle: 'Ready to modernize your plant operations?',
    ctaSub: 'ConcretePulse is live, functional, and ready for your team. Open the app and explore with demo data loaded.',
    ctaBtn: 'Launch ConcretePulse',
    footerTag: 'Panama Concrete Plant Dispatch System',
    modules: [
      {
        id: 'dashboard', icon: LayoutDashboard, color: 'bg-orange-500',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
        title: 'Dispatch Dashboard',
        tagline: 'Command Center for Real-Time Operations',
        description: 'The nerve center of ConcretePulse. Dispatchers see every active order on a live Kanban board — from freshly received requests to trucks en route and completed pours. Built for speed: assign trucks, trigger WhatsApp broadcasts, and mark orders delivered in seconds.',
        features: [
          { title: 'Live Kanban Board', desc: 'Four-column workflow (New → Assigned → In Progress → Delivered) with cards showing ETA, mix type, and client info.' },
          { title: 'Demo Mode', desc: 'Auto-progresses orders every 6 seconds to simulate real dispatch activity — perfect for presentations and team training.' },
          { title: 'WhatsApp Broadcast', desc: 'One-click blast to the driver WhatsApp group. First driver to reply YES is automatically locked in — no back-and-forth.' },
          { title: 'Batch Delivery Confirmation', desc: 'Select multiple in-progress orders and mark them all delivered in one action.' },
          { title: 'Smart Filters', desc: 'Filter the board by status, truck, or client company instantly — zero page reload.' },
          { title: 'Real-Time Notifications', desc: 'Every status change triggers an in-app alert visible to dispatchers and admins simultaneously.' },
        ],
      },
      {
        id: 'orders', icon: Package, color: 'bg-blue-500',
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=80',
        title: 'Order Management',
        tagline: 'Full Lifecycle Tracking from Pour to Proof',
        description: 'Every delivery order lives here — searchable, filterable, and actionable. Create new orders with concrete mix specs, assign resources, and track from scheduling through final delivery with timestamped milestones.',
        features: [
          { title: 'Structured Order Creation', desc: 'Guided form captures company, location, mix strength (210–420 kg/cm²), volume (m³), priority, and scheduled time.' },
          { title: 'Status History', desc: 'Full timestamp trail: creation, assignment, departure, arrival, and completion times all recorded automatically.' },
          { title: 'Priority Flagging', desc: 'Mark orders as Normal or Urgent — urgent orders surface at the top of the Kanban with visual badges.' },
          { title: 'Compensation Auto-Link', desc: 'When an order is delivered, the compensation calculator automatically pre-fills driver and order data.' },
          { title: 'Advanced Search & Filter', desc: 'Full-text search by order number or client, combined with status and date filters.' },
        ],
      },
      {
        id: 'trucks', icon: Truck, color: 'bg-yellow-500',
        image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=1200&q=80',
        title: 'Fleet Management',
        tagline: 'Know Where Every Mixer Is, Right Now',
        description: 'Manage your entire concrete mixer fleet from a single screen. Real-time status tracking, capacity management, and driver assignment ensure no truck sits idle and no schedule conflict goes unnoticed.',
        features: [
          { title: 'Real-Time Status Board', desc: 'Every truck shows its current state: Available, Loading, In Transit, Maintenance, or Off Duty — updated the moment an order is assigned or completed.' },
          { title: 'Capacity Tracking', desc: 'Capacity (m³) is shown on every truck card — dispatchers match truck capacity to order volume automatically.' },
          { title: 'Driver Assignment', desc: 'See which driver is currently operating each truck. Driver availability updates in sync.' },
          { title: 'Map Overlay', desc: 'Visual minimap shows active trucks in the service region with live status icons.' },
          { title: 'Fleet Sidebar', desc: 'At-a-glance count of trucks in each status category, always visible on the dispatch dashboard.' },
        ],
      },
      {
        id: 'drivers', icon: Users, color: 'bg-green-500',
        image: 'https://images.unsplash.com/photo-1537726235470-8504e3beef77?w=1200&q=80',
        title: 'Driver Management',
        tagline: 'Workforce Visibility and Compensation in One Place',
        description: 'Track every driver — employees and contractors — with real-time availability, licensing status, and compensation rates. Paired with the performance analytics module, this becomes your complete workforce intelligence layer.',
        features: [
          { title: 'Employee & Contractor Profiles', desc: 'Differentiate between salaried employees and independent contractors with separate compensation models.' },
          { title: 'Availability Tracking', desc: 'Four states: Available, On Route, Off Duty, and Vacation — updated automatically as orders progress.' },
          { title: 'Multi-Rate Compensation', desc: 'Configure Rate/Hour, Rate/Order, and Rate/Km independently per driver. Set overtime multipliers.' },
          { title: 'License Expiry Alerts', desc: 'Store license expiry dates and surface upcoming renewals — avoid compliance risk.' },
          { title: 'Performance Link', desc: 'Every driver links to the Driver Performance module for monthly delivery counts, on-time rates, and revenue generated.' },
        ],
      },
      {
        id: 'companies', icon: Building2, color: 'bg-purple-500',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
        title: 'Client & Company Management',
        tagline: 'Your Full Client Roster with Credit Intelligence',
        description: 'Manage every construction company you serve. Track contacts, credit status, and credit limits. Know at a glance which clients are approved for credit, which are cash-only, and which are suspended.',
        features: [
          { title: 'Company Profiles', desc: 'Contact name, phone, and email stored per company with notes for account managers.' },
          { title: 'Credit Status Management', desc: 'Four states: Approved, Pending, Suspended, and C.O.D. — visible at order creation to prevent unapproved deliveries.' },
          { title: 'Credit Limit Tracking', desc: 'Set USD credit limits per company to enforce accounts-receivable policy.' },
          { title: 'Linked Locations', desc: 'Each company links to its registered delivery sites — dispatchers see only valid drop-off points when creating orders.' },
        ],
      },
      {
        id: 'locations', icon: MapPin, color: 'bg-red-500',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
        title: 'Delivery Locations',
        tagline: 'Smart Job Sites with Mix Restrictions & ETA Intelligence',
        description: 'Each delivery location is more than an address. Restrict allowed concrete mixes per site, store special on-site instructions, and benefit from auto-computed average delivery time estimates based on historical orders.',
        features: [
          { title: 'Mix Allowlist', desc: 'Define which concrete strengths (kg/cm²) are permitted at each site — enforced at order creation to eliminate spec errors.' },
          { title: 'Historical ETA Engine', desc: 'Automatically calculates average delivery time from past orders to the same location, shown when scheduling new pours.' },
          { title: 'GPS Coordinates', desc: 'Store lat/lng per location for future map integration and route optimization.' },
          { title: 'Special Instructions', desc: 'Site-specific notes — access codes, unloading procedures, on-site contacts — travel with every order.' },
        ],
      },
      {
        id: 'reports', icon: BarChart2, color: 'bg-teal-500',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
        title: 'Analytics Dashboard',
        tagline: 'Interactive Dashboards That Drive Better Decisions',
        description: 'A full analytics suite — not static reports. Filter by date range, customer, or driver with quick presets, then drill into daily delivery trends, order status distribution, and mix type breakdowns. Every tab offers CSV export for spreadsheet analysis alongside PDF reports for formal documentation.',
        features: [
          { title: 'Global Filter Bar', desc: 'Date-range picker with quick presets (7/30/90 days, this month, all time) plus company and driver dropdowns — filters apply across all tabs instantly.' },
          { title: 'Daily Delivery Trend', desc: 'Area chart showing order volume and delivered orders over time — spot demand patterns and peak days at a glance.' },
          { title: 'Status Distribution', desc: 'Donut chart breaking down orders by status (new, assigned, in progress, delivered, cancelled) for pipeline visibility.' },
          { title: 'Mix Type Breakdown', desc: 'Bar chart of order counts per concrete mix strength (210–420 kg/cm²) — understand which products drive volume.' },
          { title: 'Customer & Location Analytics', desc: 'Per-company and per-location breakdowns with delivery counts, volumes, cancellation rates, and average delivery times.' },
          { title: 'CSV Export per Tab', desc: 'Download orders, customers, drivers, trucks, and locations as CSV files — ready for Excel, Google Sheets, or BI tools.' },
          { title: 'PDF Report Suite', desc: "Today's dispatch summary, full delivery history by company, and driver performance — all one-click PDF exports." },
          { title: 'Role-Gated Access', desc: 'Exports are restricted to Admin and Dispatcher roles — Viewers see dashboards but cannot export.' },
        ],
      },
      {
        id: 'driver-groups', icon: UserCog, color: 'bg-pink-500',
        image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80',
        title: 'Driver Groups',
        tagline: 'Organize Drivers into Broadcast-Ready Teams',
        description: 'Create logical driver groups — by shift, zone, or contractor pool — and broadcast orders to specific groups instead of all drivers. The broadcast modal simulates a WhatsApp group chat where the first driver to reply YES is automatically assigned, with escalation if no one responds.',
        features: [
          { title: 'Custom Groups', desc: 'Name and describe groups (Night Shift, North Zone, Contractor Pool) and add any number of drivers to each.' },
          { title: 'Targeted Broadcast', desc: 'Select a group when broadcasting an order — only those drivers receive the WhatsApp-style message.' },
          { title: 'First-Reply Wins', desc: 'The first driver to reply YES in the simulated chat is automatically locked in — no dispatcher intervention needed.' },
          { title: 'Auto-Escalation', desc: 'If no driver in the group responds within the timeout window, the system can escalate to all available drivers.' },
        ],
      },
      {
        id: 'settings', icon: Settings, color: 'bg-slate-500',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80',
        title: 'Settings & Preferences',
        tagline: 'Personalize Your Workspace',
        description: 'User-level preferences for theme, language, and profile management. Admins can manage the full user roster with role assignment. Every preference is persisted per user for a consistent experience across sessions and devices.',
        features: [
          { title: 'Light / Dark Theme', desc: 'Toggle between light and dark mode — preference is saved per user and applied on every login.' },
          { title: 'Language Switch', desc: 'Switch between English and Spanish at any time from the header — the entire interface updates instantly.' },
          { title: 'Profile Management', desc: 'Update full name and contact details directly from the settings page.' },
          { title: 'User Invitation', desc: 'Admins can invite new team members by email and assign Admin, Dispatcher, or Viewer roles.' },
        ],
      },
    ],
  },

  es: {
    navBadge: 'DOCUMENTO DEL PRODUCTO',
    openApp: 'Abrir App',
    heroBadge: 'Gestión de Entrega de Concreto · Panamá',
    heroSub: 'La plataforma todo-en-uno de despacho diseñada para plantas de concreto premezclado. Desde la primera llamada hasta el vaciado final — rastreado, asignado y entregado.',
    liveDemo: 'Demo en Vivo',
    exploreModules: 'Ver Módulos',
    stats: [
      { label: 'Pedidos Activos Rastreados', value: '10,000+' },
      { label: 'Tiempo Promedio de Despacho', value: '< 90 seg' },
      { label: 'Mejora en Uso de Conductores', value: '+34%' },
      { label: 'Precisión de Entrega', value: '98.7%' },
    ],
    problemBadge: 'El Problema',
    problemTitle: 'La entrega de concreto es caótica sin las herramientas correctas.',
    problems: [
      'Pedidos rastreados en hilos de WhatsApp y registros en papel',
      'Despachadores llamando manualmente a los conductores uno por uno',
      'Sin visibilidad de la ubicación o estado de los camiones',
      'Compensación del conductor calculada en hojas de cálculo',
      'Sin datos históricos de entrega para optimización de rutas',
    ],
    solutionBadge: 'La Solución',
    solutionTitle: 'ConcretePulse unifica cada capa de las operaciones de despacho.',
    solutions: [
      'Tablero Kanban en tiempo real — cada pedido visible de un vistazo',
      'Transmisión por WhatsApp con selección de grupo y asignación automática al primer en responder',
      'Estado de flota en vivo para todos los camiones y conductores',
      'Calculadora de compensación integrada con capacidad de ajuste manual',
      'Tableros de analítica con filtros de rango de fechas, gráficos de tendencia y exportación CSV',
      'Grupos de conductores para transmisión dirigida y escalamiento automático',
    ],
    rolesBadge: 'Control de Acceso',
    rolesTitle: 'Permisos por Rol',
    rolesSub: 'ConcretePulse incluye tres roles preconfigurados. Cada acción en el sistema está controlada para garantizar que las personas correctas tengan el acceso correcto.',
    roles: [
      { role: 'Administrador', color: 'bg-orange-100 text-orange-700 border-orange-200', capabilities: ['Acceso completo de lectura/escritura a todos los módulos', 'Exportar reportes PDF', 'Gestionar usuarios y roles', 'Ajustar compensación de conductores', 'Ver datos financieros'] },
      { role: 'Despachador', color: 'bg-blue-100 text-blue-700 border-blue-200', capabilities: ['Crear y asignar pedidos', 'Transmitir al WhatsApp de conductores', 'Marcar pedidos como entregados', 'Ver estado de flota y conductores', 'Exportar reportes PDF'] },
      { role: 'Observador', color: 'bg-gray-100 text-gray-600 border-gray-200', capabilities: ['Acceso de solo lectura a todos los módulos', 'Ver tablero Kanban y gráficos', 'Monitorear disponibilidad de flota y conductores', 'Sin acciones de creación, edición o exportación'] },
    ],
    capsBadge: 'Capacidades de la Plataforma',
    capsTitle: 'Todo Incluido. Sin Complementos.',
    integrations: [
      { icon: MessageCircle, label: 'Transmisión WhatsApp', desc: 'Transmisión a conductores y asignación automática al primer en responder vía grupo de WhatsApp, con selección de grupo y escalamiento' },
      { icon: Globe2, label: 'Bilingüe', desc: 'Interfaz completa en inglés y español — configurable por usuario, persistente entre sesiones' },
      { icon: FileSpreadsheet, label: 'Exportación CSV', desc: 'Descargas CSV con un clic para pedidos, clientes, conductores, camiones y ubicaciones — listos para hojas de cálculo' },
      { icon: FileDown, label: 'Reportes PDF', desc: 'Exportaciones con jsPDF para despacho diario, historial de entregas y desempeño de conductores' },
      { icon: Bell, label: 'Notificaciones', desc: 'Alertas en tiempo real para eventos de pedidos, controladas por rol y audiencia objetivo' },
      { icon: CalendarRange, label: 'Analítica por Rango de Fechas', desc: 'Barra de filtros global con presets rápidos (7/30/90 días, este mes, todo) en todas las pestañas' },
      { icon: MapIcon, label: 'Selector de Ubicación en Mapa', desc: 'Mapa interactivo Leaflet para colocar sitios de entrega — sin entrada manual de coordenadas' },
      { icon: Radio, label: 'Simulación Demo', desc: 'Motor de progresión automática para demos y sesiones de capacitación' },
      { icon: Shield, label: 'RBAC', desc: 'Control de acceso basado en roles: Administrador, Despachador, Observador — aplicado a nivel de entidad' },
    ],
    archBadge: 'Arquitectura',
    archTitle: 'Construido sobre Infraestructura Moderna y Escalable',
    arch: [
      { icon: Activity, title: 'Frontend React + Vite', desc: 'Aplicación de página única con React 18, Tanstack Query para estado del servidor y Framer Motion. Responsivo desde móvil hasta 4K.' },
      { icon: Shield, title: 'Base44 Backend como Servicio', desc: 'Almacenamiento serverless de entidades, suscripciones en tiempo real y autenticación integrada. Sin base de datos separada.' },
      { icon: Star, title: 'Recharts + jsPDF + CSV', desc: 'Gráficos de producción con Recharts, generación de PDF vía jsPDF y exportación CSV nativa — sin herramientas de reporte externas.' },
    ],
    ctaTitle: '¿Listo para modernizar las operaciones de su planta?',
    ctaSub: 'ConcretePulse está en vivo, funcional y listo para su equipo. Abra la app y explore con datos de demostración cargados.',
    ctaBtn: 'Lanzar ConcretePulse',
    footerTag: 'Sistema de Despacho para Plantas de Concreto en Panamá',
    modules: [
      {
        id: 'dashboard', icon: LayoutDashboard, color: 'bg-orange-500',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
        title: 'Panel de Despacho',
        tagline: 'Centro de Comando para Operaciones en Tiempo Real',
        description: 'El centro neurálgico de ConcretePulse. Los despachadores ven cada pedido activo en un tablero Kanban en vivo — desde solicitudes recién recibidas hasta camiones en ruta y vaciados completados. Diseñado para la velocidad: asigne camiones, active transmisiones de WhatsApp y marque pedidos entregados en segundos.',
        features: [
          { title: 'Tablero Kanban en Vivo', desc: 'Flujo de trabajo de cuatro columnas (Nuevo → Asignado → En Progreso → Entregado) con tarjetas que muestran ETA, tipo de mezcla e info del cliente.' },
          { title: 'Modo Demo', desc: 'Progresa automáticamente los pedidos cada 6 segundos para simular actividad de despacho real — ideal para presentaciones y capacitación.' },
          { title: 'Transmisión por WhatsApp', desc: 'Envío con un clic al grupo de WhatsApp de conductores. El primer conductor en responder SÍ queda asignado automáticamente.' },
          { title: 'Confirmación Masiva de Entregas', desc: 'Seleccione múltiples pedidos en progreso y márquelos todos como entregados en una sola acción.' },
          { title: 'Filtros Inteligentes', desc: 'Filtre el tablero por estado, camión o empresa cliente al instante — sin recargar la página.' },
          { title: 'Notificaciones en Tiempo Real', desc: 'Cada cambio de estado genera una alerta visible simultáneamente para despachadores y administradores.' },
        ],
      },
      {
        id: 'orders', icon: Package, color: 'bg-blue-500',
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&q=80',
        title: 'Gestión de Pedidos',
        tagline: 'Seguimiento del Ciclo Completo desde el Vaciado hasta la Prueba',
        description: 'Cada pedido de entrega vive aquí — buscable, filtrable y accionable. Cree nuevos pedidos con especificaciones de mezcla de concreto, asigne recursos y rastree desde la programación hasta la entrega final con hitos con marca de tiempo.',
        features: [
          { title: 'Creación Estructurada de Pedidos', desc: 'Formulario guiado captura empresa, ubicación, resistencia de mezcla (210–420 kg/cm²), volumen (m³), prioridad y hora programada.' },
          { title: 'Historial de Estado', desc: 'Registro completo de marcas de tiempo: creación, asignación, salida, llegada y tiempos de finalización registrados automáticamente.' },
          { title: 'Marcado de Prioridad', desc: 'Marque pedidos como Normal o Urgente — los pedidos urgentes aparecen al inicio del Kanban con insignias visuales.' },
          { title: 'Enlace Automático de Compensación', desc: 'Al entregar un pedido, la calculadora de compensación pre-completa automáticamente los datos del conductor y el pedido.' },
          { title: 'Búsqueda y Filtro Avanzado', desc: 'Búsqueda de texto completo por número de pedido o cliente, combinada con filtros de estado y fecha.' },
        ],
      },
      {
        id: 'trucks', icon: Truck, color: 'bg-yellow-500',
        image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=1200&q=80',
        title: 'Gestión de Flota',
        tagline: 'Sepa Dónde Está Cada Mezcladora, Ahora Mismo',
        description: 'Gestione toda su flota de mezcladoras de concreto desde una sola pantalla. El seguimiento de estado en tiempo real, la gestión de capacidad y la asignación de conductores garantizan que ningún camión esté inactivo.',
        features: [
          { title: 'Tablero de Estado en Tiempo Real', desc: 'Cada camión muestra su estado actual: Disponible, Cargando, En Tránsito, Mantenimiento o Fuera de Servicio.' },
          { title: 'Seguimiento de Capacidad', desc: 'La capacidad (m³) se muestra en cada tarjeta de camión — los despachadores hacen coincidir la capacidad con el volumen del pedido automáticamente.' },
          { title: 'Asignación de Conductor', desc: 'Vea qué conductor está operando cada camión actualmente. La disponibilidad del conductor se actualiza en sincronía.' },
          { title: 'Superposición de Mapa', desc: 'Minimapa visual muestra camiones activos en la región de servicio con iconos de estado en vivo.' },
          { title: 'Barra Lateral de Flota', desc: 'Recuento de camiones en cada categoría de estado, siempre visible en el panel de despacho.' },
        ],
      },
      {
        id: 'drivers', icon: Users, color: 'bg-green-500',
        image: 'https://images.unsplash.com/photo-1537726235470-8504e3beef77?w=1200&q=80',
        title: 'Gestión de Conductores',
        tagline: 'Visibilidad de la Fuerza Laboral y Compensación en un Solo Lugar',
        description: 'Rastree a cada conductor — empleados y contratistas — con disponibilidad en tiempo real, estado de licencia y tarifas de compensación. Combinado con el módulo de análisis de desempeño, se convierte en su capa completa de inteligencia de fuerza laboral.',
        features: [
          { title: 'Perfiles de Empleados y Contratistas', desc: 'Diferencie entre empleados asalariados y contratistas independientes con modelos de compensación separados.' },
          { title: 'Seguimiento de Disponibilidad', desc: 'Cuatro estados: Disponible, En Ruta, Fuera de Servicio y Vacaciones — actualizados automáticamente a medida que los pedidos avanzan.' },
          { title: 'Compensación Multitarifa', desc: 'Configure Tarifa/Hora, Tarifa/Pedido y Tarifa/Km de forma independiente por conductor. Establezca multiplicadores de horas extra.' },
          { title: 'Alertas de Vencimiento de Licencia', desc: 'Almacene fechas de vencimiento de licencia y muestre renovaciones próximas — evite riesgos de cumplimiento.' },
          { title: 'Enlace de Desempeño', desc: 'Cada conductor está vinculado al módulo de Desempeño de Conductores para recuentos mensuales de entrega y tasas de puntualidad.' },
        ],
      },
      {
        id: 'companies', icon: Building2, color: 'bg-purple-500',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
        title: 'Gestión de Clientes y Empresas',
        tagline: 'Su Cartera Completa de Clientes con Inteligencia Crediticia',
        description: 'Gestione cada empresa constructora a la que atiende. Rastree contactos, estado crediticio y límites de crédito. Sepa de un vistazo qué clientes están aprobados para crédito, cuáles son contra entrega y cuáles están suspendidos.',
        features: [
          { title: 'Perfiles de Empresa', desc: 'Nombre de contacto, teléfono y correo almacenados por empresa con notas para gerentes de cuenta.' },
          { title: 'Gestión de Estado Crediticio', desc: 'Cuatro estados: Aprobado, Pendiente, Suspendido y Contra Entrega — visible al crear pedidos para prevenir entregas no autorizadas.' },
          { title: 'Seguimiento de Límite de Crédito', desc: 'Establezca límites de crédito en USD por empresa para aplicar la política de cuentas por cobrar.' },
          { title: 'Ubicaciones Vinculadas', desc: 'Cada empresa se vincula a sus sitios de entrega registrados — los despachadores solo ven puntos válidos al crear pedidos.' },
        ],
      },
      {
        id: 'locations', icon: MapPin, color: 'bg-red-500',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
        title: 'Ubicaciones de Entrega',
        tagline: 'Sitios de Obra Inteligentes con Restricciones de Mezcla e Inteligencia ETA',
        description: 'Cada ubicación de entrega es más que una dirección. Restrinja las mezclas de concreto permitidas por sitio, almacene instrucciones especiales en el sitio y benefíciese de estimaciones de tiempo promedio de entrega calculadas automáticamente.',
        features: [
          { title: 'Lista de Mezclas Permitidas', desc: 'Defina qué resistencias de concreto (kg/cm²) están permitidas en cada sitio — aplicado al crear pedidos para eliminar errores de especificación.' },
          { title: 'Motor ETA Histórico', desc: 'Calcula automáticamente el tiempo promedio de entrega de pedidos anteriores a la misma ubicación, mostrado al programar nuevos vaciados.' },
          { title: 'Coordenadas GPS', desc: 'Almacene lat/lng por ubicación para integración futura de mapas y optimización de rutas.' },
          { title: 'Instrucciones Especiales', desc: 'Notas específicas del sitio — códigos de acceso, procedimientos de descarga, contactos en sitio — viajan con cada pedido.' },
        ],
      },
      {
        id: 'reports', icon: BarChart2, color: 'bg-teal-500',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
        title: 'Panel de Analítica',
        tagline: 'Tableros Interactivos que Impulsan Mejores Decisiones',
        description: 'Una suite completa de analítica — no reportes estáticos. Filtre por rango de fechas, cliente o conductor con presets rápidos, luego profundice en tendencias diarias de entrega, distribución de estados y desglose de tipos de mezcla. Cada pestaña ofrece exportación CSV para análisis en hojas de cálculo junto con reportes PDF para documentación formal.',
        features: [
          { title: 'Barra de Filtros Global', desc: 'Selector de rango de fechas con presets rápidos (7/30/90 días, este mes, todo) más menús desplegables de empresa y conductor — los filtros se aplican en todas las pestañas al instante.' },
          { title: 'Tendencia Diaria de Entregas', desc: 'Gráfico de área que muestra volumen de pedidos y entregas completadas a lo largo del tiempo — identifique patrones de demanda y días pico.' },
          { title: 'Distribución de Estados', desc: 'Gráfico de dona que desglosa pedidos por estado (nuevo, asignado, en progreso, entregado, cancelado) para visibilidad del pipeline.' },
          { title: 'Desglose por Tipo de Mezcla', desc: 'Gráfico de barras de recuento de pedidos por resistencia de mezcla (210–420 kg/cm²) — entienda qué productos impulsan el volumen.' },
          { title: 'Analítica de Clientes y Ubicaciones', desc: 'Desglose por empresa y por ubicación con recuentos de entrega, volúmenes, tasas de cancelación y tiempos promedio de entrega.' },
          { title: 'Exportación CSV por Pestaña', desc: 'Descargue pedidos, clientes, conductores, camiones y ubicaciones como archivos CSV — listos para Excel, Google Sheets o herramientas BI.' },
          { title: 'Suite de Reportes PDF', desc: 'Despacho del día, historial completo de entregas por empresa y desempeño de conductores — todas las exportaciones PDF con un clic.' },
          { title: 'Acceso Controlado por Rol', desc: 'Las exportaciones están restringidas a roles de Administrador y Despachador — los Observadores ven tableros pero no pueden exportar.' },
        ],
      },
      {
        id: 'driver-groups', icon: UserCog, color: 'bg-pink-500',
        image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80',
        title: 'Grupos de Conductores',
        tagline: 'Organice Conductores en Equipos Listos para Transmisión',
        description: 'Cree grupos lógicos de conductores — por turno, zona o pool de contratistas — y transmita pedidos a grupos específicos en lugar de a todos los conductores. El modal de transmisión simula un chat de grupo de WhatsApp donde el primer conductor en responder SÍ es asignado automáticamente, con escalamiento si nadie responde.',
        features: [
          { title: 'Grupos Personalizados', desc: 'Nombre y describa grupos (Turno Nocturno, Zona Norte, Pool de Contratistas) y agregue cualquier número de conductores a cada uno.' },
          { title: 'Transmisión Dirigida', desc: 'Seleccione un grupo al transmitir un pedido — solo esos conductores reciben el mensaje estilo WhatsApp.' },
          { title: 'El Primero en Responder Gana', desc: 'El primer conductor en responder SÍ en el chat simulado es asignado automáticamente — sin intervención del despachador.' },
          { title: 'Escalamiento Automático', desc: 'Si ningún conductor en el grupo responde dentro del tiempo de espera, el sistema puede escalar a todos los conductores disponibles.' },
        ],
      },
      {
        id: 'settings', icon: Settings, color: 'bg-slate-500',
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80',
        title: 'Configuración y Preferencias',
        tagline: 'Personalice Su Espacio de Trabajo',
        description: 'Preferencias a nivel de usuario para tema, idioma y gestión de perfil. Los administradores pueden gestionar el roster completo de usuarios con asignación de roles. Cada preferencia se persiste por usuario para una experiencia consistente entre sesiones y dispositivos.',
        features: [
          { title: 'Tema Claro / Oscuro', desc: 'Alterne entre modo claro y oscuro — la preferencia se guarda por usuario y se aplica en cada inicio de sesión.' },
          { title: 'Cambio de Idioma', desc: 'Cambie entre inglés y español en cualquier momento desde el encabezado — toda la interfaz se actualiza al instante.' },
          { title: 'Gestión de Perfil', desc: 'Actualice el nombre completo y los datos de contacto directamente desde la página de configuración.' },
          { title: 'Invitación de Usuarios', desc: 'Los administradores pueden invitar nuevos miembros por correo y asignar roles de Administrador, Despachador u Observador.' },
        ],
      },
    ],
  },
};

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
        <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-xl shrink-0">
          <img src={module.image} alt={module.title} className="w-full h-72 object-cover" />
        </div>
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
  const { lang, setLang } = useI18n();
  const c = CONTENT[lang] || CONTENT.en;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-body">

      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        {/* Main bar — single row, never wraps */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">ConcretePulse</span>
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] font-bold hidden md:inline-flex">{c.navBadge}</Badge>
          </div>

          {/* Module links — only on XL, inline, single line */}
          <div className="hidden xl:flex items-center gap-0.5 flex-1 overflow-hidden ml-4">
            {c.modules.map(m => (
              <a key={m.id} href={`#${m.id}`} className="text-[11px] text-gray-500 hover:text-orange-600 px-1.5 py-1 rounded hover:bg-orange-50 transition-colors font-medium whitespace-nowrap">
                {m.title}
              </a>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1 xl:hidden" />

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Lang toggle */}
            <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden text-xs font-bold">
              <button onClick={() => setLang('en')} className={cn('px-2.5 py-1.5 transition-colors', lang === 'en' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50')}>EN</button>
              <button onClick={() => setLang('es')} className={cn('px-2.5 py-1.5 transition-colors', lang === 'es' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50')}>ES</button>
            </div>
            <Link to="/">
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5 text-xs h-8 px-3">
                <ArrowRight className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{c.openApp}</span>
              </Button>
            </Link>
            {/* Hamburger for module links on non-XL */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="xl:hidden flex flex-col gap-1 p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <span className={cn('block w-4 h-0.5 bg-gray-600 transition-transform', menuOpen && 'translate-y-1.5 rotate-45')} />
              <span className={cn('block w-4 h-0.5 bg-gray-600 transition-opacity', menuOpen && 'opacity-0')} />
              <span className={cn('block w-4 h-0.5 bg-gray-600 transition-transform', menuOpen && '-translate-y-1.5 -rotate-45')} />
            </button>
          </div>
        </div>

        {/* Mobile module menu */}
        {menuOpen && (
          <div className="xl:hidden border-t border-gray-100 bg-white px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-1">
            {c.modules.map(m => (
              <a key={m.id} href={`#${m.id}`} onClick={() => setMenuOpen(false)}
                className="text-xs text-gray-600 hover:text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors font-medium">
                {m.title}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative bg-gray-950 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1565710971154-5ee2fc4a7a15?w=1600&q=80"
          alt="Concrete plant"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="relative max-w-6xl mx-auto px-6 py-28 text-center space-y-6">
          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs font-bold uppercase tracking-widest px-4 py-1">
            {c.heroBadge}
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">
            <span className="text-white">Concrete</span><span className="text-orange-400">Pulse</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">{c.heroSub}</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link to="/">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white gap-2 font-bold px-8">
                <Zap className="w-4 h-4" /> {c.liveDemo}
              </Button>
            </Link>
            <a href="#dashboard">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 px-8">
                <ChevronDown className="w-4 h-4" /> {c.exploreModules}
              </Button>
            </a>
          </div>
        </div>
        <div className="relative border-t border-white/10 bg-black/30">
          <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {c.stats.map(s => (
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
            <Badge variant="outline" className="text-xs uppercase tracking-wide font-bold">{c.problemBadge}</Badge>
            <h2 className="text-3xl font-black text-gray-900">{c.problemTitle}</h2>
            <ul className="space-y-3">
              {c.problems.map(p => (
                <li key={p} className="flex items-start gap-2 text-gray-600 text-sm">
                  <span className="text-red-500 font-bold mt-0.5">✕</span> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs uppercase tracking-wide font-bold">{c.solutionBadge}</Badge>
            <h2 className="text-3xl font-black text-gray-900">{c.solutionTitle}</h2>
            <ul className="space-y-3">
              {c.solutions.map(s => (
                <li key={s} className="flex items-start gap-2 text-gray-600 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Modules ── */}
      {c.modules.map((m, i) => <ModuleSection key={m.id} module={m} reverse={i % 2 !== 0} />)}

      {/* ── Roles ── */}
      <section id="roles" className="bg-gray-950 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 space-y-3">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs uppercase tracking-wider font-bold">{c.rolesBadge}</Badge>
            <h2 className="text-3xl font-black">{c.rolesTitle}</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">{c.rolesSub}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {c.roles.map(r => (
              <div key={r.role} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
                <Badge className={cn('text-xs font-bold uppercase tracking-wide border', r.color)}>{r.role}</Badge>
                <ul className="space-y-2">
                  {r.capabilities.map(cap => (
                    <li key={cap} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" /> {cap}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="outline" className="text-xs uppercase tracking-wider font-bold">{c.capsBadge}</Badge>
            <h2 className="text-3xl font-black text-gray-900">{c.capsTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {c.integrations.map(({ icon: Icon, label, desc }) => (
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

      {/* ── Architecture ── */}
      <section className="py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 space-y-3">
            <Badge variant="outline" className="text-xs uppercase tracking-wider font-bold">{c.archBadge}</Badge>
            <h2 className="text-3xl font-black text-gray-900">{c.archTitle}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {c.arch.map(({ icon: Icon, title, desc }) => (
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
          <h2 className="text-4xl font-black">{c.ctaTitle}</h2>
          <p className="text-orange-100 text-lg">{c.ctaSub}</p>
          <Link to="/">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-bold text-base px-10 gap-2 shadow-xl">
              <Zap className="w-5 h-5" /> {c.ctaBtn}
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
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span>v2.0 Prototype</span>
            <span>·</span>
            <span>{c.footerTag}</span>
            <span>·</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}