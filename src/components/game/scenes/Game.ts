import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { TilemapLoader } from '../utils/TilemapLoader';
import type { WalletClient } from 'viem';
import { MessageManager } from '../utils/MessageManager';
import { DEFAULT_GAME_CONFIG } from '../utils/GameConfig';
import type { GameConfig } from '../utils/GameConfig';
 
/**
 * Main game scene that handles player movement and wallet interactions
 * Allows players to transfer tokens and sign messages through gameplay
 */
export class Game extends Scene {
    // Visual elements
    private background!: Phaser.GameObjects.TileSprite;
    private char1!: Phaser.GameObjects.Sprite;
    
    // Interactive elements
    private transferEspace!: Phaser.GameObjects.Image;
    private signEspace!: Phaser.GameObjects.Image;
    
    // Cooldown timers to prevent multiple transactions
    private transferCooldown: number = 0;
    private signCooldown: number = 0;
    
    // Game configuration
    private config: GameConfig = DEFAULT_GAME_CONFIG;
    
    // Message manager
    private messageManager!: MessageManager;
    
    // We keep a reference to the map for potential interaction later
    private map: Phaser.Tilemaps.Tilemap | null = null;
    
    // Controls
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private isCharGrounded: boolean = false;
    
    // Debug info
    private debugText?: Phaser.GameObjects.Text;
    private walletStatusText?: Phaser.GameObjects.Text;
    
    // Wallet info
    private walletClient: WalletClient | null = null;

    constructor() {
        super('Game');
    }
    
    /**
     * Initialize the game scene
     * Reset state variables and get references to external objects
     */
    init() {
        // Reset state variables
        this.isCharGrounded = false;
        
        // Reset cooldown timers
        this.transferCooldown = 0;
        this.signCooldown = 0;
        
        // Define interface for game with wallet properties
        interface GameWithWallet extends Phaser.Game {
            walletClient: WalletClient | undefined;
        }
        
        // Get wallet client from game instance
        this.walletClient = (this.game as GameWithWallet).walletClient || null;
        
        // Initialize message manager
        this.messageManager = new MessageManager(this);
    }

    create() {
        // Set camera background color
        this.cameras.main.setBackgroundColor(0x00ff00);
        
        // Load the same tilemap as in MainMenu for consistency
        this.map = TilemapLoader.loadDemoTilemap(this);
        
        // Set physics debug mode to visualize collision areas (comment out in production)
        // this.physics.world.createDebugGraphic();
        
        // Use the map for game interactions
        // if (this.map) {
        //     // Debug visualization for Base layer
        //     const baseLayer = this.map.getLayer('Base');
        //     if (baseLayer && baseLayer.tilemapLayer) {
        //         baseLayer.tilemapLayer.renderDebug(this.add.graphics(), {
        //             tileColor: null,
        //             collidingTileColor: new Phaser.Display.Color(243, 134, 48, 128), // Orange
        //             faceColor: new Phaser.Display.Color(40, 39, 37, 128)
        //         });
        //     }
            
        //     // Debug visualization for Back layer with different color
        //     const backLayer = this.map.getLayer('Back');
        //     if (backLayer && backLayer.tilemapLayer) {
        //         backLayer.tilemapLayer.renderDebug(this.add.graphics(), {
        //             tileColor: null,
        //             collidingTileColor: new Phaser.Display.Color(48, 134, 243, 128), // Blue
        //             faceColor: new Phaser.Display.Color(40, 39, 37, 128)
        //         });
        //     }
        // }
        
        // Create a background with different texture for variety
        this.background = TilemapLoader.createTiledBackground(this, '2', -10);
        this.background.setAlpha(0.2);

        // Add espace images for wallet interactions with labels
        // Position UI elements relative to screen dimensions for better responsiveness
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        this.transferEspace = this.add.image(width * 0.3, height * 0.83, 'espace');
        this.transferEspace.setScale(0.8);
        // Make transfer button interactive with click handler
        this.transferEspace.setInteractive({ useHandCursor: true });
        this.transferEspace.on('pointerdown', this.handleTransfer, this);
        // Add text label below the transfer espace
        this.add.text(width * 0.3, height * 0.87, 'Transfer', {
            fontFamily: 'monoBold',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.signEspace = this.add.image(width * 0.5, height * 0.83, 'espace');
        this.signEspace.setScale(0.8);
        // Make sign button interactive with click handler
        this.signEspace.setInteractive({ useHandCursor: true });
        this.signEspace.on('pointerdown', this.handleSign, this);
        // Add text label below the sign espace
        this.add.text(width * 0.5, height * 0.87, 'Sign', {
            fontFamily: 'monoBold',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Add disconnect button
        const disconnectButton = this.add.image(width * 0.7, height * 0.83, 'espace');
        disconnectButton.setName('disconnectButton'); // Set name for reference later
        disconnectButton.setScale(0.8);
        disconnectButton.setTint(0xff5555); // Red tint to indicate disconnect action
        
        // Add text label below the disconnect button
        this.add.text(width * 0.7, height * 0.87, 'Disconnect', {
            fontFamily: 'monoBold',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Make button interactive
        disconnectButton.setInteractive({ useHandCursor: true });
        disconnectButton.on('pointerdown', this.handleWalletDisconnect, this);

        // Create sprites
        this.char1 = this.add.sprite(500, 300, 'char1', 0);
        
        // Enable physics for character and make it collide with multiple tilemap layers
        TilemapLoader.addPhysicsToGameObject(this, this.char1, this.map, ['Base', 'Back'], 0.1, 0.1);
        
        // Enable physics for interactive images
        this.physics.world.enable([this.transferEspace, this.signEspace, disconnectButton]);
        
        // Configure espace physics
        const transferBody = this.transferEspace.body as Phaser.Physics.Arcade.Body;
        if (transferBody) {
            transferBody.setImmovable(true);
            transferBody.setAllowGravity(false);
        }
        
        const signBody = this.signEspace.body as Phaser.Physics.Arcade.Body;
        if (signBody) {
            signBody.setImmovable(true);
            signBody.setAllowGravity(false);
        }
        
        // Configure disconnect button physics
        const disconnectBody = disconnectButton.body as Phaser.Physics.Arcade.Body;
        if (disconnectBody) {
            disconnectBody.setImmovable(true);
            disconnectBody.setAllowGravity(false);
        }
        
        // Configure character physics
        const charBody = this.char1.body as Phaser.Physics.Arcade.Body;
        if (charBody) {
            // Configure physics properties from game config
            charBody.setDrag(this.config.player.drag, 0); // Add drag to slow down when not moving
            charBody.setGravity(0, this.config.player.gravity); // Set appropriate gravity
            charBody.setBounce(this.config.player.bounce); // Small bounce effect
            charBody.setCollideWorldBounds(true);
            
            // Set fixed width/height for better collision
            charBody.setSize(16, 24);
            charBody.setOffset(8, 8);
        }

        // Initialize keyboard controls
        this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;

        // Start with idle animation
        this.char1.play('char1Idle');
        
        // Add colliders with espaces to trigger wallet interactions
        this.physics.add.collider(this.char1, this.transferEspace, this.handleTransfer, undefined, this);
        this.physics.add.collider(this.char1, this.signEspace, this.handleSign, undefined, this);
        
        // Add collider with disconnect button to trigger wallet disconnect on collision
        const disconnectButtonObj = this.children.getByName('disconnectButton') as Phaser.GameObjects.Image;
        if (disconnectButtonObj) {
            this.physics.add.collider(this.char1, disconnectButtonObj, this.handleWalletDisconnect, undefined, this);
        }
        
        // Add debug text
        this.debugText = this.add.text(10, 10, 'Debug: ', {
            fontFamily: 'monoBold',
            fontSize: '14px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        })
        .setScrollFactor(0)
        .setDepth(100);
        
        // Add wallet status indicator
        this.walletStatusText = this.add.text(width * 0.8, height * 0.01, '', {
            fontFamily: 'monoBold',
            fontSize: '14px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2
        })
        .setScrollFactor(0)
        .setDepth(100);

        // Emit scene ready events
        EventBus.emit('current-scene-ready', this);
        EventBus.emit('scene-ready', this);

        // Listen for wallet disconnect
        const disconnectHandler = () => {
            this.registry.destroy(); // destroy registry
            // this.anims.destroy(); // destroy animations
            // this.events.off(); // disable all active events
            this.scene.stop(); // restart current scene
            this.scene.start('MainMenu');
        };
        EventBus.on('wallet-disconnected', disconnectHandler);
        
        // Clean up on shutdown
        this.events.once('shutdown', () => {
            EventBus.removeListener('wallet-disconnected', disconnectHandler);
        });
    }

    /**
     * Update game state each frame
     * @param time - Current game time in milliseconds
     */
    update(time: number) {
        // Get the character body
        const charBody = this.char1.body as Phaser.Physics.Arcade.Body;
        if (!charBody) return;

        // Check if character is on the ground
        this.isCharGrounded = charBody.blocked.down || charBody.touching.down;
        
        // Update cooldown timers if necessary
        if (this.transferCooldown > 0 && time > this.transferCooldown) {
            this.transferCooldown = 0;
        }
        
        if (this.signCooldown > 0 && time > this.signCooldown) {
            this.signCooldown = 0;
        }
        
        // Check for keyboard shortcut to disconnect wallet (D key)
        if (this.input.keyboard?.checkDown(this.input.keyboard.addKey('D'), 500)) {
            this.handleWalletDisconnect();
        }
        
        // Update debug text
        if (this.debugText) {
            this.debugText.setText([
                `Position: (${Math.floor(this.char1.x)}, ${Math.floor(this.char1.y)})`,
                `Velocity: (${Math.floor(charBody.velocity.x)}, ${Math.floor(charBody.velocity.y)})`,
                `Grounded: ${this.isCharGrounded ? 'Yes' : 'No'}`,
                `Animation: ${this.char1.anims.getName()}`,
                `Transfer Cooldown: ${this.transferCooldown > 0 ? ((this.transferCooldown - time) / 1000).toFixed(1) + 's' : 'Ready'}`,
                `Sign Cooldown: ${this.signCooldown > 0 ? ((this.signCooldown - time) / 1000).toFixed(1) + 's' : 'Ready'}`,
                'Controls: Arrow Keys to move, D to disconnect wallet'
            ].join('\n'));
        }
        
        // Update wallet status display
        if (this.walletStatusText) {
            if (this.walletClient && this.walletClient.account) {
                const address = this.walletClient.account.address;
                const shortAddress = address.slice(0, 8) + '...' + address.slice(-6);
                this.walletStatusText.setText(`Wallet: ${shortAddress}`);
                this.walletStatusText.setColor('#00ff00');
            } else {
                this.walletStatusText.setText('Wallet: Not Connected');
                this.walletStatusText.setColor('#ff0000');
            }
        }
        
        // Reset horizontal velocity
        let movingX = false;
        
        // Handle left/right movement
        if (this.cursors.left.isDown) {
            charBody.setVelocityX(-this.config.player.moveSpeed);
            this.char1.setFlipX(true); // Flip sprite to face left
            movingX = true;
        } else if (this.cursors.right.isDown) {
            charBody.setVelocityX(this.config.player.moveSpeed);
            this.char1.setFlipX(false); // Normal orientation
            movingX = true;
        } else if (this.isCharGrounded) {
            // Only stop horizontal movement when on the ground
            charBody.setVelocityX(0);
        }
        
        // Handle jumping
        if (this.cursors.up.isDown && this.isCharGrounded) {
            charBody.setVelocityY(-this.config.player.jumpForce);
            this.sound.play('jump'); // Play jump sound
        }
        
        // Update character animation based on movement state
        this.updateCharacterAnimation(movingX, this.isCharGrounded);
    }
    
    /**
     * Update character animation based on movement state
     * @param isMoving - Whether the character is moving horizontally
     * @param isGrounded - Whether the character is on the ground
     */
    private updateCharacterAnimation(isMoving: boolean, isGrounded: boolean): void {
        if (!isGrounded) {
            // Could add jumping/falling animation here if available
            return;
        }
        
        const targetAnim = isMoving ? 'char1Run' : 'char1Idle';
        if (this.char1.anims.getName() !== targetAnim) {
            this.char1.play(targetAnim);
        }
    }

    /**
     * Scene transition to game over
     */
    changeScene() {
        this.scene.start('GameOver');
    }
    
    /**
     * Handle wallet disconnect request from the game
     * Sends a disconnect request event to the wallet provider
     */
    private handleWalletDisconnect(): void {
        // Show feedback to the user
        this.messageManager.show('Disconnecting wallet...');
        
        // Emit event to the EventBus which will be handled by the WalletContext
        EventBus.emit('game-disconnect-request');
    }
    
    /**
     * Start cooldown for an interactive object with visual feedback
     * @param object - The game object to apply visual feedback to
     * @param cooldownProperty - Which cooldown property to update
     * @param isError - Whether this is an error cooldown (shorter duration)
     */
    private startCooldown(
        object: Phaser.GameObjects.Image,
        cooldownProperty: 'transferCooldown' | 'signCooldown',
        isError: boolean = false
    ): void {
        // Set the appropriate cooldown duration
        const duration = isError ? 
            this.config.wallet.cooldowns.error :
            this.config.wallet.cooldowns.normal;
            
        // Set cooldown timer
        this[cooldownProperty] = this.time.now + duration;
        
        // Visual feedback - tint the object
        object.setTint(0x999999);
        
        // Reset tint after cooldown period
        this.time.delayedCall(duration, () => {
            if (object) {
                object.clearTint();
            }
        });
    }
    
    /**
     * Handle wallet transfer when character collides with transfer espace
     * Initiates a blockchain transaction when player interacts with transfer object
     */
    private handleTransfer(): void {
        // Check if cooldown is active
        if (this.transferCooldown > 0) {
            // Still in cooldown, don't trigger transaction
            return;
        }
        
        // Check if walletClient is available
        if (!this.walletClient || !this.walletClient.account) {
            this.messageManager.show('No wallet connected! Please connect your wallet.');
            return;
        }
        
        // Start cooldown with visual feedback
        this.startCooldown(this.transferEspace, 'transferCooldown');
        
        try {
            
            // Show message that we're trying to transfer
            this.messageManager.show('Initiating transfer of 0.001 CFX...');
            
            // Verify wallet address is available
            const toAddress = this.walletClient.account.address;
            
            // Attempt to send a transaction using the wallet client
            this.walletClient.sendTransaction({
                account: this.walletClient.account, // Required account parameter
                chain: null, // Specify null chain to use the default
                to: toAddress, // Send to self as example
                value: this.config.wallet.transactionAmount, // 0.001 CFX in wei (from config)
            })
            .then((txHash: string) => {
                // Just replace message without clearing - ensures smooth transition
                this.messageManager.show(`Transaction sent!\nTx: ${txHash.slice(0, 10)}...`);
                console.log('Transaction hash:', txHash);
            })
            .catch((error: Error | unknown) => {
                // Convert to a standard error message
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                
                // Just replace message without clearing - ensures smooth transition
                this.messageManager.show(`Transaction failed: ${errorMessage}`);
                console.error('Transaction error:', error);
                // Reset cooldown on error so user can try again sooner
                this.startCooldown(this.transferEspace, 'transferCooldown', true);
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.messageManager.show(`Error: ${errorMessage}`);
            console.error('Transfer error:', error);
            // Reset cooldown on error
            this.startCooldown(this.transferEspace, 'transferCooldown', true);
        }
    }
    
    /**
     * Handle signature request when character collides with sign espace
     * Requests message signing from connected wallet
     */
    private handleSign(): void {
        // Check if cooldown is active
        if (this.signCooldown > 0) {
            // Still in cooldown, don't trigger signing
            return;
        }
        
        // Check if walletClient is available
        if (!this.walletClient || !this.walletClient.account) {
            this.messageManager.show('No wallet connected! Please connect your wallet.');
            return;
        }
        
        // Start cooldown with visual feedback
        this.startCooldown(this.signEspace, 'signCooldown');
        
        try {
            
            // Create a message to sign with nonce for security
            const nonce = Math.floor(Math.random() * 1000000);
            const message = `Conflux Phaser Game\nVerifying wallet: ${this.walletClient.account.address}\nTimestamp: ${Date.now()}\nNonce: ${nonce}`;
            
            // Show message that we're trying to sign
            this.messageManager.show('Please sign the message in your wallet...');
            
            // Request signature using the wallet client
            this.walletClient.signMessage({ 
                message,
                account: this.walletClient.account // Required account parameter
            })
                .then((signature: string) => {
                    // Show success message (replaces current message)
                    this.messageManager.show(`Message signed!\nSig: ${signature.slice(0, 10)}...`);
                    console.log('Signature:', signature);
                })
                .catch((error: Error | unknown) => {
                    // Convert to a standard error message
                    const errorMessage = error instanceof Error ? error.message : 'User rejected';
                    
                    // Show error message (replaces current message)
                    this.messageManager.show(`Signing failed: ${errorMessage}`);
                    console.error('Signature error:', error);
                    // Reset cooldown on error so user can try again sooner
                    this.startCooldown(this.signEspace, 'signCooldown', true);
                });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.messageManager.show(`Error: ${errorMessage}`);
            console.error('Signing error:', error);
            // Reset cooldown on error
            this.startCooldown(this.signEspace, 'signCooldown', true);
        }
    }
}
