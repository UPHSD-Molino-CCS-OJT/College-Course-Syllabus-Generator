import ElementDragHandle from './ElementDragHandle';

export default function LineElement({
  element,
  zone,
  isSelected,
  onSelect,
  onMouseDown
}) {
  return (
    <div
      key={element.id}
      className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: element.x,
        top: element.y
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element);
      }}
    >
      {isSelected && <ElementDragHandle onMouseDown={(e) => onMouseDown(e, element, zone)} />}
      <svg width={element.width || 300} height={Math.max(element.strokeWidth || 2, 10)}>
        <line
          x1="0"
          y1={(element.strokeWidth || 2) / 2}
          x2={element.width || 300}
          y2={(element.strokeWidth || 2) / 2}
          stroke={element.strokeColor || '#000000'}
          strokeWidth={element.strokeWidth || 2}
          strokeDasharray={
            element.strokeStyle === 'dashed' ? '5,5' :
            element.strokeStyle === 'dotted' ? '2,2' : 'none'
          }
        />
      </svg>
    </div>
  );
}
