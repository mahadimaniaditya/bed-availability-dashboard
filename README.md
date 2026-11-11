# Bed Availability Dashboard (Frontend Demo)

A receptionist-focused hospital bed board built to the frontend requirements spec.
**All data is fictional and stored in your browser (localStorage). It is not a live bed board.**

## Stack
React 18 + Vite · Tailwind CSS · React Router · Framer Motion · Three.js / React Three Fiber · Recharts · Lucide · React Hook Form + Zod · date-fns

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
```

## Structure
```
src/
  main.jsx, App.jsx        Entry + routes
  index.css                Design tokens: glass cards, 3D buttons, tilt hover
  data/seed.js             Fictional wards, beds, patients, admissions, reservations, events
  store/StoreContext.jsx   State + localStorage + all workflow rules (reserve, admit, transfer, discharge, status)
  lib/                     constants (status colours, allowed transitions), schemas (Zod), formatters, CSV export
  components/              Layout, Hero3D (lazy WebGL), Charts, Workflows (dialogs), ui primitives
  pages/                   Dashboard, Beds, Wards, Admissions (+Discharges), Reservations, Cleaning, Reports, Settings
```

## Design notes
- Teal/emerald on neutral glass surfaces, dark slate text, Sora + Figtree type.
- Status always uses text + icon + colour.
- 3D is limited to the dashboard hero; it falls back to an icon without WebGL and respects reduced motion.

## Business rules enforced in the store
Only Available beds can be reserved or assigned · one active admission per demo patient · transfer sends the old bed to Cleaning · discharge sends the bed to Cleaning · Cleaning/Maintenance must be released with a note · every change writes a history event · Reset Demo Data is confirmed.
