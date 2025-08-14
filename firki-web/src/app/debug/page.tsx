export default function DebugPage() {
  return (
    <div className="min-h-screen bg-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-800 mb-8">Debug Page</h1>
        
        {/* Test the Firki logo styling */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Firki Logo Test</h2>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Firki</span>
          </div>
        </div>

        {/* Basic color test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Color Test</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-600 text-white p-4 rounded-lg text-center">Blue 600</div>
            <div className="bg-green-600 text-white p-4 rounded-lg text-center">Green 600</div>
            <div className="bg-gray-200 text-gray-900 p-4 rounded-lg text-center">Gray 200</div>
            <div className="bg-gray-500 text-white p-4 rounded-lg text-center">Gray 500</div>
          </div>
        </div>

        {/* Button test */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Button Test</h2>
          
          <div className="space-y-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Blue Button
            </button>
            
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Green Button
            </button>
            
            <button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 font-bold py-2 px-4 rounded">
              Outline Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
