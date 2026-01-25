import { renderCanvasDocument } from '../utils/templateRenderer';

// Page size configurations (in pixels, 96 DPI)
const PAGE_SIZES = {
  legal: {
    name: 'Legal',
    portrait: { width: 816, height: 1344 },
    landscape: { width: 1344, height: 816 }
  },
  longBond: {
    name: 'Long Bond',
    portrait: { width: 816, height: 1248 },
    landscape: { width: 1248, height: 816 }
  },
  letter: {
    name: 'Letter',
    portrait: { width: 816, height: 1056 },
    landscape: { width: 1056, height: 816 }
  },
  a4: {
    name: 'A4',
    portrait: { width: 794, height: 1123 },
    landscape: { width: 1123, height: 794 }
  }
};

/**
 * Render a template with syllabus data for print/export
 */
export default function TemplateRenderer({ template, syllabus }) {
  if (!template || !template.canvasDocument) {
    return null;
  }

  const pageSize = PAGE_SIZES[template.pageSize] || PAGE_SIZES.longBond;
  const dimensions = pageSize[template.orientation] || pageSize.landscape;
  
  // Render template with actual syllabus data
  const renderedDocument = renderCanvasDocument(template.canvasDocument, syllabus);

  const renderElement = (element) => {
    const baseStyle = {
      position: 'absolute',
      left: `${element.x}px`,
      top: `${element.y}px`,
    };

    if (element.type === 'text') {
      const textStyle = {
        fontSize: `${element.fontSize}px`,
        fontFamily: element.fontFamily,
        fontWeight: element.fontWeight,
        color: element.color,
        textAlign: element.align || 'left',
        width: `${element.width || 200}px`,
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        fontStyle: element.italic ? 'italic' : 'normal',
        textDecoration: element.underline ? 'underline' : 'none',
      };

      if (element.bold) {
        textStyle.fontWeight = 'bold';
      }

      return (
        <div
          key={element.id}
          style={{
            ...baseStyle,
            ...textStyle
          }}
        >
          {element.content}
        </div>
      );
    }

    if (element.type === 'image') {
      return (
        <div
          key={element.id}
          style={{
            ...baseStyle,
            width: `${element.width}px`,
            height: `${element.height}px`,
          }}
        >
          <img
            src={element.src}
            alt={element.alt || 'Image'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: element.maintainAspectRatio ? 'contain' : 'cover',
            }}
          />
        </div>
      );
    }

    if (element.type === 'line') {
      return (
        <div
          key={element.id}
          style={baseStyle}
        >
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

    if (element.type === 'table' && element.data && Array.isArray(element.data)) {
      return (
        <table
          key={element.id}
          style={{
            ...baseStyle,
            borderCollapse: 'collapse',
          }}
        >
          <tbody>
            {element.data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Array.isArray(row) && row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    style={{
                      width: element.cellWidth ? `${element.cellWidth}px` : 'auto',
                      height: element.cellHeight ? `${element.cellHeight}px` : 'auto',
                      border: `${element.borderWidth || 1}px solid ${element.borderColor || '#000'}`,
                      padding: '8px',
                      backgroundColor: cell.bg || '#fff',
                      fontSize: `${cell.fontSize || 12}px`,
                      fontFamily: cell.fontFamily || 'Arial',
                      fontWeight: cell.fontWeight || 'normal',
                      color: cell.color || '#000',
                      textAlign: cell.align || 'left',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      verticalAlign: 'top',
                    }}
                  >
                    {cell.content}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return null;
  };

  const headerHeight = renderedDocument.header?.height || 120;
  const footerHeight = renderedDocument.footer?.height || 80;
  const contentHeight = dimensions.height - headerHeight - footerHeight;

  return (
    <div
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        position: 'relative',
        backgroundColor: '#fff',
        margin: '0 auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'relative',
          height: `${headerHeight}px`,
          backgroundColor: renderedDocument.styles?.headerBg || '#f8f9fa',
          borderBottom: '1px solid #ddd',
          overflow: 'visible',
        }}
      >
        {renderedDocument.header?.elements?.map(renderElement)}
      </div>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          height: `${contentHeight}px`,
          overflow: 'auto',
        }}
      >
        {renderedDocument.content?.elements?.map(renderElement)}
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'relative',
          height: `${footerHeight}px`,
          backgroundColor: renderedDocument.styles?.footerBg || '#f8f9fa',
          borderTop: '1px solid #ddd',
          overflow: 'visible',
        }}
      >
        {renderedDocument.footer?.elements?.map(renderElement)}
      </div>
    </div>
  );
}
