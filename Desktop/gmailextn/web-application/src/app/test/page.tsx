export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tailwind CSS Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Card 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Primary Button</h2>
            <button className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              Blue Button
            </button>
          </div>

          {/* Test Card 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Secondary Button</h2>
            <button className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg transition-colors">
              Green Button
            </button>
          </div>

          {/* Test Card 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Outline Button</h2>
            <button className="border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
              Outline Button
            </button>
          </div>

          {/* Test Card 4 */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Input Field</h2>
            <input 
              type="text" 
              placeholder="Type something..." 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Color Test */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Color Palette Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-600 text-white p-4 rounded-lg text-center">Blue 600</div>
            <div className="bg-green-600 text-white p-4 rounded-lg text-center">Green 600</div>
            <div className="bg-gray-200 text-gray-900 p-4 rounded-lg text-center">Gray 200</div>
            <div className="bg-gray-500 text-white p-4 rounded-lg text-center">Gray 500</div>
          </div>
        </div>
      </div>
    </div>
  );
}
