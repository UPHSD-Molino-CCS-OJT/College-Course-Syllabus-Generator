/**
 * Snapping utility for canvas editor
 * Provides snapping functionality for element positioning relative to:
 * - Other elements (edges and centers)
 * - Page/zone boundaries (edges and center)
 */

const SNAP_THRESHOLD = 8; // pixels - distance at which snapping occurs

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
