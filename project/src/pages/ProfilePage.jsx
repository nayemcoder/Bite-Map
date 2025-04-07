// src/pages/ProfilePage.jsx
import React from 'react';

export default function ProfilePage() {
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Foodie | Traveler | Blogger',
    avatar: 'https://i.pravatar.cc/150?img=3',
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center">
          <img
            className="w-32 h-32 rounded-full shadow-lg mb-4"
            src={user.avatar}
            alt="User Avatar"
          />
          <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
          <p className="mt-4 text-center text-gray-600">{user.bio}</p>
          <button className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
