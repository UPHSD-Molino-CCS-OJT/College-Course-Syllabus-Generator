import { useMemo } from 'react';
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
  
  // Render template with actual syllabus data - automatically updates when syllabus changes
  const renderedDocument = useMemo(() => {
    return renderCanvasDocument(template.canvasDocument, syllabus);
  }, [template.canvasDocument, syllabus]);

  const renderElement = (element) => {
    const baseStyle = {
      position: 'absolute',
      left: `${element.x}px`,
      top: `${element.y}px`,
    };

    if (element.type === 'text') {
      let textDecoration = '';
      if (element.underline && element.strikethrough) {
        textDecoration = 'underline line-through';
      } else if (element.underline) {
        textDecoration = 'underline';
      } else if (element.strikethrough) {
        textDecoration = 'line-through';
      } else {
        textDecoration = 'none';
      }

      const textStyle = {
        fontSize: `${element.fontSize}px`,
        fontFamily: element.fontFamily,
        fontWeight: element.fontWeight,
        color: element.color,
        width: element.fullWidth ? `${dimensions.width - element.x}px` : (element.width ? `${element.width}px` : '200px'),
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        fontStyle: element.italic ? 'italic' : 'normal',
        textDecoration: textDecoration,
        textTransform: element.textTransform || 'none',
        letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
        lineHeight: element.lineHeight || 1.5,
        textAlign: element.align || 'left',
      };

      const containerStyle = {
        ...baseStyle,
        display: 'flex',
        width: element.fullWidth ? `${dimensions.width - element.x}px` : (element.width ? `${element.width}px` : '200px'),
        flexDirection: 'column',
        justifyContent: element.verticalAlign === 'middle' ? 'center' : element.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
      };

      if (element.bold) {
        textStyle.fontWeight = 'bold';
      }

      return (
        <div key={element.id} style={containerStyle}>
          <div 
            style={textStyle}
            dangerouslySetInnerHTML={{ __html: element.content || '' }}
          />
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
            borderSpacing: '0',
          }}
        >
          <tbody>
            {element.data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Array.isArray(row) && row.map((cell, colIndex) => {
                  // Smart border rendering to prevent double borders in PDFs
                  // Only render borders that won't be duplicated by adjacent cells
                  const isFirstRow = rowIndex === 0;
                  const isLastRow = rowIndex === element.data.length - 1;
                  const isFirstCol = colIndex === 0;
                  const isLastCol = colIndex === row.length - 1;

                  // Determine which borders to render based on cell settings
                  const showTop = (cell.showBorderTop !== undefined ? cell.showBorderTop : element.showBorderTop !== false) && isFirstRow;
                  const showBottom = (cell.showBorderBottom !== undefined ? cell.showBorderBottom : element.showBorderBottom !== false);
                  const showLeft = (cell.showBorderLeft !== undefined ? cell.showBorderLeft : element.showBorderLeft !== false) && isFirstCol;
                  const showRight = (cell.showBorderRight !== undefined ? cell.showBorderRight : element.showBorderRight !== false);

                  // For internal borders, check if the cell wants it
                  const showTopInternal = !isFirstRow && (cell.showBorderTop !== undefined ? cell.showBorderTop : element.showBorderTop !== false);

                  return (
                    <td
                      key={colIndex}
                      style={{
                        width: cell.width ? `${cell.width}px` : (element.cellWidth ? `${element.cellWidth}px` : 'auto'),
                        height: cell.height ? `${cell.height}px` : (element.cellHeight ? `${element.cellHeight}px` : 'auto'),
                        borderTop: (showTop || showTopInternal) ? `${element.borderWidth || 1}px ${element.borderStyle || 'solid'} ${element.borderColor || '#000'}` : 'none',
                        borderRight: showRight ? `${element.borderWidth || 1}px ${element.borderStyle || 'solid'} ${element.borderColor || '#000'}` : 'none',
                        borderBottom: showBottom ? `${element.borderWidth || 1}px ${element.borderStyle || 'solid'} ${element.borderColor || '#000'}` : 'none',
                        borderLeft: showLeft ? `${element.borderWidth || 1}px ${element.borderStyle || 'solid'} ${element.borderColor || '#000'}` : 'none',
                        padding: '8px',
                        backgroundColor: cell.bg || '#fff',
                        fontSize: `${cell.fontSize || 12}px`,
                        fontFamily: cell.fontFamily || 'Arial',
                        fontWeight: cell.fontWeight || 'normal',
                        color: cell.color || '#000',
                        textAlign: cell.align || 'left',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        verticalAlign: cell.verticalAlign || 'top',
                      }}
                      dangerouslySetInnerHTML={{ __html: cell.content || '' }}
                    >
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return null;
  };

  const headerHeight = renderedDocument.header?.height || 120;
  const footerHeight = renderedDocument.footer?.height || 120;
  const contentHeight = dimensions.height - headerHeight - footerHeight;

  // Handle both old (single content) and new (pages array) structure
  const pages = renderedDocument.pages || [{ elements: renderedDocument.content?.elements || [] }];

  return (
    <div className="flex flex-col gap-4">
      {pages.map((page, pageIndex) => (
        <div
          key={pageIndex}
          className="mx-auto bg-white rounded-lg shadow-lg"
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            position: 'relative',
          }}
        >
          {/* Header */}
          <div
            style={{
              position: 'relative',
              height: `${headerHeight}px`,
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
            {page.elements?.map(renderElement)}
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'relative',
              height: `${footerHeight}px`,
              overflow: 'visible',
            }}
          >
            {renderedDocument.footer?.elements?.map(renderElement)}
          </div>
        </div>
      ))}
    </div>
  );
}
