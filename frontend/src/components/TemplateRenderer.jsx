import { useMemo, useState, useEffect } from 'react';
import { renderCanvasDocument } from '../utils/templateRenderer';
import { graduateAttributeAPI, missionKeywordAPI, peoAPI, ploAPI, cloAPI, lloAPI } from '../services/api';

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

/** Compute the set of cell positions hidden by colspan/rowspan ancestors */
function computeCoveredCells(data) {
  const covered = new Set();
  data.forEach((row, rIdx) => {
    row.forEach((cell, cIdx) => {
      const cs = cell.colspan || 1;
      const rs = cell.rowspan || 1;
      if (cs > 1 || rs > 1) {
        for (let dr = 0; dr < rs; dr++) {
          for (let dc = 0; dc < cs; dc++) {
            if (dr === 0 && dc === 0) continue;
            covered.add(`${rIdx + dr}-${cIdx + dc}`);
          }
        }
      }
    });
  });
  return covered;
}

/**
 * Render a template with syllabus data for print/export
 */
export default function TemplateRenderer({ template, syllabus }) {
  // Auxiliary data for relationship-matrix placeholder resolution
  const [auxData, setAuxData] = useState({ gas: [], mks: [], peos: [], plos: [], clos: [], llos: [] });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      graduateAttributeAPI.getAll({ limit: 200 }),
      missionKeywordAPI.getAll({ limit: 100 }),
      peoAPI.getAll({ limit: 200 }),
      ploAPI.getAll({ limit: 200 }),
      cloAPI.getAll({ limit: 200 }),
      lloAPI.getAll({ limit: 500 }),
    ]).then(([gaRes, mkRes, peoRes, ploRes, cloRes, lloRes]) => {
      if (cancelled) return;
      setAuxData({
        gas:  gaRes.data?.graduateAttributes || [],
        mks:  mkRes.data?.missionKeywords    || [],
        peos: peoRes.data?.peos              || [],
        plos: ploRes.data?.plos              || [],
        clos: cloRes.data?.clos              || [],
        llos: lloRes.data?.llos              || [],
      });
    }).catch(() => {}); // silently skip if offline / no data
    return () => { cancelled = true; };
  }, []);

  // Render template with actual syllabus data - automatically updates when syllabus or auxData changes
  const renderedDocument = useMemo(() => {
    if (!template?.canvasDocument) return null;
    return renderCanvasDocument(template.canvasDocument, syllabus, auxData);
  }, [template?.canvasDocument, syllabus, auxData]);

  if (!template || !template.canvasDocument) {
    return null;
  }

  const pageSize = PAGE_SIZES[template.pageSize] || PAGE_SIZES.longBond;
  const dimensions = pageSize[template.orientation] || pageSize.landscape;

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
        <div key={element.id} style={baseStyle}>
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
      const coveredCells = computeCoveredCells(element.data);
      const bw = element.borderWidth || 1;
      const bs = element.borderStyle || 'solid';
      const bc = element.borderColor || '#000000';

      // Derive per-column widths from the first row that has no spanning cells
      // (i.e. all cells have colspan === 1). For matrices the data rows satisfy this.
      const colWidths = (() => {
        for (const row of element.data) {
          if (row.every(cell => !cell.colspan || cell.colspan === 1)) {
            return row.map(cell => cell.width || element.cellWidth || 150);
          }
        }
        // fallback: use last row
        const last = element.data[element.data.length - 1];
        return last.map(cell => cell.width || element.cellWidth || 150);
      })();
      const totalTableWidth = colWidths.reduce((s, w) => s + w, 0);

      return (
        <div key={element.id} style={baseStyle}>
          <table
            style={{
              borderCollapse: 'collapse',
              borderSpacing: '0',
              tableLayout: 'fixed',
              width: `${totalTableWidth}px`,
            }}
          >
            <colgroup>
              {colWidths.map((w, i) => (
                <col key={i} style={{ width: `${w}px` }} />
              ))}
            </colgroup>
            <tbody>
              {element.data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.isArray(row) && row.map((cell, colIndex) => {
                    if (coveredCells.has(`${rowIndex}-${colIndex}`)) return null;

                    // Width: sum the colgroup widths for the spanned columns so
                    // colspan cells are never clipped by a single-column maxWidth.
                    const cs = cell.colspan || 1;
                    const cellWidth = colWidths.slice(colIndex, colIndex + cs).reduce((s, w) => s + w, 0) || element.cellWidth || 150;
                    const cellHeight = cell.height || element.cellHeight || 40;

                    const showBorderTop    = cell.showBorderTop    !== undefined ? cell.showBorderTop    : element.showBorderTop    !== false;
                    const showBorderRight  = cell.showBorderRight  !== undefined ? cell.showBorderRight  : element.showBorderRight  !== false;
                    const showBorderBottom = cell.showBorderBottom !== undefined ? cell.showBorderBottom : element.showBorderBottom !== false;
                    const showBorderLeft   = cell.showBorderLeft   !== undefined ? cell.showBorderLeft   : element.showBorderLeft   !== false;

                    return (
                      <td
                        key={colIndex}
                        colSpan={cell.colspan || 1}
                        rowSpan={cell.rowspan || 1}
                        style={{
                          width: `${cellWidth}px`,
                          maxWidth: `${cellWidth}px`,
                          height: `${cellHeight}px`,
                          maxHeight: `${cellHeight}px`,
                          overflow: 'hidden',
                          borderTop:    showBorderTop    ? `${bw}px ${bs} ${bc}` : 'none',
                          borderRight:  showBorderRight  ? `${bw}px ${bs} ${bc}` : 'none',
                          borderBottom: showBorderBottom ? `${bw}px ${bs} ${bc}` : 'none',
                          borderLeft:   showBorderLeft   ? `${bw}px ${bs} ${bc}` : 'none',
                          backgroundColor: cell.bg || 'transparent',
                          fontSize: `${cell.fontSize || element.fontSize || 12}px`,
                          fontFamily: cell.fontFamily || element.fontFamily || 'Arial',
                          fontWeight: cell.fontWeight || 'normal',
                          color: cell.color || '#000000',
                          textAlign: cell.align || 'left',
                          verticalAlign: cell.verticalAlign || 'top',
                          padding: '0',
                          margin: '0',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                        }}
                      >
                        <div
                          className="table-cell-content"
                          style={{ margin: '0', padding: '0' }}
                          dangerouslySetInnerHTML={{ __html: cell.content || '' }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              overflow: 'hidden',
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
