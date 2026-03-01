import { useState, useEffect, useRef } from 'react';
import ElementDragHandle from './ElementDragHandle';
import RichTextEditor from '../RichTextEditor';

export default function TableElement({
  element,
  zone,
  isSelected,
  onSelect,
  onUpdate,
  onMouseDown,
  onCellResizeStart
}) {
  const [editingCell, setEditingCell] = useState(null);
  const [anchorCell, setAnchorCell] = useState(null);     // first corner of selection
  const [selectionEnd, setSelectionEnd] = useState(null); // second corner of selection
  const [hoveredCell, setHoveredCell] = useState(null);
  const copiedCellRef = useRef(null);  // useRef so paste handler always sees latest value
  const [copiedCellPos, setCopiedCellPos] = useState(null);

  // Derive the rectangular set of selected cells from anchor + end
  const getSelectedRange = () => {
    if (!anchorCell || !selectionEnd) return new Set();
    const minR = Math.min(anchorCell.rowIndex, selectionEnd.rowIndex);
    const maxR = Math.max(anchorCell.rowIndex, selectionEnd.rowIndex);
    const minC = Math.min(anchorCell.colIndex, selectionEnd.colIndex);
    const maxC = Math.max(anchorCell.colIndex, selectionEnd.colIndex);
    const set = new Set();
    for (let r = minR; r <= maxR; r++)
      for (let c = minC; c <= maxC; c++)
        set.add(`${r}-${c}`);
    return set;
  };
  const selectedRange = getSelectedRange();
  const hasMultiSelection = selectedRange.size > 1;

  // Clear cell focus whenever this table loses selection
  useEffect(() => {
    if (!isSelected) {
      setEditingCell(null);
      setAnchorCell(null);
      setSelectionEnd(null);
      setHoveredCell(null);
    }
  }, [isSelected]);

  // Keyboard copy/paste when cells are selected but not in edit mode
  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (e) => {
      // Escape: exit edit mode → then clear cell selection (two-step)
      if (e.key === 'Escape') {
        if (editingCell) {
          e.preventDefault();
          setEditingCell(null); // exit edit, keep cell selected
          return;
        }
        if (anchorCell) {
          e.preventDefault();
          setAnchorCell(null); // clear cell selection, table stays selected
          setSelectionEnd(null);
          return;
        }
      }

      if (editingCell) return;
      if (!anchorCell) return;

      const numRows = element.data.length;
      const numCols = element.data[0]?.length || 0;

      // Arrow key navigation (Shift extends range)
      const arrowDeltas = {
        ArrowUp:    { dr: -1, dc: 0 },
        ArrowDown:  { dr:  1, dc: 0 },
        ArrowLeft:  { dr:  0, dc: -1 },
        ArrowRight: { dr:  0, dc:  1 },
      };
      if (arrowDeltas[e.key]) {
        e.preventDefault();
        const { dr, dc } = arrowDeltas[e.key];
        const base = e.shiftKey ? (selectionEnd || anchorCell) : anchorCell;
        let nr = Math.max(0, Math.min(numRows - 1, base.rowIndex + dr));
        let nc = Math.max(0, Math.min(numCols - 1, base.colIndex + dc));
        // Skip covered cells
        while (coveredCells.has(`${nr}-${nc}`) && (nr > 0 || nc > 0)) {
          nr = Math.max(0, Math.min(numRows - 1, nr + dr));
          nc = Math.max(0, Math.min(numCols - 1, nc + dc));
        }
        if (e.shiftKey) {
          setSelectionEnd({ rowIndex: nr, colIndex: nc });
        } else {
          setAnchorCell({ rowIndex: nr, colIndex: nc });
          setSelectionEnd({ rowIndex: nr, colIndex: nc });
        }
        return;
      }

      // Tab: move to next cell (Shift+Tab: previous), wrap to next/prev row
      if (e.key === 'Tab') {
        e.preventDefault();
        const flat = [];
        for (let r = 0; r < numRows; r++)
          for (let c = 0; c < numCols; c++)
            if (!coveredCells.has(`${r}-${c}`)) flat.push({ r, c });
        const cur = flat.findIndex(p => p.r === anchorCell.rowIndex && p.c === anchorCell.colIndex);
        const next = e.shiftKey
          ? flat[(cur - 1 + flat.length) % flat.length]
          : flat[(cur + 1) % flat.length];
        if (next) {
          setAnchorCell({ rowIndex: next.r, colIndex: next.c });
          setSelectionEnd({ rowIndex: next.r, colIndex: next.c });
        }
        return;
      }

      // Enter: enter edit mode on anchor cell
      if (e.key === 'Enter') {
        e.preventDefault();
        setEditingCell({ ...anchorCell });
        return;
      }

      const isCopy = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c';
      const isPaste = (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'v';
      const isPastePlain = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'v';
      const isDelete = e.key === 'Backspace' || e.key === 'Delete';

      if (isDelete) {
        e.preventDefault();
        const range = getSelectedRange();
        const newData = element.data.map((row, rIdx) =>
          row.map((cell, cIdx) =>
            range.has(`${rIdx}-${cIdx}`) ? { ...cell, content: '' } : cell
          )
        );
        onUpdate(zone, element.id, { data: newData });
        return;
      }

      if (isCopy) {
        e.preventDefault();
        const cell = element.data[anchorCell.rowIndex]?.[anchorCell.colIndex];
        if (cell) {
          copiedCellRef.current = { ...cell };
          setCopiedCellPos({ rowIndex: anchorCell.rowIndex, colIndex: anchorCell.colIndex });
          const plainText = cell.content?.replace(/<[^>]+>/g, '') || '';
          navigator.clipboard?.writeText(plainText).catch(() => {});
        }
      }

      // Ctrl+V — paste with full formatting from copied cell
      if (isPaste && copiedCellRef.current) {
        e.preventDefault();
        const range = getSelectedRange();
        const newData = element.data.map((row, rIdx) =>
          row.map((cell, cIdx) =>
            range.has(`${rIdx}-${cIdx}`)
              ? {
                  ...cell,
                  content: copiedCellRef.current.content,
                  fontSize: copiedCellRef.current.fontSize,
                  fontFamily: copiedCellRef.current.fontFamily,
                  fontWeight: copiedCellRef.current.fontWeight,
                  color: copiedCellRef.current.color,
                  align: copiedCellRef.current.align,
                  verticalAlign: copiedCellRef.current.verticalAlign,
                  bg: copiedCellRef.current.bg,
                }
              : cell
          )
        );
        onUpdate(zone, element.id, { data: newData });
      }

      // Ctrl+Shift+V — paste content only, keep each target cell's existing styles
      if (isPastePlain && copiedCellRef.current) {
        e.preventDefault();
        const range = getSelectedRange();
        // Strip all HTML tags so inline formatting from the source is removed
        const plainContent = copiedCellRef.current.content?.replace(/<[^>]+>/g, '') || '';
        const newData = element.data.map((row, rIdx) =>
          row.map((cell, cIdx) =>
            range.has(`${rIdx}-${cIdx}`)
              ? { ...cell, content: plainContent }
              : cell
          )
        );
        onUpdate(zone, element.id, { data: newData });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, editingCell, anchorCell, selectionEnd, element, zone, onUpdate]);

  const handleCellClick = (e, rowIndex, colIndex) => {
    e.stopPropagation();
    onSelect(element);

    if (editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex) return;

    if (e.shiftKey && anchorCell) {
      // Extend selection range — do NOT enter edit mode
      setSelectionEnd({ rowIndex, colIndex });
      setEditingCell(null);
      return;
    }

    const isAlreadyAnchor =
      anchorCell?.rowIndex === rowIndex && anchorCell?.colIndex === colIndex && !hasMultiSelection;

    if (isAlreadyAnchor) {
      setEditingCell({ rowIndex, colIndex });
    } else {
      setAnchorCell({ rowIndex, colIndex });
      setSelectionEnd({ rowIndex, colIndex });
      setEditingCell(null);
    }
  };

  const handleCellChange = (newContent, rowIndex, colIndex) => {
    const newData = element.data.map((row, rIdx) =>
      row.map((cell, cIdx) =>
        rIdx === rowIndex && cIdx === colIndex
          ? { ...cell, content: newContent }
          : cell
      )
    );
    onUpdate(zone, element.id, { data: newData });
  };

  // Compute which cells are hidden because they're covered by a spanning cell
  const computeCoveredCells = (data) => {
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
  };

  const coveredCells = computeCoveredCells(element.data);

  return (
    <div
      key={element.id}
      className={`absolute ${isSelected && !anchorCell && !editingCell ? 'ring-2 ring-blue-500' : ''}`}
      data-cell-selected={!!(anchorCell || editingCell)}
      style={{
        left: element.x,
        top: element.y
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element);
        // Click on table background (not a cell) — clear cell selection
        if (e.target === e.currentTarget) {
          setAnchorCell(null);
          setSelectionEnd(null);
          setEditingCell(null);
        }
      }}
    >
      {isSelected && <ElementDragHandle onMouseDown={(e) => onMouseDown(e, element, zone)} />}
      <table style={{ borderCollapse: 'collapse', borderSpacing: '0', userSelect: 'none', tableLayout: 'fixed' }}>
        <tbody>
          {element.data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                // Skip cells covered by a spanning ancestor
                if (coveredCells.has(`${rowIndex}-${colIndex}`)) return null;

                const isCellEditing = editingCell?.rowIndex === rowIndex &&
                                     editingCell?.colIndex === colIndex;
                const isCellInRange = !isCellEditing && selectedRange.has(`${rowIndex}-${colIndex}`);
                const isAnchor = !isCellEditing && anchorCell?.rowIndex === rowIndex && anchorCell?.colIndex === colIndex;
                const isCellCopied = !isCellEditing &&
                                     copiedCellPos?.rowIndex === rowIndex &&
                                     copiedCellPos?.colIndex === colIndex;
                const isHovered = isSelected && !isCellInRange && !isCellEditing &&
                                 hoveredCell?.rowIndex === rowIndex &&
                                 hoveredCell?.colIndex === colIndex;

                const plainContent = String(cell.content || '').replace(/<[^>]+>/g, '').trim();
                const isPlaceholder = /^\{\{.*\}\}$/.test(plainContent);

                return (
                  <td
                    key={colIndex}
                    colSpan={cell.colspan || 1}
                    rowSpan={cell.rowspan || 1}
                    className={`relative group ${
                      isCellEditing  ? 'ring-2 ring-blue-500 ring-inset' :
                      isAnchor       ? 'ring-2 ring-blue-400 ring-inset' :
                      isCellInRange  ? 'ring-1 ring-blue-300 ring-inset' :
                      isHovered      ? 'ring-1 ring-blue-200 ring-inset' : ''
                    }`}
                    style={{
                      outline: isCellCopied ? '2px dashed #f59e0b' : undefined,
                      outlineOffset: '-2px',
                      width: cell.width || element.cellWidth,
                      maxWidth: cell.width || element.cellWidth,
                      height: cell.height || element.cellHeight,
                      maxHeight: cell.height || element.cellHeight,
                      borderTop: (cell.showBorderTop !== undefined ? cell.showBorderTop : element.showBorderTop !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      borderRight: (cell.showBorderRight !== undefined ? cell.showBorderRight : element.showBorderRight !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      borderBottom: (cell.showBorderBottom !== undefined ? cell.showBorderBottom : element.showBorderBottom !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      borderLeft: (cell.showBorderLeft !== undefined ? cell.showBorderLeft : element.showBorderLeft !== false) ? `${element.borderWidth}px ${element.borderStyle || 'solid'} ${element.borderColor}` : 'none',
                      backgroundColor: isCellInRange && !isCellEditing ? '#dbeafe' : isHovered ? '#eff6ff' : cell.bg,
                      fontSize: cell.fontSize,
                      fontFamily: cell.fontFamily,
                      fontWeight: cell.fontWeight,
                      color: cell.color,
                      textAlign: cell.align,
                      verticalAlign: cell.verticalAlign || 'top',
                      padding: '0',
                      margin: '0',
                      whiteSpace: isPlaceholder ? 'nowrap' : 'pre-wrap',
                      wordWrap: isPlaceholder ? undefined : 'break-word',
                      overflow: 'hidden',
                      textOverflow: isPlaceholder ? 'ellipsis' : undefined,
                      position: 'relative',
                      userSelect: isCellEditing ? 'text' : 'none',
                      cursor: isSelected ? 'pointer' : 'default'
                    }}
                    onMouseEnter={() => isSelected && setHoveredCell({ rowIndex, colIndex })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onMouseDown={(e) => {
                      if (e.target.classList.contains('resize-handle') || isCellEditing) {
                        return;
                      }
                      // Only allow table dragging if clicking outside cell content area when selected
                      if (!isSelected) {
                        onMouseDown(e, element, zone);
                      } else {
                        // When table is selected, prevent drag to allow cell selection
                        e.stopPropagation();
                      }
                    }}
                    onClick={(e) => handleCellClick(e, rowIndex, colIndex)}
                  >
                    {isCellEditing ? (
                      <RichTextEditor
                        content={cell.content}
                        onUpdate={(newContent) => handleCellChange(newContent, rowIndex, colIndex)}
                        wrapperStyle={{ width: '100%', height: '100%', margin: '0', padding: '0' }}
                        style={{
                          fontSize: cell.fontSize,
                          fontFamily: cell.fontFamily,
                          fontWeight: cell.fontWeight,
                          color: cell.color,
                          textAlign: cell.align,
                          width: '100%',
                          height: '100%',
                          margin: '0',
                          padding: '0'
                        }}
                        contentAttributes={{ 'data-cell-editor': 'true' }}
                        className="bg-white border-2 border-blue-500"
                        portalToolbar={true}
                        autoFocus={true}
                      />
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{ __html: cell.content || '' }}
                        className="table-cell-content"
                        style={{
                          pointerEvents: 'none',
                          margin: '0',
                          padding: '0',
                          ...(isPlaceholder ? {
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            width: '100%',
                          } : {}),
                        }}
                      />
                    )}
                    {isAnchor && !isCellEditing && (
                      <>
                        {/* Right edge handle for column width */}
                        <div
                          className="resize-handle absolute top-0 right-0 w-2 h-full bg-blue-400/60 hover:bg-blue-500 cursor-ew-resize transition-all select-none"
                          style={{
                            transform: 'translateX(1px)',
                            zIndex: 10,
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onCellResizeStart(e, element, zone, rowIndex, colIndex, 'width');
                          }}
                          title="Resize column width"
                        />
                        {/* Bottom edge handle for row height */}
                        <div
                          className="resize-handle absolute bottom-0 left-0 w-full h-2 bg-blue-400/60 hover:bg-blue-500 cursor-ns-resize transition-all select-none"
                          style={{
                            transform: 'translateY(1px)',
                            zIndex: 10,
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onCellResizeStart(e, element, zone, rowIndex, colIndex, 'height');
                          }}
                          title="Resize row height"
                        />
                        {/* Corner handle for both dimensions */}
                        <div
                          className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 hover:bg-blue-600 cursor-nwse-resize transition-all shadow-md select-none"
                          style={{
                            transform: 'translate(2px, 2px)',
                            borderRadius: '0 0 4px 0',
                            zIndex: 11,
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onCellResizeStart(e, element, zone, rowIndex, colIndex, 'both');
                          }}
                          title="Resize both width and height"
                        />
                      </>
                    )}
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
