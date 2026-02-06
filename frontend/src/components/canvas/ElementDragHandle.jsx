export default function ElementDragHandle({ onMouseDown }) {
  return (
    <div
      className="absolute -top-6 -left-6 w-6 h-6 bg-blue-500 rounded-full cursor-move flex items-center justify-center shadow-lg hover:bg-blue-600 z-10"
      onMouseDown={onMouseDown}
      title="Drag to move"
    >
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    </div>
  );
}
