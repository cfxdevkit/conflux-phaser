import { Scene, GameObjects } from 'phaser';

export type ButtonSize = 'default' | '3Slides' | '9Slides';

export class BlueButton extends GameObjects.Container {
  private bg: Phaser.GameObjects.Image | Phaser.GameObjects.NineSlice;
  private label: Phaser.GameObjects.Text;
  private callback: () => void;
  private size: ButtonSize;
  private btnWidth: number;
  private btnHeight: number;
  private originalWidth: number;
  private originalHeight: number;
  public state: 'normal' | 'hover' | 'pressed' | 'disabled';

  constructor(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    callback: () => void,
    size: ButtonSize = 'default',
    width: number = 150,
    height: number = 40
  ) {
    super(scene, x, y);
    this.callback = callback;
    this.size = size;
    this.state = 'normal';
    this.btnWidth = width;
    this.btnHeight = height;

    // Pick the correct image key
    const key = this.getKey('normal');

    // Create either a regular image or nineslice based on the button size
    if (this.size === 'default') {
      // Use regular image for default size
      this.bg = scene.add.image(0, 0, key);
      // Store original size for scaling
      this.originalWidth = this.bg.width;
      this.originalHeight = this.bg.height;
      this.bg.setScale(width / this.bg.width, height / this.bg.height);
    } else if (this.size === '3Slides') {
      // Use nineslice for 3-slice scaling (horizontal only)
      // Adjust the slice parameters for better 3-slice behavior
      this.bg = scene.add.nineslice(0, 0, key, undefined, width, height, 32, 32);
      this.originalWidth = width;
      this.originalHeight = height;
    } else {
      // Use nineslice for 9-slice scaling (both horizontal and vertical) - default case
      this.bg = scene.add.nineslice(0, 0, key, undefined, width, height, 16, 16, 32, 16);
      this.originalWidth = width;
      this.originalHeight = height;
    }
    
    // IMPORTANT: Don't use setInteractive with custom hit areas on scaled images
    // Just use the default interactive area which works with scaling
    this.bg.setInteractive();
    this.add(this.bg);

    // Create text with scaled font size
    this.label = scene.add.text(0, 0, text, {
      fontFamily: 'monoBold',
      fontSize: this.calculateFontSize(width, height),
      color: '#fff',
      align: 'center',
      stroke: '#000',
      strokeThickness: this.calculateStrokeThickness(width),
    }).setOrigin(0.5);
    
    // For 3Slides buttons, adjust vertical centering slightly higher
    if (this.size === '3Slides') {
      this.label.setY(-2); // Move up more for better visual centering
    }
    
    // Don't make the label interactive at all
    this.add(this.label);

    // Set the container size to match the button dimensions
    this.setSize(width, height);
    
    // Position label based on button type for better centering
    if (this.size === '3Slides') {
      this.label.setPosition(0, -2); // Higher positioning for 3Slides
    } else {
      this.label.setPosition(0, 0); // Standard centering for others
    }
    
    // Handle pointer events on the background image
    this.setupEventHandlers();
  }

  private calculateFontSize(width: number, height: number): string {
    // Base font size calculation based on button dimensions
    let heightBasedSize, widthBasedSize;
    
    if (this.size === '3Slides') {
      // 3Slides: Keep current size, it's good
      heightBasedSize = Math.max(12, Math.floor(height * 0.45));
      widthBasedSize = Math.max(12, Math.floor(width * 0.09));
    } else if (this.size === '9Slides') {
      // 9Slides: Make text larger
      heightBasedSize = Math.max(12, Math.floor(height * 0.5));
      widthBasedSize = Math.max(12, Math.floor(width * 0.12));
    } else {
      // Default: standard sizing
      heightBasedSize = Math.max(12, Math.floor(height * 0.4));
      widthBasedSize = Math.max(12, Math.floor(width * 0.08));
    }
    
    // Use the smaller of the two to ensure text fits
    const fontSize = Math.min(heightBasedSize, widthBasedSize, 32); // Cap at 32px max
    return `${fontSize}px`;
  }

  private calculateStrokeThickness(width: number): number {
    if (this.size === '3Slides') {
      // 3Slides: Bigger black border
      return Math.max(3, Math.floor(width / 50));
    } else if (this.size === '9Slides') {
      // 9Slides: Standard border
      return Math.max(2, Math.floor(width / 75));
    } else {
      // Default: standard border
      return Math.max(2, Math.floor(width / 75));
    }
  }

  private updateTextStyle() {
    const fontSize = this.calculateFontSize(this.btnWidth, this.btnHeight);
    const strokeThickness = this.calculateStrokeThickness(this.btnWidth);
    
    this.label.setStyle({
      fontSize: fontSize,
      strokeThickness: strokeThickness,
    });
  }

  private getKey(state: 'normal' | 'hover' | 'pressed' | 'disabled') {
    // Only use keys for which we have images, fallback to normal if missing
    if (this.size === 'default') {
      switch (state) {
        case 'normal':
        case 'hover':
        case 'disabled':
          return 'Button_Blue';
        case 'pressed':
          return 'Button_Blue_Pressed';
      }
    } else if (this.size === '3Slides') {
      switch (state) {
        case 'normal':
        case 'hover':
        case 'disabled':
          return 'Button_Blue_3Slides';
        case 'pressed':
          return 'Button_Blue_3Slides_Pressed';
      }
    } else if (this.size === '9Slides') {
      switch (state) {
        case 'normal':
        case 'hover':
        case 'disabled':
          return 'Button_Blue_9Slides';
        case 'pressed':
          return 'Button_Blue_9Slides_Pressed';
      }
    }
    // fallback
    return 'Button_Blue';
  }

  private setButtonState(state: 'normal' | 'hover' | 'pressed' | 'disabled') {
    this.state = state;
    this.bg.setTexture(this.getKey(state));
    
    // Handle scaling differently for regular images vs nineslice
    if (this.size === 'default') {
      // Regular image - use scale
      (this.bg as Phaser.GameObjects.Image).setScale(this.btnWidth / this.originalWidth, this.btnHeight / this.originalHeight);
    } else {
      // NineSlice - resize directly
      (this.bg as Phaser.GameObjects.NineSlice).setSize(this.btnWidth, this.btnHeight);
    }
    
    // Update text styling when button state changes
    this.updateTextStyle();
    
    if (state === 'hover') {
      this.bg.setTint(0xeeeeee);
    } else if (state === 'disabled') {
      this.bg.setTint(0x888888);
      this.bg.setAlpha(0.7);
    } else {
      this.bg.clearTint();
      this.bg.setAlpha(1);
    }
  }

  private setupEventHandlers() {
    // Handle pointer events on the background image - it handles scaling automatically
    this.bg.on('pointerdown', this.handlePointerDown, this);
    this.bg.on('pointerup', this.handlePointerUp, this);
    this.bg.on('pointerout', this.handlePointerOut, this);
    this.bg.on('pointerover', this.handlePointerOver, this);
  }

  private handlePointerDown() {
    if (this.state !== 'disabled') {
      this.setButtonState('pressed');
      // Scale the text movement with button size, adjust base position for 3Slides
      const baseY = this.size === '3Slides' ? -2 : 0;
      const moveDistance = this.size === '3Slides' ? 
        Math.max(1, Math.floor(this.btnHeight / 25)) : 
        Math.max(1, Math.floor(this.btnHeight / 20));
      this.label.setY(baseY + moveDistance);
    }
  }

  private handlePointerUp() {
    if (this.state !== 'disabled') {
      this.setButtonState('hover');
      // Return to base position based on button type
      const baseY = this.size === '3Slides' ? -2 : 0;
      this.label.setY(baseY);
      this.callback();
    }
  }

  private handlePointerOut() {
    if (this.state !== 'disabled') {
      this.setButtonState('normal');
      // Return to base position based on button type
      const baseY = this.size === '3Slides' ? -2 : 0;
      this.label.setY(baseY);
    }
  }

  private handlePointerOver() {
    if (this.state !== 'disabled') {
      this.setButtonState('hover');
      // Subtle hover effect, adjust base position for 3Slides
      const baseY = this.size === '3Slides' ? -2 : 0;
      const hoverDistance = this.size === '3Slides' ? 
        Math.max(0.5, Math.floor(this.btnHeight / 50)) : 
        Math.max(0.5, Math.floor(this.btnHeight / 40));
      this.label.setY(baseY + hoverDistance);
    }
  }

  public setDisabled(disabled: boolean) {
    if (disabled) {
      this.setButtonState('disabled');
      this.bg.disableInteractive();
    } else {
      this.setButtonState('normal');
      // Just re-enable with default interactive (no custom hit area)
      this.bg.setInteractive();
    }
  }
}

// To scale the button, pass the desired width and height to the constructor:
// new BlueButton(scene, x, y, 'Label', callback, 'default', 200, 60)

// To use the 9Slides variant for a wide button (pixel-perfect):
// new BlueButton(scene, x, y, 'Label', callback, '9Slides', 300, 60)