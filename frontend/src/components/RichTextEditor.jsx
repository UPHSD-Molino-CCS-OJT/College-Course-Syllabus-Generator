import { useState, useRef, useEffect } from 'react';

export default function RichTextEditor({ content, onUpdate, style, className, onBlur }) {
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (editorRef.current && content !== undefined) {
      editorRef.current.innerHTML = content || '';
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onUpdate(editorRef.current.innerHTML);
    }
  };

  const handleSelect = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      // Save the selection range
      savedSelectionRef.current = range.cloneRange();
      
      const rect = range.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();
      
      setToolbarPosition({
        top: rect.top - editorRect.top - 45,
        left: rect.left - editorRect.left + (rect.width / 2) - 150
      });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

  const applyStyle = (command, value = null) => {
    // Restore the saved selection before applying style
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    }
    
    // Apply the formatting
    document.execCommand(command, false, value);
    
    // Keep the selection visible after formatting
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) {
        selection.addRange(savedSelectionRef.current);
      }
    }
    
    editorRef.current?.focus();
    handleInput();
  };

  const handleBlurEditor = (e) => {
    // Don't hide toolbar if clicking on toolbar itself
    setTimeout(() => {
      const activeElement = document.activeElement;
      // Check if the focus moved to the toolbar or its children
      if (toolbarRef.current && toolbarRef.current.contains(activeElement)) {
        return; // Don't hide toolbar, keep it visible
      }
      setShowToolbar(false);
      if (onBlur) onBlur();
    }, 150);
  };

  return (
    <div className="relative">
      {showToolbar && (
        <div
          ref={toolbarRef}
          className="absolute z-50 bg-gray-800 border border-gray-600 rounded shadow-lg p-1 flex gap-1"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            minWidth: '300px'
          }}
          onMouseDown={(e) => {
            // Prevent event from bubbling to cell/table handlers
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={(e) => {
            // Prevent event from bubbling to cell/table handlers
            e.stopPropagation();
          }}
        >
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              applyStyle('bold');
            }}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-bold"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              applyStyle('italic');
            }}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs italic"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              applyStyle('underline');
            }}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs underline"
            title="Underline"
          >
            U
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              applyStyle('strikeThrough');
            }}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs line-through"
            title="Strikethrough"
          >
            S
          </button>
          <div className="w-px bg-gray-600"></div>
          <select
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              applyStyle('fontSize', e.target.value);
              e.target.value = '3'; // Reset to default
            }}
            className="bg-gray-700 text-white rounded text-xs px-1"
            defaultValue="3"
            title="Font Size"
          >
            <option value="1">8px</option>
            <option value="2">10px</option>
            <option value="3">12px</option>
            <option value="4">14px</option>
            <option value="5">18px</option>
            <option value="6">24px</option>
            <option value="7">36px</option>
          </select>
          <input
            type="color"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => applyStyle('foreColor', e.target.value)}
            className="w-8 h-6 bg-gray-700 rounded cursor-pointer"
            title="Text Color"
          />
          <input
            type="color"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => applyStyle('backColor', e.target.value)}
            className="w-8 h-6 bg-gray-700 rounded cursor-pointer"
            title="Background Color"
          />
          <div className="w-px bg-gray-600"></div>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              applyStyle('removeFormat');
            }}
            className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-xs"
            title="Clear Formatting"
          >
            ✕
          </button>
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleSelect}
        onKeyUp={handleSelect}
        onBlur={handleBlurEditor}
        onMouseDown={(e) => {
          // Prevent event from bubbling to parent handlers when editing
          e.stopPropagation();
        }}
        onClick={(e) => {
          // Prevent event from bubbling to parent handlers when editing
          e.stopPropagation();
        }}
        className={className}
        style={{
          ...style,
          outline: 'none',
          minHeight: '20px'
        }}
        suppressContentEditableWarning
      />
    </div>
  );
}
