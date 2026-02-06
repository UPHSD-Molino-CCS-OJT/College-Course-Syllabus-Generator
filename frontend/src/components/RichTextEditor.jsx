import { useRef, useEffect, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'quill/dist/quill.bubble.css';

export default function RichTextEditor({ content, onUpdate, style, className }) {
  const quillRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  // Configure Quill modules with custom toolbar
  const modules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
      ],
      handlers: {}
    }
  };

  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'size', 'color', 'background'
  ];

  const handleChange = (value) => {
    onUpdate(value);
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    // Small delay to allow toolbar clicks
    setTimeout(() => {
      setIsEditing(false);
    }, 200);
  };

  // Custom styling to merge with Quill
  const editorStyle = {
    ...style,
    minHeight: '20px',
    border: 'none',
    outline: 'none'
  };

  // Add custom styles for active toolbar buttons and read-only cursor
  useEffect(() => {
    // Add CSS for active buttons if not already added
    const styleId = 'quill-active-button-styles';
    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement('style');
      styleSheet.id = styleId;
      styleSheet.textContent = `
        .ql-bubble .ql-toolbar button.ql-active,
        .ql-bubble .ql-toolbar .ql-picker-label.ql-active,
        .ql-bubble .ql-toolbar .ql-picker-item.ql-selected {
          background-color: #06b6d4 !important;
          color: white !important;
        }
        .ql-bubble .ql-toolbar button.ql-active .ql-stroke {
          stroke: white !important;
        }
        .ql-bubble .ql-toolbar button.ql-active .ql-fill {
          fill: white !important;
        }
        .rich-text-editor.read-only-mode .ql-editor {
          cursor: default !important;
        }
        .rich-text-editor.read-only-mode .ql-editor * {
          cursor: text !important;
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  // Toggle read-only mode based on editing state
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (!isEditing) {
        editor.enable(false);
        // Re-enable after a tick to allow selection but not editing
        setTimeout(() => {
          editor.enable(true);
        }, 0);
      }
    }
  }, [isEditing]);

  return (
    <div className={`rich-text-editor ${!isEditing ? 'read-only-mode' : ''} ${className || ''}`}>
      <ReactQuill
        ref={quillRef}
        theme="bubble"
        value={content || ''}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        modules={modules}
        formats={formats}
        style={editorStyle}
        placeholder="Type here..."
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

