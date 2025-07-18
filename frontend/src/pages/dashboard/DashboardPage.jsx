import React from 'react';
import useAuthStore from '../../stores/authStore';

const DashboardPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName || user?.email}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your account today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Uploads</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
            <p className="text-sm text-gray-600">Study notes uploaded</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Orders</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
            <p className="text-sm text-gray-600">Notes purchased</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Earnings</h3>
            <p className="text-3xl font-bold text-green-600">$0</p>
            <p className="text-sm text-gray-600">Total earned</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-600">
        <p>Dashboard features coming soon...</p>
      </div>
    </div>
  );
};

export default DashboardPage;