// src/pages/UnauthorizedPage.jsx
import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="text-center py-10">
      <h1 className="text-3xl font-bold mb-4">403 - Unauthorized</h1>
      <p className="mb-4">You don't have permission to access this page.</p>
      <Link to="/" className="text-blue-600 hover:underline">
        Return to Home
      </Link>
    </div>
  );
}