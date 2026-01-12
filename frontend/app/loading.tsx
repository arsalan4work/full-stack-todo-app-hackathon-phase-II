import LoadingSpinner from '@/components/ui/loading-spinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
        <p className="mt-4 text-lg text-gray-600">Loading...</p>
      </div>
    </div>
  );
}