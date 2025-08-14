import { GameObjects, Scene } from 'phaser';
import { BlueButton } from '../ui/buttons/BlueButton';
import { EventBus } from '../EventBus';
import { TilemapLoader } from '../utils/TilemapLoader';

export class MainMenu extends Scene {
    background!: GameObjects.Image;
    map!: Phaser.Tilemaps.Tilemap;

    // Interactive images
    private espace!: Phaser.GameObjects.Image;
    private phaser!: Phaser.GameObjects.Image;
    private vite!: Phaser.GameObjects.Image;
    private react!: Phaser.GameObjects.Image;
    
    private start!: BlueButton;
    private connectWallet!: BlueButton;

    constructor() {
        super('MainMenu');
    }

    create() {
        // Load the tilemap using our utility
        this.map = TilemapLoader.loadDemoTilemap(this) || this.make.tilemap({ key: 'demo' });
        
        // Configure physics world for this scene
        this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);
        this.physics.world.gravity.y = 300; // Set appropriate gravity for the scene
        
        // Set physics debug mode to visualize collision areas (comment out in production)
        // this.physics.world.createDebugGraphic();
        
        // // Enable debug visualization for layers if map exists
        // if (this.map) {
        //     // Debug visualization for Base layer
        //     const baseLayer = this.map.getLayer('Base');
        //     if (baseLayer && baseLayer.tilemapLayer) {
        //         baseLayer.tilemapLayer.renderDebug(this.add.graphics(), {
        //             tileColor: null,
        //             collidingTileColor: new Phaser.Display.Color(243, 134, 48, 128),
        //             faceColor: new Phaser.Display.Color(40, 39, 37, 128)
        //         });
        //     }
            
        //     // Debug visualization for Back layer with different color
        //     const backLayer = this.map.getLayer('Back');
        //     if (backLayer && backLayer.tilemapLayer) {
        //         backLayer.tilemapLayer.renderDebug(this.add.graphics(), {
        //             tileColor: null,
        //             collidingTileColor: new Phaser.Display.Color(48, 134, 243, 128), // Blue color
        //             faceColor: new Phaser.Display.Color(40, 39, 37, 128)
        //         });
        //     }
        // }
        
        // Control animation speed - lower values = slower animation
        // this.animatedTiles.setRate(0.5);

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Create both buttons once
        this.connectWallet = new BlueButton(
            this,
            centerX,
            centerY,
            'Connect Wallet',
            () => {
                EventBus.emit('phaser-connect-wallet');
            },
            '9Slides',
            300,
            100
        );
        this.add.existing(this.connectWallet);
        
        // Button is now positioned at centerX, centerY - 60

        // Test BlueButton with 9Slides (pixel-perfect wide button)
        this.start = new BlueButton(
            this,
            centerX,
            centerY,
            'Start',
            () => {
                this.changeScene();
            },
            '9Slides',
            400,
            100
        );
        this.add.existing(this.start);
        
        // Button is now positioned at centerX, centerY + 60

        // Always start with both buttons hidden, wallet events will set correct visibility
        this.connectWallet.setVisible(false);
        this.start.setVisible(false);

        // Helper to update button visibility
        const setButtonVisibility = (connected: boolean) => {
            this.connectWallet.setVisible(!connected);
            this.start.setVisible(connected);
        };

        // Define proper interfaces for wallet data
        interface WalletData {
            walletClient: unknown;
            publicClient: unknown;
        }
        
        // Define interface for game with wallet properties
        interface GameWithWallet extends Phaser.Game {
            walletClient: unknown | undefined;
            publicClient: unknown | undefined;
        }
        
        // Setup wallet listeners before emitting ready event
        const onWalletConnected = (walletData: WalletData) => {
            setButtonVisibility(true);
            const game = this.game as GameWithWallet;
            game.walletClient = walletData.walletClient;
            game.publicClient = walletData.publicClient;
        };

        const onWalletDisconnected = () => {
            setButtonVisibility(false);
            const game = this.game as GameWithWallet;
            game.walletClient = undefined;
            game.publicClient = undefined;
        };

        // Remove any previous listeners to avoid duplicates
        EventBus.removeAllListeners('wallet-connected');
        EventBus.removeAllListeners('wallet-disconnected');
        EventBus.on('wallet-connected', onWalletConnected);
        EventBus.on('wallet-disconnected', onWalletDisconnected);

        // On scene creation, do NOT check wallet state directly.
        // React (PhaserGame.tsx) must always emit the current wallet state via EventBus
        // so that Phaser is always in sync. This avoids race conditions and stale state.
        // The button visibility and wallet state are ONLY set in response to wallet events.

        // Store event handlers for cleanup
        this.events.on('shutdown', () => {
            EventBus.removeAllListeners('wallet-connected');
            EventBus.removeAllListeners('wallet-disconnected');
        });

        // Enable physics for buttons FIRST - this is important for proper initialization
        this.enableButtonPhysics(this.connectWallet);
        this.enableButtonPhysics(this.start);
        
        // Add interactive sprites with physics
        // 1. Espace - already scaled in Preloader.ts with scale: 5
        this.espace = this.add.image(200, 200, 'espace');
        
        // 2. Phaser - original image is large, needs significant scaling down
        this.phaser = this.add.image(300, 150, 'phaser');
        this.phaser.setScale(0.08); // Scale down the phaser image to match others
        
        // 3. Vite - already scaled in Preloader.ts with scale: 3
        this.vite = this.add.image(600, 200, 'vite');
        
        // 4. React - already scaled in Preloader.ts with scale: 3
        this.react = this.add.image(800, 200, 'react');
        
        // Enable physics for all sprites
        this.physics.world.enable([this.espace, this.phaser, this.vite, this.react]);
        
        // Configure physics bodies for all sprites with the same properties
        const configureBouncePhysics = (sprite: Phaser.GameObjects.Image) => {
            const body = sprite.body as Phaser.Physics.Arcade.Body;
            if (body) {
                body.setBounce(1, 1); // Full bounce for lively interactions
                body.setCollideWorldBounds(true); // Keep within screen bounds
                body.setVelocity(Phaser.Math.Between(50, 150), Phaser.Math.Between(50, 150)); // Random velocities
            }
        };
        
        // Apply physics to all sprites
        configureBouncePhysics(this.espace);
        configureBouncePhysics(this.phaser);
        configureBouncePhysics(this.vite);
        configureBouncePhysics(this.react);
        
        // Add tilemap collisions separately for better control
        if (this.map) {
            const baseLayer = this.map.getLayer('Base')?.tilemapLayer;
            const backLayer = this.map.getLayer('Back')?.tilemapLayer;
            
            if (baseLayer) {
                // Add colliders for all sprites with base layer
                this.physics.add.collider(this.espace, baseLayer);
                this.physics.add.collider(this.phaser, baseLayer);
                this.physics.add.collider(this.vite, baseLayer);
                this.physics.add.collider(this.react, baseLayer);
            }
            
            if (backLayer) {
                // Add colliders for all sprites with back layer
                this.physics.add.collider(this.espace, backLayer);
                this.physics.add.collider(this.phaser, backLayer);
                this.physics.add.collider(this.vite, backLayer);
                this.physics.add.collider(this.react, backLayer);
            }
        }
        
        // Add sprite-to-sprite collisions
        this.physics.add.collider(this.espace, this.phaser);
        this.physics.add.collider(this.espace, this.vite);
        this.physics.add.collider(this.espace, this.react);
        this.physics.add.collider(this.phaser, this.vite);
        this.physics.add.collider(this.phaser, this.react);
        this.physics.add.collider(this.vite, this.react);
        
        // Add colliders between sprites and buttons with collision callbacks
        const addButtonCollider = (sprite: Phaser.GameObjects.Image, button: BlueButton) => {
            this.physics.add.collider(sprite, button, 
                (_obj1, obj2) => this.onButtonCollide(obj2 as BlueButton), 
                (_obj1, obj2) => (obj2 as BlueButton).visible, 
                this);
        };
        
        // Add all sprite-to-button colliders
        addButtonCollider(this.espace, this.connectWallet);
        addButtonCollider(this.espace, this.start);
        addButtonCollider(this.phaser, this.connectWallet);
        addButtonCollider(this.phaser, this.start);
        addButtonCollider(this.vite, this.connectWallet);
        addButtonCollider(this.vite, this.start);
        addButtonCollider(this.react, this.connectWallet);
        addButtonCollider(this.react, this.start);
        
        // No need to set velocities here, already set in configureBouncePhysics
        
        // No periodic timer needed since we're allowing buttons to move freely
        
        // Initial setup is complete - buttons are in position
        
        EventBus.emit('scene-ready', this);

    }

    changeScene() {
        this.scene.start('Game');
    }
    
    // We've removed the resetButtonPositions method as we're now allowing buttons to move

    /**
     * Update method called every frame
     */
    update() {
        // Update button visibility based on any changes
        // This is already handled by the EventBus events, but we could add additional logic here
        
        // Basic physics update for buttons
        if (this.connectWallet && this.connectWallet.visible) {
            const connectBody = this.connectWallet.body as Phaser.Physics.Arcade.Body;
            if (connectBody) {
                // Just ensure the button is enabled
                connectBody.enable = true;
            }
        }
        
        if (this.start && this.start.visible) {
            const startBody = this.start.body as Phaser.Physics.Arcade.Body;
            if (startBody) {
                // Just ensure the button is enabled
                startBody.enable = true;
            }
        }
    }

    /**
     * Handler for when espace collides with a button
     */
    private onButtonCollide(button: BlueButton) {
        // Only handle collision if the button is visible
        if (button.visible && button.state !== 'pressed') {
            // Change button state to pressed temporarily
            const originalState = button.state;
            button.state = 'pressed';
            
            // Play bump sound effect with adjusted volume
            this.sound.play('button-hit', { volume: 0.7 });
            
            // Create a small "bump" effect
            this.tweens.add({
                targets: button,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                ease: 'Bounce.easeOut'
            });
            
            // Reset button state after a short delay
            this.time.delayedCall(200, () => {
                button.state = originalState;
            });
        }
    }

    /**
     * Enable physics for a button and configure it for proper collision
     * @param button The BlueButton to enable physics for
     */
    private enableButtonPhysics(button: BlueButton) {
        // Enable physics for the button container
        this.physics.world.enable(button);
        
        const buttonBody = button.body as Phaser.Physics.Arcade.Body;
        if (buttonBody) {
            // Make the button absolutely immovable (won't be pushed by the espace sprite)
            buttonBody.setImmovable(true);
            
            // Set mass very high to resist movement
            buttonBody.setMass(1000);
            
            // Disable gravity so the button stays in place
            buttonBody.setAllowGravity(false);
            
            // Zero out any velocity to ensure it doesn't move
            buttonBody.setVelocity(0, 0);
            
            // Stop it from bouncing
            buttonBody.setBounce(0, 0);
            
            // Make button collide with world bounds to prevent it from leaving screen
            buttonBody.setCollideWorldBounds(true);
            
            // Use a slightly larger physics body for better collision detection
            const buttonWidth = button.width * 1.0; // Using full width now
            const buttonHeight = button.height * 0.9; // Using 90% height
            
            buttonBody.setSize(buttonWidth, buttonHeight);
            
            // Center the physics body on the button
            buttonBody.setOffset((button.width - buttonWidth) / 2, (button.height - buttonHeight) / 2);
            
            // Debug output to verify button physics configuration
            console.log(`Button physics enabled at ${button.x}, ${button.y} with size ${buttonWidth}x${buttonHeight}`);
        }
    }
    
    // We've removed the updateButtonPhysics method as we're now allowing buttons to move freely
}
