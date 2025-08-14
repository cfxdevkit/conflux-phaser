import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene
{
    private camera!: Phaser.Cameras.Scene2D.Camera;
    private background!: Phaser.GameObjects.Image;
    // This property is used to display the game over message
    // @@ts-expect-error - This variable is used in the create method
    protected gameOverText!: Phaser.GameObjects.Text;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.gameOverText = this.add.text(512, 384, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        // Emit scene ready events
        EventBus.emit('current-scene-ready', this);
        EventBus.emit('scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
