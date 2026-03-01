/**
 * Barrel re-export for all relationship-matrix table builders.
 *
 * Import individual builders from their own file when you only need one;
 * import from this file when you need several at once.
 *
 *   import { buildCLOPLOMatrix, pasteAtAnchor } from '../utils/matrixBuilders';
 */

export { CHECK, sortGAs } from './shared.js';

export { buildGAMissionKeywordMatrix } from './gaMatrix.js';
export { buildPEOGAMatrix }            from './peoMatrix.js';
export { buildPLOPEOMatrix }           from './ploMatrix.js';
export { buildCLOPLOMatrix }           from './cloMatrix.js';
export { buildLLOCLOMatrix }           from './lloMatrix.js';

export { pasteAtAnchor }               from './pasteAtAnchor.js';
