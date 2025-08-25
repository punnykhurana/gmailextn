export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-blue-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-800 mb-8">Simple Tailwind Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Basic Styling Test</h2>
          
          <div className="space-y-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Blue Button
            </button>
            
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Green Button
            </button>
            
            <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
              Gray Button
            </button>
          </div>
        </div>
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>If you see this styled:</strong> Tailwind is working!
        </div>
        
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
          <strong>If you see this styled:</strong> Colors are working!
        </div>
      </div>
    </div>
  );
}
