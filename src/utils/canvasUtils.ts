/**
 * Utility functions for handling Phaser canvas styling and resizing
 */

/**
 * Styles the canvas element to fit properly within its container
 */
export const styleCanvas = () => {
  const canvas = document.querySelector('canvas');
  if (canvas) {
    // Style the canvas directly
    canvas.style.maxWidth = '100%';
    canvas.style.maxHeight = 'calc(100vh - 120px)';
    canvas.style.margin = '0 auto';
    canvas.style.display = 'block';
    
    // Ensure parent container maintains proper size
    const container = document.getElementById('game-container');
    if (container) {
      container.style.height = 'auto';
      container.style.maxHeight = 'calc(100vh - 120px)';
    }
  }
};

/**
 * Creates a resize handler for the Phaser game instance
 * @param game The Phaser game instance
 * @returns A function to handle window resize events
 */
export const createResizeHandler = (game: Phaser.Game | null) => {
  return () => {
    if (game) {
      // Force a resize event on the game's scale manager
      setTimeout(() => {
        game.scale.refresh();
        styleCanvas();
      }, 100);
    }
  };
};
