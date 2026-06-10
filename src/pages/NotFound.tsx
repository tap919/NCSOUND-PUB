import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex-1 py-24 flex items-center justify-center px-6">
      <div className="text-center">
        <h2 className="text-6xl font-bold text-white mb-4 tracking-tighter">404</h2>
        <p className="text-gray-400 mb-8 mx-auto max-w-sm">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-gray-200 transition-colors">
          Return Home
        </Link>
      </div>
    </div>
  );
}
