import { Header } from '@/components/ui/header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Firki Web App</h1>
        <p className="text-gray-600">Testing if components are working...</p>
        
        {/* Test the Firki logo */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Firki Logo Test:</h2>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Firki</span>
          </div>
        </div>
      </div>
    </div>
  );
}
