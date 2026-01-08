import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-blue-600">Todo App</div>
          <nav className="flex space-x-4">
            <Link href="/signin" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Manage Your Tasks <span className="text-blue-600">Effortlessly</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            A modern, secure task management application to help you stay organized and productive.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              Get Started - It's Free
            </Link>
            <Link
              href="/signin"
              className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg shadow-md border border-blue-200 hover:bg-blue-50 transition duration-300"
            >
              Sign In
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="text-blue-600 text-3xl mb-3">✓</div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Task Management</h3>
                <p className="text-gray-600">Create, update, and organize your tasks with ease.</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="text-green-600 text-3xl mb-3">✓</div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Secure Authentication</h3>
                <p className="text-gray-600">Enterprise-grade security to protect your data.</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="text-purple-600 text-3xl mb-3">✓</div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Responsive Design</h3>
                <p className="text-gray-600">Works perfectly on all your devices.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2026 Todo App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}