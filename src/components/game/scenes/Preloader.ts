import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        // Display the background and the loading bar
        this.add.rectangle(640, 480, 468, 32).setStrokeStyle(1, 0xffffff);

        const bar = this.add.rectangle(640 - 230, 480, 4, 28, 0xffffff);

        // Update the progress bar during asset loading
        this.load.on('progress', (progress: number) => {
            bar.width = 4 + (460 * progress);
        });
    }

    loadFont(name: string, url: string) {
        const newFont = new FontFace(name, `url(${url})`);
        newFont.load()
            .then((loaded) => {
                if (typeof document !== "undefined" && document.fonts) {
                    document.fonts.add(loaded);
                }
            })
            .catch((error) => {
                console.error(`Error loading font: ${error}`);
            });
    }

    preload() {
    // Set a consistent base path for all assets
    this.load.setPath('assets/demo');

    // Load the tilemap JSON (relative to the base path above)
    this.load.tilemapTiledJSON('demo', 'demo.json');
        // Load the tileset images - make sure to use the same key as in addTilesetImage
        this.load.image('Tileset', 'Tileset.png');
        this.load.image('1', '1.png');
        this.load.image('2', '2.png');
        this.load.image('Flag_Idle', 'Flag_Idle.png');

        // Load sound effects
        this.load.audio('button-hit', 'sounds/sfx_bump.ogg');
        this.load.audio('jump', 'sounds/sfx_jump.ogg');
        
        // Load Blue button sprites
        this.load.image('Button_Blue', 'button/Button_Blue.png');
        this.load.image('Button_Blue_3Slides', 'button/Button_Blue_3Slides.png');
        this.load.image('Button_Blue_3Slides_Pressed', 'button/Button_Blue_3Slides_Pressed.png');
        this.load.image('Button_Blue_9Slides', 'button/Button_Blue_9Slides.png');
        this.load.image('Button_Blue_9Slides_Pressed', 'button/Button_Blue_9Slides_Pressed.png');
        this.load.image('Button_Blue_Pressed', 'button/Button_Blue_Pressed.png');

        this.load.aseprite({
            key: 'char1',
            textureURL: 'char1.png',
            atlasURL: 'char1.json'
        });

        // Load custom fonts and plugins
        this.loadFont('monoBold', 'assets/RobotoMono-Bold.ttf');

        // // Load other game assets - carefully scaled to similar visual sizes
        this.load.image('phaser', 'phaser-planet-web.png'); // Will scale in MainMenu.ts
        this.load.svg('vite', 'vite.svg', { scale: 3 });
        this.load.svg('react', 'react.svg', { scale: 3 });
        this.load.svg('espace', 'espace.svg', { scale: 6 }); // Larger scale for espace
    }

    create() {
        // Start the MainMenu and Menu scenes
        // Create animations from aseprite files
        this.anims.createFromAseprite('char1');
        
        // Set loop for specific animations
        this.anims.get('char1Idle').repeat = -1;
        this.anims.get('char1Run').repeat = -1;

        this.scene.start('MainMenu');
    }

    restartGame() {
        if (this.scene) {
            this.shutdown();
            // Stop all active scenes before restarting
            this.scene.manager.scenes.forEach((scene) => {
                if (scene.scene.isActive()) {
                    this.scene.stop(scene.scene.key);
                }
            });
        }

        // Restart main scenes
        this.scene.start('MainMenu');
        // this.scene.launch('Menu');
    }

    handleWalletConnection() {
        // Update UI or game logic based on wallet connection
        console.log('Wallet connected');
    }

    handleWalletDisconnection() {
        this.scene.start('MainMenu');
        // this.scene.launch('Menu');

        // this.restartGame();
    }

    // Clean up event listeners when the scene shuts down
    shutdown() {
        // EventBus.off('walletConnected', this.handleWalletConnection, this);
        // EventBus.off('walletDisconnected', this.handleWalletDisconnection, this);
    }
}
