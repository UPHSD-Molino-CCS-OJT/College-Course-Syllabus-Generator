/**
 * CanvasPreview - Renders elements in their absolute positions
 * Used for preview/output rendering (non-editable)
 */
export default function CanvasPreview({ elements, width = 800, height = 400, className = '' }) {
  const getTextStyle = (styles = {}) => {
    const fontSizeMap = {
      small: '12px',
      medium: '16px',
      large: '20px',
      xlarge: '24px',
    };

    return {
      fontSize: fontSizeMap[styles.fontSize] || '16px',
      fontWeight: styles.fontWeight || 'normal',
      color: styles.color || '#000000',
      textAlign: styles.textAlign || 'center',
      lineHeight: '1.5',
    };
  };

  const getImageStyle = (styles = {}) => {
    return {
      objectFit: styles.objectFit || 'contain',
      width: '100%',
      height: '100%',
    };
  };

  if (!elements || elements.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        overflow: 'hidden',
      }}
      className={`bg-white ${className}`}
    >
      {/* Render all elements sorted by z-index */}
      {[...elements]
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((element) => (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: `${element.position.x}px`,
              top: `${element.position.y}px`,
              width: `${element.size.width}px`,
              height: `${element.size.height}px`,
              zIndex: element.zIndex,
            }}
          >
            {element.type === 'text' ? (
              <div
                style={getTextStyle(element.styles)}
                className="w-full h-full flex items-center justify-center p-2 overflow-hidden"
              >
                {element.content || ''}
              </div>
            ) : (
              <img
                src={element.content || 'https://via.placeholder.com/100'}
                alt="Element"
                style={getImageStyle(element.styles)}
              />
            )}
          </div>
        ))}
    </div>
  );
}
