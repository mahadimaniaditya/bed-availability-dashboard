import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Beds from './pages/Beds'
import Wards from './pages/Wards'
import Admissions from './pages/Admissions'
import Reservations from './pages/Reservations'
import Cleaning from './pages/Cleaning'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="beds" element={<Beds />} />
        <Route path="wards" element={<Wards />} />
        <Route path="admissions" element={<Admissions view="admissions" />} />
        <Route path="discharges" element={<Admissions view="discharges" />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="cleaning" element={<Cleaning />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
