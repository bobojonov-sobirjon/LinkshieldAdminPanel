import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'
import ClassicLayout from '@/layouts/ClassicLayout'
import AdsPage from '@/pages/AdsPage'
import BillingPage from '@/pages/BillingPage'
import DashboardPage from '@/pages/DashboardPage'
import GeoPage from '@/pages/GeoPage'
import FaqPage from '@/pages/FaqPage'
import LinksPage from '@/pages/LinksPage'
import LoginPage from '@/pages/LoginPage'
import ReviewsPage from '@/pages/ReviewsPage'
import SettingsPage from '@/pages/SettingsPage'
import StoreLinksPage from '@/pages/StoreLinksPage'
import UsersPage from '@/pages/UsersPage'

function BootScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f4f6f9] text-sm text-gray-500">
      LinkShield
    </div>
  )
}

function RequireStaff() {
  const { ready, user } = useAuth()
  const location = useLocation()
  if (!ready) return <BootScreen />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireStaff />}>
        <Route element={<ClassicLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="geo" element={<GeoPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="links" element={<LinksPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="ads" element={<AdsPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="store" element={<StoreLinksPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
