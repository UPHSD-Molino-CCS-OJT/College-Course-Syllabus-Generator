import ElementDragHandle from './ElementDragHandle';

export default function ImageElement({
  element,
  zone,
  isSelected,
  isDragging,
  onSelect,
  onMouseDown
}) {
  return (
    <div
      key={element.id}
      className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging) {
          onSelect(element);
        }
      }}
    >
      {isSelected && <ElementDragHandle onMouseDown={(e) => onMouseDown(e, element, zone)} />}
      {element.src ? (
        <img
          src={element.src}
          alt={element.alt || 'Image'}
          className="w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 pointer-events-none">
          No Image
        </div>
      )}
    </div>
  );
}
