import { useState } from 'react';
import { Plus, Type, Image, Folder, X } from 'lucide-react';

export default function BlockInsertButton({ onInsert, position = 'between' }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleInsert = (type) => {
    onInsert(type);
    setShowMenu(false);
  };

  return (
    <div className="relative group">
      {/* Thin line with centered button */}
      <div className="flex items-center justify-center py-2">
        <div className="flex-1 h-px bg-gray-200 group-hover:bg-blue-400 transition-colors"></div>
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className={`mx-2 p-1.5 rounded-full border-2 transition-all ${
            showMenu
              ? 'bg-blue-500 border-blue-500 text-white scale-110'
              : 'bg-white border-gray-300 text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:scale-110'
          }`}
          title="Add block"
        >
          {showMenu ? <X size={14} /> : <Plus size={14} />}
        </button>
        <div className="flex-1 h-px bg-gray-200 group-hover:bg-blue-400 transition-colors"></div>
      </div>

      {/* Floating menu */}
      {showMenu && (
        <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-1 z-10">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-2">
            <button
              type="button"
              onClick={() => handleInsert('text')}
              className="flex flex-col items-center gap-1 px-4 py-3 rounded-md hover:bg-blue-50 transition-colors group"
              title="Add text block"
            >
              <Type size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-gray-600">Text</span>
            </button>
            <button
              type="button"
              onClick={() => handleInsert('image')}
              className="flex flex-col items-center gap-1 px-4 py-3 rounded-md hover:bg-green-50 transition-colors group"
              title="Add image block"
            >
              <Image size={20} className="text-green-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-gray-600">Image</span>
            </button>
            <button
              type="button"
              onClick={() => handleInsert('group')}
              className="flex flex-col items-center gap-1 px-4 py-3 rounded-md hover:bg-purple-50 transition-colors group"
              title="Add group block"
            >
              <Folder size={20} className="text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-gray-600">Group</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
