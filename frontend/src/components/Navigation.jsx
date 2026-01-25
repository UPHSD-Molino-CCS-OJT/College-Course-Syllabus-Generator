export default function Navigation({ activeSection, onSectionChange }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => onSectionChange('syllabi')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'syllabi'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Syllabi
          </button>
          <button
            onClick={() => onSectionChange('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>
    </div>
  );
}
