import LoadingSpinner from '@/components/ui/loading-spinner';

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
        <p className="mt-2 text-gray-600">Loading your tasks...</p>
      </div>

      {/* Loading skeleton for Create Task Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>

          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            <div className="h-10 bg-gray-200 rounded"></div>

            <div className="h-4 bg-gray-200 rounded w-1/6 mt-4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>

            <div className="h-10 bg-gray-200 rounded w-1/5 mt-4"></div>
          </div>
        </div>
      </div>

      {/* Loading skeleton for Task List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/6"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border rounded-lg p-4 shadow-sm animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 w-12 bg-gray-200 rounded"></div>
                      <div className="h-6 w-12 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}