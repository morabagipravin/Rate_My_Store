import React from 'react';
import { getRole } from '../../utils/auth';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import OwnerDashboard from './OwnerDashboard';

export default function Dashboard() {
  const role = getRole();
  if (role === 'admin') return <AdminDashboard />;
  if (role === 'owner') return <OwnerDashboard />;
  return <UserDashboard />;
}
