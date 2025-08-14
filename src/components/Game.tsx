import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import StartGame from './game/main';
import { EventBus } from './game/EventBus';
import { styles } from '../styles/layoutStyles';
import { styleCanvas, createResizeHandler } from '../utils/canvasUtils';

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IProps {
    currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame({ currentActiveScene }, ref) {
    const game = useRef<Phaser.Game | null>(null);
    const { openConnectModal } = useConnectModal();
    const initialized = useRef(false);

    // Listen for Phaser event to open wallet modal
    useEffect(() => {
        const handler = () => {
            if (openConnectModal) openConnectModal();
        };
        EventBus.on('phaser-connect-wallet', handler);
        return () => {
            EventBus.removeListener('phaser-connect-wallet', handler);
        };
    }, [openConnectModal]);

    // Game initialization effect
    useLayoutEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            game.current = StartGame("game-container");

            // Add resize handler to ensure proper canvas scaling
            const handleResize = createResizeHandler(game.current);
            window.addEventListener('resize', handleResize);
            
            // Initial styling and resize
            styleCanvas();
            handleResize();

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    // Update ref when game changes
    useEffect(() => {
        if (game.current && ref) {
            if (typeof ref === 'function') {
                ref({ game: game.current, scene: null });
            } else {
                ref.current = { game: game.current, scene: null };
            }
        }
    }, [ref]);

    // Listen for scene changes
    useEffect(() => {
        const sceneChangeHandler = (scene_instance: Phaser.Scene) => {
            if (currentActiveScene) {
                currentActiveScene(scene_instance);
            }
            if (ref) {
                if (typeof ref === 'function') {
                    ref({ game: game.current, scene: scene_instance });
                } else {
                    ref.current = { game: game.current, scene: scene_instance };
                }
            }
        };

        EventBus.on('current-scene-ready', sceneChangeHandler);
        
        return () => {
            EventBus.removeListener('current-scene-ready', sceneChangeHandler);
        };
    }, [currentActiveScene, ref]);

    return <div id="game-container" style={styles.gameContainer} />;
});

const Game = () => {
    return <PhaserGame />;
};

export default Game;
