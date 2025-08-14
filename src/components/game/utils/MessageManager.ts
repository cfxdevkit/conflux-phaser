import { Scene } from 'phaser';

/**
 * MessageManager class for handling game messages
 * Provides a centralized way to show and clear UI messages to the player
 */
export class MessageManager {
    private scene: Phaser.Scene;
    private graphics?: Phaser.GameObjects.Graphics;
    private text?: Phaser.GameObjects.Text;
    private timer?: Phaser.Time.TimerEvent;
    
    /**
     * Create a new MessageManager
     * 
     * @param scene The Phaser scene this manager belongs to
     */
    constructor(scene: Scene) {
        this.scene = scene;
    }
    
    /**
     * Display a message to the player
     * 
     * @param text The message text to display
     * @param duration How long to show the message (in ms)
     * @param autoRemove Whether to automatically remove the message after duration
     */
    show(text: string, duration: number = 4000, autoRemove: boolean = true): void {
        this.clear();
        
        // Create a semi-transparent background
        this.graphics = this.scene.add.graphics();
        this.graphics.fillStyle(0x000000, 0.7);
        this.graphics.fillRect(0, 0, this.scene.cameras.main.width, 100);
        this.graphics.setScrollFactor(0);
        this.graphics.setDepth(999);
        this.graphics.setName('gameMessage');
        
        // Add text on top of the background
        this.text = this.scene.add.text(this.scene.cameras.main.width / 2, 50, text, {
            fontFamily: 'monoBold',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        });
        this.text.setOrigin(0.5);
        this.text.setScrollFactor(0);
        this.text.setDepth(1000);
        this.text.setName('gameMessageText');
        
        // Auto-remove message after duration if requested
        if (autoRemove) {
            this.timer = this.scene.time.delayedCall(duration, () => {
                this.clear();
            });
        }
    }
    
    /**
     * Clear any displayed message
     */
    clear(): void {
        // Cancel any pending auto-remove
        if (this.timer) {
            this.timer.remove();
            this.timer = undefined;
        }
        
        // Remove message background
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = undefined;
        }
        
        // Remove message text
        if (this.text) {
            this.text.destroy();
            this.text = undefined;
        }
    }
}
