import { Plus, Type, Image, Folder } from 'lucide-react';

export default function InsertButton({ section, position, onInsert }) {
  return (
    <div className="relative group/insert my-1">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t-2 border-dashed border-gray-300 group-hover/insert:border-blue-500 transition-colors"></div>
      </div>
      <div className="relative flex justify-center">
        <button
          type="button"
          className="opacity-0 group-hover/insert:opacity-100 transition-all bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transform hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            const menu = e.currentTarget.nextElementSibling;
            if (menu) {
              menu.classList.toggle('hidden');
            }
          }}
          title="Add element"
        >
          <Plus size={16} />
        </button>
        <div className="hidden absolute top-12 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-2 z-20 flex gap-2">
          <button
            type="button"
            onClick={() => onInsert(section, position, 'text')}
            className="flex flex-col items-center gap-2 p-4 hover:bg-blue-50 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all group"
            title="Add text block"
          >
            <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-lg">
              <Type size={24} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Text</span>
          </button>
          <button
            type="button"
            onClick={() => onInsert(section, position, 'image')}
            className="flex flex-col items-center gap-2 p-4 hover:bg-green-50 rounded-lg border-2 border-transparent hover:border-green-500 transition-all group"
            title="Add image block"
          >
            <div className="p-3 bg-green-100 group-hover:bg-green-200 rounded-lg">
              <Image size={24} className="text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Image</span>
          </button>
          <button
            type="button"
            onClick={() => onInsert(section, position, 'group')}
            className="flex flex-col items-center gap-2 p-4 hover:bg-purple-50 rounded-lg border-2 border-transparent hover:border-purple-500 transition-all group"
            title="Add group block"
          >
            <div className="p-3 bg-purple-100 group-hover:bg-purple-200 rounded-lg">
              <Folder size={24} className="text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Group</span>
          </button>
        </div>
      </div>
    </div>
  );
}
