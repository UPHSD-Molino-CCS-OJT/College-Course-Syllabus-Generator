/**
 * Migration utilities to convert nested group structure to canvas-based positioning
 */

/**
 * Flatten nested group structure to positioned elements
 * Calculates positions based on layout and nesting
 * @param {Array} blocks - Array of blocks (may contain groups)
 * @param {string} layout - 'horizontal' or 'vertical'
 * @param {number} startX - Starting X position
 * @param {number} startY - Starting Y position
 * @param {number} spacing - Space between elements
 * @returns {Array} Flat array of positioned elements
 */
export function flattenGroupsToCanvas(
  blocks,
  layout = 'horizontal',
  startX = 0,
  startY = 0,
  spacing = 20
) {
  const flatElements = [];
  let currentX = startX;
  let currentY = startY;
  let maxHeight = 0;
  let maxWidth = 0;

  blocks.forEach((block, index) => {
    if (block.type === 'group') {
      // Recursively flatten group children
      const groupLayout = block.layout || 'horizontal';
      const childElements = flattenGroupsToCanvas(
        block.children || [],
        groupLayout,
        currentX,
        currentY,
        spacing
      );

      flatElements.push(...childElements);

      // Calculate bounds of group for positioning next element
      if (childElements.length > 0) {
        const bounds = calculateBounds(childElements);
        if (layout === 'horizontal') {
          currentX = bounds.maxX + spacing;
          maxHeight = Math.max(maxHeight, bounds.maxY - startY);
        } else {
          currentY = bounds.maxY + spacing;
          maxWidth = Math.max(maxWidth, bounds.maxX - startX);
        }
      }
    } else {
      // Regular text or image element
      const element = {
        id: block.id || Date.now() + Math.random() + index,
        type: block.type,
        content: block.content || '',
        position: { x: currentX, y: currentY },
        size: {
          width: block.styles?.width || (block.type === 'text' ? 200 : 100),
          height: block.styles?.height || (block.type === 'text' ? 40 : 100),
        },
        zIndex: index,
        styles: {
          fontWeight: block.styles?.fontWeight || 'normal',
          fontSize: block.styles?.fontSize || 'medium',
          color: block.styles?.color || '#000000',
          textAlign: block.alignment || 'center',
          ...(block.type === 'image' && {
            objectFit: block.styles?.objectFit || 'contain',
          }),
        },
      };

      flatElements.push(element);

      // Update position for next element
      if (layout === 'horizontal') {
        currentX += element.size.width + spacing;
        maxHeight = Math.max(maxHeight, element.size.height);
      } else {
        currentY += element.size.height + spacing;
        maxWidth = Math.max(maxWidth, element.size.width);
      }
    }
  });

  return flatElements;
}

/**
 * Calculate bounding box of multiple elements
 * @param {Array} elements - Array of positioned elements
 * @returns {object} Bounds { minX, minY, maxX, maxY }
 */
function calculateBounds(elements) {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    minX = Math.min(minX, el.position.x);
    minY = Math.min(minY, el.position.y);
    maxX = Math.max(maxX, el.position.x + el.size.width);
    maxY = Math.max(maxY, el.position.y + el.size.height);
  });

  return { minX, minY, maxX, maxY };
}

/**
 * Migrate settings from old structure to new canvas structure
 * @param {object} oldSettings - Settings with nested group structure
 * @returns {object} New settings with canvas structure
 */
export function migrateToCanvasStructure(oldSettings) {
  const newSettings = {
    ...oldSettings,
    headerContent: [],
    footerContent: [],
  };

  // Migrate header content
  if (oldSettings.headerContent && oldSettings.headerContent.length > 0) {
    const headerLayout = oldSettings.headerLayout || 'vertical';
    newSettings.headerContent = flattenGroupsToCanvas(
      oldSettings.headerContent,
      headerLayout,
      20, // Start X
      20  // Start Y
    );
  }

  // Migrate footer content
  if (oldSettings.footerContent && oldSettings.footerContent.length > 0) {
    const footerLayout = oldSettings.footerLayout || 'vertical';
    newSettings.footerContent = flattenGroupsToCanvas(
      oldSettings.footerContent,
      footerLayout,
      20, // Start X
      20  // Start Y
    );
  }

  return newSettings;
}

/**
 * Check if settings use old nested structure
 * @param {object} settings - Settings to check
 * @returns {boolean} True if old structure detected
 */
export function needsMigration(settings) {
  const checkForGroups = (blocks) => {
    if (!Array.isArray(blocks)) return false;
    return blocks.some(
      (block) => block.type === 'group' || !block.position || !block.size
    );
  };

  return (
    checkForGroups(settings.headerContent) ||
    checkForGroups(settings.footerContent)
  );
}
