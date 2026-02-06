/**
 * Snapping utility for canvas editor
 * Provides snapping functionality for element positioning relative to:
 * - Other elements (edges and centers)
 * - Page/zone boundaries (edges and center)
 */

const SNAP_THRESHOLD = 8; // pixels - distance at which snapping occurs

/**
 * Snap coordinates to grid
 */
export function snapToGrid(x, y, gridSize, snapThreshold = SNAP_THRESHOLD) {
  if (!gridSize || gridSize <= 0) {
    return { x, y, snappedToGrid: false };
  }

  const snappedX = Math.round(x / gridSize) * gridSize;
  const snappedY = Math.round(y / gridSize) * gridSize;

  const deltaX = Math.abs(x - snappedX);
  const deltaY = Math.abs(y - snappedY);

  // Only snap if within threshold
  const shouldSnapX = deltaX <= snapThreshold;
  const shouldSnapY = deltaY <= snapThreshold;

  return {
    x: shouldSnapX ? snappedX : x,
    y: shouldSnapY ? snappedY : y,
    snappedToGrid: shouldSnapX || shouldSnapY,
    guides: [
      ...(shouldSnapX ? [{ type: 'vertical', x: snappedX, label: `${snappedX}px` }] : []),
      ...(shouldSnapY ? [{ type: 'horizontal', y: snappedY, label: `${snappedY}px` }] : [])
    ]
  };
}

/**
 * Calculate element bounds
 */
export function getElementBounds(element) {
  let width, height;
  
  if (element.type === 'text') {
    width = element.width || 200;
    height = (element.fontSize || 14) + 10;
  } else if (element.type === 'image') {
    width = element.width || 100;
    height = element.height || 100;
  } else if (element.type === 'table') {
    // Calculate total table dimensions
    width = 0;
    height = 0;
    
    if (element.data && element.data.length > 0) {
      // Sum column widths from first row
      element.data[0].forEach((cell) => {
        width += cell.width || element.cellWidth || 150;
      });
      
      // Sum row heights
      element.data.forEach((row) => {
        const rowHeight = row.reduce((max, cell) => 
          Math.max(max, cell.height || element.cellHeight || 40), 0
        );
        height += rowHeight;
      });
    } else {
      width = (element.cols || 3) * (element.cellWidth || 150);
      height = (element.rows || 3) * (element.cellHeight || 40);
    }
  } else if (element.type === 'line') {
    width = element.width || 100;
    height = element.strokeWidth || 2;
  } else {
    width = element.width || 100;
    height = element.height || 50;
  }
  
  return {
    left: element.x,
    right: element.x + width,
    top: element.y,
    bottom: element.y + height,
    centerX: element.x + width / 2,
    centerY: element.y + height / 2,
    width,
    height
  };
}

/**
 * Get snap points for a container/zone
 */
export function getContainerSnapPoints(containerWidth, containerHeight) {
  return {
    left: 0,
    right: containerWidth,
    centerX: containerWidth / 2,
    top: 0,
    bottom: containerHeight,
    centerY: containerHeight / 2
  };
}

/**
 * Find all elements in the current zone/page excluding the dragging element
 */
export function getOtherElements(allElements, draggingElementId) {
  return allElements.filter(el => el.id !== draggingElementId);
}

/**
 * Calculate snap position with cross-zone support and grid snapping
 * Uses absolute page coordinates for comparison
 */
export function calculateSnapCrossZone(
  draggedElement,
  newX,
  newY,
  zone,
  allElementsAbsolute,
  document,
  pageSize,
  threshold = SNAP_THRESHOLD,
  gridSettings = { enabled: false, size: 20 }
) {
  // Convert zone-relative coords to absolute
  const absolutePos = zoneToAbsoluteCoords(newX, newY, zone, document, pageSize);
  
  // Create element with absolute coordinates
  const draggedAbsolute = {
    ...draggedElement,
    x: absolutePos.x,
    y: absolutePos.y,
    absoluteX: absolutePos.x,
    absoluteY: absolutePos.y
  };
  
  // Filter out the dragged element
  const otherElements = allElementsAbsolute.filter(el => el.id !== draggedElement.id);
  
  let snappedX = absolutePos.x;
  let snappedY = absolutePos.y;
  const guides = [];
  
  // Get bounds for the dragged element
  const draggedBounds = getElementBoundsAbsolute(draggedAbsolute);
  
  // Container snap points (for current zone)
  const zoneDimensions = getZoneDimensions(document, pageSize, zone);
  const container = getContainerSnapPoints(zoneDimensions.width, zoneDimensions.height);
  
  // Arrays to hold potential snap positions
  const snapX = [];
  const snapY = [];
  
  // Check snapping to zone container edges and center
  const zoneAbsolutePos = zoneToAbsoluteCoords(0, 0, zone, document, pageSize);
  
  // Left edge to zone left
  if (Math.abs(draggedBounds.left - absolutePos.x) < threshold) {
    snapX.push({
      position: absolutePos.x,
      guide: { type: 'vertical', x: absolutePos.x, y: zoneAbsolutePos.y, label: 'Left Edge' }
    });
  }
  
  // Right edge to zone right
  if (Math.abs(draggedBounds.right - (absolutePos.x + zoneDimensions.width)) < threshold) {
    snapX.push({
      position: absolutePos.x + zoneDimensions.width - draggedBounds.width,
      guide: { type: 'vertical', x: absolutePos.x + zoneDimensions.width, y: zoneAbsolutePos.y, label: 'Right Edge' }
    });
  }
  
  // Center to zone center (horizontal)
  const zoneCenterX = absolutePos.x + zoneDimensions.width / 2;
  if (Math.abs(draggedBounds.centerX - zoneCenterX) < threshold) {
    snapX.push({
      position: zoneCenterX - draggedBounds.width / 2,
      guide: { type: 'vertical', x: zoneCenterX, y: zoneAbsolutePos.y, label: 'Center' }
    });
  }
  
  // Check snapping to other elements (across all zones)
  otherElements.forEach(otherElement => {
    const otherBounds = getElementBoundsAbsolute(otherElement);
    
    // Horizontal snapping (X-axis alignment)
    // Left to left
    if (Math.abs(draggedBounds.left - otherBounds.left) < threshold) {
      snapX.push({
        position: otherBounds.left,
        guide: { 
          type: 'vertical', 
          x: otherBounds.left,
          y: Math.min(draggedBounds.top, otherBounds.top),
          label: `Align Left${otherElement.zone !== zone ? ` (${otherElement.zone})` : ''}`,
          elementId: otherElement.id 
        }
      });
    }
    
    // Right to right
    if (Math.abs(draggedBounds.right - otherBounds.right) < threshold) {
      snapX.push({
        position: otherBounds.right - draggedBounds.width,
        guide: { 
          type: 'vertical', 
          x: otherBounds.right,
          y: Math.min(draggedBounds.top, otherBounds.top),
          label: `Align Right${otherElement.zone !== zone ? ` (${otherElement.zone})` : ''}`,
          elementId: otherElement.id 
        }
      });
    }
    
    // Left to right (adjacent)
    if (Math.abs(draggedBounds.left - otherBounds.right) < threshold) {
      snapX.push({
        position: otherBounds.right,
        guide: { 
          type: 'vertical', 
          x: otherBounds.right,
          y: Math.min(draggedBounds.top, otherBounds.top),
          label: `Adjacent${otherElement.zone !== zone ? ` (${otherElement.zone})` : ''}`,
          elementId: otherElement.id 
        }
      });
    }
    
    // Right to left (adjacent)
    if (Math.abs(draggedBounds.right - otherBounds.left) < threshold) {
      snapX.push({
        position: otherBounds.left - draggedBounds.width,
        guide: { 
          type: 'vertical', 
          x: otherBounds.left,
          y: Math.min(draggedBounds.top, otherBounds.top),
          label: `Adjacent${otherElement.zone !== zone ? ` (${otherElement.zone})` : ''}`,
          elementId: otherElement.id 
        }
      });
    }
    
    // Center to center (horizontal)
    if (Math.abs(draggedBounds.centerX - otherBounds.centerX) < threshold) {
      snapX.push({
        position: otherBounds.centerX - draggedBounds.width / 2,
        guide: { 
          type: 'vertical', 
          x: otherBounds.centerX,
          y: Math.min(draggedBounds.top, otherBounds.top),
          label: `Center${otherElement.zone !== zone ? ` (${otherElement.zone})` : ''}`,
          elementId: otherElement.id 
        }
      });
    }
    
    // Vertical snapping (Y-axis alignment)
    // Top to top
    if (Math.abs(draggedBounds.top - otherBounds.top) < threshold) {
      snapY.push({
        position: otherBounds.top,
        guide: { 
          type: 'horizontal', 
          y: otherBounds.top,
          x: Math.min(draggedBounds.left, otherBounds.left),
          label: `Align Top${otherElement.zone !== zone ? ` (${otherElement.zone})` : ''}`,
          elementId: otherElement.id 
        }
      });
    }
    
    // Bottom to bottom
    if (Math.abs(draggedBounds.bottom - otherBounds.bottom) < threshold) {
      snapY.push({
        position: otherBounds.bottom - draggedBounds.height,
        guide: { 
          type: 'horizontal', 
          y: otherBounds.bottom,
          x: Math.min(draggedBounds.left, otherBounds.left),
          label: `Align Bottom${otherElement.zone !== zone ? ` (${otherElement.zone})` : ''}`,
          elementId: otherElement.id 
        }
      });
    }
    
    // Top to bottom (adjacent)
    if (Math.abs(draggedBounds.top - otherBounds.bottom) < threshold) {
      snapY.push({
        position: otherBounds.bottom,
        guide: { 
          type: 'horizontal', 
          y: otherBounds.bottom,
          x: Math.min(draggedBounds.left, otherBounds.left),
          label: `Adjacent${otherElement.zone !== zone ? ` (${otherElement.zone})` : ''}`,
          elementId: otherElement.id 
        }
      });
    }
    
    // Bottom to top (adjacent)
    if (Math.abs(draggedBounds.bottom - otherBounds.top) < threshold) {
      snapY.push({
        position: otherBounds.top - draggedBounds.height,
        guide: { 
          type: 'horizontal', 
          y: otherBounds.top,
          x: Math.min(draggedBounds.left, otherBounds.left),
          label: `Adjacent${otherElement.zone !== zone ? ` (${otherElement.zone})` : ''}`,
          elementId: otherElement.id 
        }
      });
    }
    
    // Center to center (vertical)
    if (Math.abs(draggedBounds.centerY - otherBounds.centerY) < threshold) {
      snapY.push({
        position: otherBounds.centerY - draggedBounds.height / 2,
        guide: { 
          type: 'horizontal', 
          y: otherBounds.centerY,
          x: Math.min(draggedBounds.left, otherBounds.left),
          label: `Center${otherElement.zone !== zone ? ` (${otherElement.zone})` : ''}`,
          elementId: otherElement.id 
        }
      });
    }
  });
  
  // Apply snapping - use the closest snap point
  if (snapX.length > 0) {
    const closest = snapX.reduce((prev, curr) => 
      Math.abs(curr.position - absolutePos.x) < Math.abs(prev.position - absolutePos.x) ? curr : prev
    );
    snappedX = closest.position;
    guides.push(closest.guide);
  }
  
  if (snapY.length > 0) {
    const closest = snapY.reduce((prev, curr) => 
      Math.abs(curr.position - absolutePos.y) < Math.abs(prev.position - absolutePos.y) ? curr : prev
    );
    snappedY = closest.position;
    guides.push(closest.guide);
  }
  
  // Apply grid snapping first if enabled (has priority)
  let finalX = snappedX;
  let finalY = snappedY;
  let gridGuides = [];

  if (gridSettings.enabled && gridSettings.size > 0) {
    const gridSnap = snapToGrid(snappedX, snappedY, gridSettings.size, threshold);
    if (gridSnap.snappedToGrid) {
      finalX = gridSnap.x;
      finalY = gridSnap.y;
      gridGuides = gridSnap.guides || [];
    }
  }

  // Convert back to zone-relative coordinates
  const zoneRelative = absoluteToZoneCoords(finalX, finalY, zone, document, pageSize);
  
  return {
    x: zoneRelative.x,
    y: zoneRelative.y,
    guides: gridGuides.length > 0 ? gridGuides : guides
  };
}

/**
 * Calculate snap position and guides
 * Returns { x, y, guides } where guides is an array of snap guide lines
 */
export function calculateSnap(
  draggedElement,
  newX,
  newY,
  otherElements,
  containerWidth,
  containerHeight,
  threshold = SNAP_THRESHOLD
) {
  let snappedX = newX;
  let snappedY = newY;
  const guides = [];
  
  // Get bounds for the dragged element at the new position
  const draggedBounds = {
    ...getElementBounds({ ...draggedElement, x: newX, y: newY })
  };
  
  // Container snap points
  const container = getContainerSnapPoints(containerWidth, containerHeight);
  
  // Arrays to hold potential snap positions
  const snapX = [];
  const snapY = [];
  
  // Check snapping to container edges and center
  // Left edge to container left
  if (Math.abs(draggedBounds.left - container.left) < threshold) {
    snapX.push({
      position: container.left,
      guide: { type: 'vertical', x: container.left, label: 'Left Edge' }
    });
  }
  
  // Right edge to container right
  if (Math.abs(draggedBounds.right - container.right) < threshold) {
    snapX.push({
      position: container.right - draggedBounds.width,
      guide: { type: 'vertical', x: container.right, label: 'Right Edge' }
    });
  }
  
  // Center to container center (horizontal)
  if (Math.abs(draggedBounds.centerX - container.centerX) < threshold) {
    snapX.push({
      position: container.centerX - draggedBounds.width / 2,
      guide: { type: 'vertical', x: container.centerX, label: 'Center' }
    });
  }
  
  // Top edge to container top
  if (Math.abs(draggedBounds.top - container.top) < threshold) {
    snapY.push({
      position: container.top,
      guide: { type: 'horizontal', y: container.top, label: 'Top Edge' }
    });
  }
  
  // Bottom edge to container bottom
  if (Math.abs(draggedBounds.bottom - container.bottom) < threshold) {
    snapY.push({
      position: container.bottom - draggedBounds.height,
      guide: { type: 'horizontal', y: container.bottom, label: 'Bottom Edge' }
    });
  }
  
  // Center to container center (vertical)
  if (Math.abs(draggedBounds.centerY - container.centerY) < threshold) {
    snapY.push({
      position: container.centerY - draggedBounds.height / 2,
      guide: { type: 'horizontal', y: container.centerY, label: 'Center' }
    });
  }
  
  // Check snapping to other elements
  otherElements.forEach(otherElement => {
    const otherBounds = getElementBounds(otherElement);
    
    // Horizontal snapping (X-axis alignment)
    // Left to left
    if (Math.abs(draggedBounds.left - otherBounds.left) < threshold) {
      snapX.push({
        position: otherBounds.left,
        guide: { 
          type: 'vertical', 
          x: otherBounds.left, 
          label: 'Align Left',
          elementId: otherElement.id 
        }
      });
    }
    
    // Right to right
    if (Math.abs(draggedBounds.right - otherBounds.right) < threshold) {
      snapX.push({
        position: otherBounds.right - draggedBounds.width,
        guide: { 
          type: 'vertical', 
          x: otherBounds.right, 
          label: 'Align Right',
          elementId: otherElement.id 
        }
      });
    }
    
    // Left to right (adjacent)
    if (Math.abs(draggedBounds.left - otherBounds.right) < threshold) {
      snapX.push({
        position: otherBounds.right,
        guide: { 
          type: 'vertical', 
          x: otherBounds.right, 
          label: 'Edge Adjacent',
          elementId: otherElement.id 
        }
      });
    }
    
    // Right to left (adjacent)
    if (Math.abs(draggedBounds.right - otherBounds.left) < threshold) {
      snapX.push({
        position: otherBounds.left - draggedBounds.width,
        guide: { 
          type: 'vertical', 
          x: otherBounds.left, 
          label: 'Edge Adjacent',
          elementId: otherElement.id 
        }
      });
    }
    
    // Center to center (horizontal)
    if (Math.abs(draggedBounds.centerX - otherBounds.centerX) < threshold) {
      snapX.push({
        position: otherBounds.centerX - draggedBounds.width / 2,
        guide: { 
          type: 'vertical', 
          x: otherBounds.centerX, 
          label: 'Center Align',
          elementId: otherElement.id 
        }
      });
    }
    
    // Vertical snapping (Y-axis alignment)
    // Top to top
    if (Math.abs(draggedBounds.top - otherBounds.top) < threshold) {
      snapY.push({
        position: otherBounds.top,
        guide: { 
          type: 'horizontal', 
          y: otherBounds.top, 
          label: 'Align Top',
          elementId: otherElement.id 
        }
      });
    }
    
    // Bottom to bottom
    if (Math.abs(draggedBounds.bottom - otherBounds.bottom) < threshold) {
      snapY.push({
        position: otherBounds.bottom - draggedBounds.height,
        guide: { 
          type: 'horizontal', 
          y: otherBounds.bottom, 
          label: 'Align Bottom',
          elementId: otherElement.id 
        }
      });
    }
    
    // Top to bottom (adjacent)
    if (Math.abs(draggedBounds.top - otherBounds.bottom) < threshold) {
      snapY.push({
        position: otherBounds.bottom,
        guide: { 
          type: 'horizontal', 
          y: otherBounds.bottom, 
          label: 'Edge Adjacent',
          elementId: otherElement.id 
        }
      });
    }
    
    // Bottom to top (adjacent)
    if (Math.abs(draggedBounds.bottom - otherBounds.top) < threshold) {
      snapY.push({
        position: otherBounds.top - draggedBounds.height,
        guide: { 
          type: 'horizontal', 
          y: otherBounds.top, 
          label: 'Edge Adjacent',
          elementId: otherElement.id 
        }
      });
    }
    
    // Center to center (vertical)
    if (Math.abs(draggedBounds.centerY - otherBounds.centerY) < threshold) {
      snapY.push({
        position: otherBounds.centerY - draggedBounds.height / 2,
        guide: { 
          type: 'horizontal', 
          y: otherBounds.centerY, 
          label: 'Center Align',
          elementId: otherElement.id 
        }
      });
    }
  });
  
  // Apply snapping - use the closest snap point
  if (snapX.length > 0) {
    // Find closest snap in X
    const closest = snapX.reduce((prev, curr) => 
      Math.abs(curr.position - newX) < Math.abs(prev.position - newX) ? curr : prev
    );
    snappedX = closest.position;
    guides.push(closest.guide);
  }
  
  if (snapY.length > 0) {
    // Find closest snap in Y
    const closest = snapY.reduce((prev, curr) => 
      Math.abs(curr.position - newY) < Math.abs(prev.position - newY) ? curr : prev
    );
    snappedY = closest.position;
    guides.push(closest.guide);
  }
  
  return {
    x: snappedX,
    y: snappedY,
    guides
  };
}

/**
 * Get all elements from the current zone and page
 */
export function getAllElementsInZone(document, currentPage, zone) {
  if (zone === 'header') {
    return document.header?.elements || [];
  } else if (zone === 'footer') {
    return document.footer?.elements || [];
  } else {
    return currentPage?.elements || [];
  }
}

/**
 * Get all elements from all zones with absolute page coordinates
 * This allows snapping across different zones
 */
export function getAllElementsWithAbsoluteCoords(document, currentPage) {
  const headerHeight = document.header?.height || 120;
  const footerHeight = document.footer?.height || 120;
  const elements = [];
  
  // Header elements (already at top, no offset needed)
  const headerElements = (document.header?.elements || []).map(el => ({
    ...el,
    absoluteX: el.x,
    absoluteY: el.y,
    zone: 'header'
  }));
  
  // Content elements (offset by header height)
  const contentElements = (currentPage?.elements || []).map(el => ({
    ...el,
    absoluteX: el.x,
    absoluteY: el.y + headerHeight,
    zone: 'content'
  }));
  
  // Footer elements (offset by page height minus footer height)
  const footerY = document.header ? headerHeight : 0;
  const contentHeight = currentPage?.height || 0;
  const footerOffset = headerHeight + contentHeight;
  
  const footerElements = (document.footer?.elements || []).map(el => ({
    ...el,
    absoluteX: el.x,
    absoluteY: el.y + footerOffset,
    zone: 'footer'
  }));
  
  return [...headerElements, ...contentElements, ...footerElements];
}

/**
 * Convert zone-relative coordinates to absolute page coordinates
 */
export function zoneToAbsoluteCoords(x, y, zone, document, pageSize) {
  const headerHeight = document.header?.height || 120;
  
  if (zone === 'header') {
    return { x, y };
  } else if (zone === 'content') {
    return { x, y: y + headerHeight };
  } else if (zone === 'footer') {
    const contentHeight = pageSize.height - headerHeight - (document.footer?.height || 120);
    return { x, y: y + headerHeight + contentHeight };
  }
  
  return { x, y };
}

/**
 * Convert absolute page coordinates to zone-relative coordinates
 */
export function absoluteToZoneCoords(x, y, zone, document, pageSize) {
  const headerHeight = document.header?.height || 120;
  
  if (zone === 'header') {
    return { x, y };
  } else if (zone === 'content') {
    return { x, y: y - headerHeight };
  } else if (zone === 'footer') {
    const contentHeight = pageSize.height - headerHeight - (document.footer?.height || 120);
    return { x, y: y - headerHeight - contentHeight };
  }
  
  return { x, y };
}

/**
 * Calculate element bounds with absolute coordinates
 */
export function getElementBoundsAbsolute(element) {
  const bounds = getElementBounds(element);
  const absoluteX = element.absoluteX !== undefined ? element.absoluteX : element.x;
  const absoluteY = element.absoluteY !== undefined ? element.absoluteY : element.y;
  
  return {
    ...bounds,
    left: absoluteX,
    right: absoluteX + bounds.width,
    top: absoluteY,
    bottom: absoluteY + bounds.height,
    centerX: absoluteX + bounds.width / 2,
    centerY: absoluteY + bounds.height / 2
  };
}

/**
 * Get container dimensions for the current zone
 */
export function getZoneDimensions(document, pageSize, zone) {
  if (zone === 'header') {
    return {
      width: pageSize.width,
      height: document.header?.height || 120
    };
  } else if (zone === 'footer') {
    return {
      width: pageSize.width,
      height: document.footer?.height || 120
    };
  } else {
    return {
      width: pageSize.width,
      height: pageSize.height - (document.header?.height || 120) - (document.footer?.height || 120)
    };
  }
}
