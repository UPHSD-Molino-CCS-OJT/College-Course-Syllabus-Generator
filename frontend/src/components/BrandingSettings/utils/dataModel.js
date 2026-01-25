/**
 * New canvas-based data model for branding elements
 * Each element has absolute positioning instead of nested groups
 */

/**
 * Create a new element with default properties
 * @param {string} type - 'text' or 'image'
 * @param {number} x - X position in pixels
 * @param {number} y - Y position in pixels
 * @returns {object} New element object
 */
export function createCanvasElement(type, x = 0, y = 0) {
  const baseElement = {
    id: Date.now() + Math.random(),
    type,
    position: { x, y },
    size: {
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 40 : 100,
    },
    zIndex: 0,
    styles: {
      fontWeight: 'normal',
      fontSize: 'medium',
      color: '#000000',
      textAlign: 'center',
    },
  };

  if (type === 'text') {
    baseElement.content = 'Enter text here';
  } else if (type === 'image') {
    baseElement.content = '';
    baseElement.styles.objectFit = 'contain';
  }

  return baseElement;
}

/**
 * Validates a canvas element structure
 * @param {object} element - Element to validate
 * @returns {boolean} True if valid
 */
export function isValidCanvasElement(element) {
  return (
    element &&
    typeof element.id !== 'undefined' &&
    (element.type === 'text' || element.type === 'image') &&
    element.position &&
    typeof element.position.x === 'number' &&
    typeof element.position.y === 'number' &&
    element.size &&
    typeof element.size.width === 'number' &&
    typeof element.size.height === 'number' &&
    typeof element.zIndex === 'number'
  );
}

/**
 * Update element position
 * @param {object} element - Element to update
 * @param {number} x - New X position
 * @param {number} y - New Y position
 * @returns {object} Updated element
 */
export function updateElementPosition(element, x, y) {
  return {
    ...element,
    position: { x, y },
  };
}

/**
 * Update element size
 * @param {object} element - Element to update
 * @param {number} width - New width
 * @param {number} height - New height
 * @returns {object} Updated element
 */
export function updateElementSize(element, width, height) {
  return {
    ...element,
    size: { width, height },
  };
}

/**
 * Update element z-index
 * @param {object} element - Element to update
 * @param {number} zIndex - New z-index
 * @returns {object} Updated element
 */
export function updateElementZIndex(element, zIndex) {
  return {
    ...element,
    zIndex,
  };
}

/**
 * Default canvas configuration
 */
export const CANVAS_CONFIG = {
  width: 800,
  height: 400,
  gridSize: 10,
  snapToGrid: false,
  showGrid: true,
  backgroundColor: '#ffffff',
};
