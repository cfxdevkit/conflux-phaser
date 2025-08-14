/**
 * Game configuration with centralized parameters
 * Use this for easy configuration and tuning of game values
 */
export interface GameConfig {
    player: {
        moveSpeed: number;
        jumpForce: number;
        gravity: number;
        drag: number;
        bounce: number;
    };
    wallet: {
        cooldowns: {
            normal: number;
            error: number;
        };
        transactionAmount: bigint;
        messageDuration: number;
    };
    ui: {
        messageDisplayTime: number;
    };
}

/**
 * Default game configuration
 */
export const DEFAULT_GAME_CONFIG: GameConfig = {
    player: {
        moveSpeed: 150,
        jumpForce: 250,
        gravity: 300,
        drag: 500,
        bounce: 0.1
    },
    wallet: {
        cooldowns: {
            normal: 5000,  // 5 seconds
            error: 1000    // 1 second
        },
        transactionAmount: BigInt(1000000000000000), // 0.001 CFX in wei
        messageDuration: 4000
    },
    ui: {
        messageDisplayTime: 4000
    }
};
