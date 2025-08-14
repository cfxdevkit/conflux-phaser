import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { AnimatedTilesPlugin } from './plugins/AnimatedTilesPlugin';
import { EventBus } from './EventBus';
// import type { WalletClient } from './utils/WalletInterfaces';
import type { WalletClient, PublicClient } from 'viem'
//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1280,
    height: 960,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 960,
        expandParent: false, // Changed to false to prevent canvas from expanding its parent
        fullscreenTarget: 'game-container',
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 200 },
            debug: false
        }
    },
    plugins: {
        scene: [
            {
                key: 'AnimatedTiles',
                plugin: AnimatedTilesPlugin,
                mapping: 'animatedTiles'
            }
        ]
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ]
};

const StartGame = (parent: string) => {
    const game = new Game({ ...config, parent });

    // Define wallet data interface
    interface WalletData {
        walletClient: WalletClient;
        publicClient: PublicClient;
    }
    
    // Define a Game type with wallet properties
    interface GameWithWallet extends Phaser.Game {
        walletClient: WalletClient;
        publicClient: PublicClient;
    }

    // Setup event listeners for wallet connections
    EventBus.on('wallet-connected', ({ walletClient, publicClient }: WalletData) => {
        // Store wallet clients in the game instance so scenes can access them
        const gameWithWallet = game as GameWithWallet;
        gameWithWallet.walletClient = walletClient;
        gameWithWallet.publicClient = publicClient;
    });

    EventBus.on('wallet-disconnected', () => {
        // Clear wallet clients
        const gameWithWallet = game as GameWithWallet;
        gameWithWallet.walletClient = null as unknown as WalletClient;
        gameWithWallet.publicClient = null as unknown as PublicClient;
    });

    return game;
}

export default StartGame;
