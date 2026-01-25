import { Type, Image, Folder } from 'lucide-react';
import GroupChildEditor from './GroupChildEditor';

export default function GroupBlockEditor({ 
  block, 
  onUpdate, 
  onAddChild, 
  onRemoveChild, 
  onUpdateChild 
}) {
  return (
    <>
      {/* Group Layout */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">Group Layout</label>
        <div className="flex gap-2">
          {['horizontal', 'vertical'].map((layout) => (
            <button
              key={layout}
              type="button"
              onClick={() => onUpdate('layout', layout)}
              className={`flex-1 px-3 py-1 text-xs rounded border ${
                (block.layout || 'horizontal') === layout
                  ? 'bg-purple-100 border-purple-500 text-purple-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {layout.charAt(0).toUpperCase() + layout.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Group Alignment */}
      <div>
        <label className="block text-xs text-gray-600 mb-1">Group Alignment</label>
        <div className="flex gap-2">
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => onUpdate('alignment', align)}
              className={`flex-1 px-3 py-1 text-xs rounded border ${
                block.alignment === align
                  ? 'bg-purple-100 border-purple-500 text-purple-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Group Children */}
      <div className="border-t border-purple-200 pt-3">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium text-gray-700">
            Group Elements ({(block.children || []).length})
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onAddChild('text')}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100"
            >
              <Type size={12} />
              Text
            </button>
            <button
              type="button"
              onClick={() => onAddChild('image')}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100"
            >
              <Image size={12} />
              Image
            </button>
            <button
              type="button"
              onClick={() => onAddChild('group')}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs hover:bg-purple-100"
            >
              <Folder size={12} />
              Group
            </button>
          </div>
        </div>

        {(!block.children || block.children.length === 0) ? (
          <div className="border-2 border-dashed border-purple-200 rounded p-4 text-center">
            <p className="text-purple-500 text-xs">
              No elements in this group. Add text, image, or group elements.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {block.children.map((child, childIndex) => (
              <GroupChildEditor
                key={child.id || childIndex}
                child={child}
                childIndex={childIndex}
                onUpdate={onUpdateChild}
                onRemove={onRemoveChild}
                onAddNestedChild={(parentIdx, type) => {
                  // Add to nested group
                  const newChild = {
                    id: Date.now() + Math.random(),
                    type,
                    content: type === 'text' ? 'Enter text here' : '',
                    alignment: type === 'group' ? 'center' : undefined,
                    layout: type === 'group' ? 'horizontal' : undefined,
                    children: type === 'group' ? [] : undefined,
                    styles: {
                      fontWeight: 'normal',
                      fontSize: 'medium',
                      color: '#000000',
                      width: type === 'image' ? 50 : undefined,
                      height: type === 'image' ? 50 : undefined,
                    },
                  };
                  const updatedChild = {
                    ...block.children[parentIdx],
                    children: [...(block.children[parentIdx].children || []), newChild]
                  };
                  onUpdateChild(parentIdx, 'children', updatedChild.children);
                }}
                onRemoveNestedChild={(parentIdx, nestedIdx) => {
                  const updatedChildren = (block.children[parentIdx].children || []).filter((_, i) => i !== nestedIdx);
                  onUpdateChild(parentIdx, 'children', updatedChildren);
                }}
                onUpdateNestedChild={(parentIdx, nestedIdx, field, value) => {
                  const updatedChildren = (block.children[parentIdx].children || []).map((child, i) =>
                    i === nestedIdx
                      ? field.includes('.')
                        ? {
                            ...child,
                            styles: {
                              ...child.styles,
                              [field.split('.')[1]]: value,
                            },
                          }
                        : { ...child, [field]: value }
                      : child
                  );
                  onUpdateChild(parentIdx, 'children', updatedChildren);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
