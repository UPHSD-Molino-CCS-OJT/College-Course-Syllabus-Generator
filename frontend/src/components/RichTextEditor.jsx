import { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.bubble.css';

export default function RichTextEditor({ content, onUpdate, style, className }) {
  const quillRef = useRef(null);

  // Configure Quill modules
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ]
  };

  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'size', 'color', 'background'
  ];

  const handleChange = (value) => {
    onUpdate(value);
  };

  // Custom styling to merge with Quill
  const editorStyle = {
    ...style,
    minHeight: '20px',
    border: 'none',
    outline: 'none'
  };

  return (
    <div className={`rich-text-editor ${className || ''}`}>
      <ReactQuill
        ref={quillRef}
        theme="bubble"
        value={content || ''}
        onChange={handleChange}
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

