export default function UserFilters({
  filterGender,
  onGenderChange,
  onRefresh,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">
          Filter by Gender:
        </label>
        <select
          value={filterGender}
          onChange={(e) => onGenderChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <button
          onClick={onRefresh}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
