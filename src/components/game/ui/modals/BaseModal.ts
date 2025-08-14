// import { Scene, GameObjects } from 'phaser';
// import { GenericButton } from '../buttons/GenericButton';

// export class BaseModal extends GameObjects.Container {
//     protected background: Phaser.GameObjects.Graphics;
//     protected confirmButton: Phaser.GameObjects.Container;
//     protected cancelButton: Phaser.GameObjects.Container;
//     protected modalWidth: number; // Default modal width
//     protected modalHeight: number; // Default modal height
//     private static readonly TOP_DEPTH = 1000; // Arbitrarily high depth to ensure it's on top

//     constructor(
//         scene: Scene,
//         x: number,
//         y: number,
//         onConfirm: (() => void) | null = null,
//         onCancel: (() => void) | null = null,
//         modalWidth: number = 800,
//         modalHeight: number = 600,
//     ) {
//         super(scene, x, y);
//         this.modalWidth = modalWidth;
//         this.modalHeight = modalHeight;
//         this.createBackground();
//         if(onConfirm && onCancel) {
//             this.createButtons(onConfirm, onCancel);
//         }

//         // Set the modal to an extremely high depth to ensure it's always on top
//         this.setDepth(BaseModal.TOP_DEPTH);

//         this.setVisible(false);
//         scene.add.existing(this);
//     }

//     // Create background with rounded rectangle for modal
//     protected createBackground() {
//         this.background = this.scene.add.graphics();
//         this.background.fillStyle(0x000000, 0.8);
//         this.background.fillRoundedRect(
//             -this.modalWidth / 2, // x position (centered)
//             -this.modalHeight / 2, // y position (centered)
//             this.modalWidth, // width
//             this.modalHeight, // height
//             20 // corner radius for rounding
//         );

//         this.background.setInteractive(
//             new Phaser.Geom.Rectangle(
//                 -this.modalWidth / 2, 
//                 -this.modalHeight / 2, 
//                 this.modalWidth, 
//                 this.modalHeight
//             ),
//             Phaser.Geom.Rectangle.Contains
//         );

//         this.add(this.background);
//     }

//     // Create Confirm and Cancel buttons
//     protected createButtons(onConfirm: () => void, onCancel: () => void) {
//         const buttonWidth = 160;
//         const buttonHeight = 50;
//         const buttonSpacing = 20; // Space between the buttons
//         const bottomOffset = 40; // Distance from the bottom of the modal

//         // Position the buttons dynamically based on the modal size
//         const buttonY = this.modalHeight / 2 - bottomOffset - buttonHeight / 2;
//         const confirmButtonX = buttonWidth / 2 + buttonSpacing / 2;
//         const cancelButtonX = -(buttonWidth / 2 + buttonSpacing / 2);

//         this.confirmButton = new GenericButton(this.scene, confirmButtonX, buttonY, 'Confirm', onConfirm, 0x00ff00, 0x00ff00, buttonWidth, buttonHeight);
//         this.cancelButton = new GenericButton(this.scene, cancelButtonX, buttonY, 'Cancel', onCancel, 0xff0000, 0xff0000, buttonWidth, buttonHeight);

//         this.add(this.cancelButton);
//         this.add(this.confirmButton);
//     }

//     // Method to show the modal
//     public show() {
//         this.setVisible(true);
//         // Ensure it's always on top when shown
//         this.setDepth(BaseModal.TOP_DEPTH);
//     }

//     // Method to hide the modal
//     public hide() {
//         this.setVisible(false);
//     }
// }
