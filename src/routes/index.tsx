import { lazy } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
} from 'react-router-dom';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';

const Home = lazy(() => import('@/features/home/HomePage'));
const Login = lazy(() => import('@/features/auth/LoginPage'));
const Register = lazy(() => import('@/features/auth/RegisterPage'));
const Dashboard = lazy(() => import('@/features/dashboard/DashboardPage'));
const Profile = lazy(() => import('@/features/profile/ProfilePage'));
const Products = lazy(() => import('@/features/products/ProductsPage'));
const Users = lazy(() => import('@/features/users/UsersPage'));
const Analytics = lazy(() => import('@/features/analytics/AnalyticsPage'));
const Colors = lazy(() => import('@/features/colors/ColorsPage'));
const NotFound = lazy(() => import('@/features/notfound/NotFoundPage'));
const ExamplesGallery = lazy(() => import('@/features/examples/GalleryPage'));
const ExamplesTeam = lazy(() => import('@/features/examples/TeamPage'));
const ExamplesServices = lazy(() => import('@/features/examples/ServicesPage'));
const ExamplesTable = lazy(() => import('@/features/examples/MrtTablePage'));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<MainLayout />}>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/examples">
        <Route path="gallery" element={<ExamplesGallery />} />
        <Route path="team" element={<ExamplesTeam />} />
        <Route path="services" element={<ExamplesServices />} />
        <Route path="table" element={<ExamplesTable />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/colors"
        element={
          <ProtectedRoute>
            <Colors />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="analytics" replace />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="products" element={<Products />} />
        <Route path="colors" element={<Colors />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);

export default router;

