/**
 * Interfaces for wallet interactions
 */

/**
 * Interface defining the wallet account structure
 */
export interface WalletAccount {
    address: string;
}

/**
 * Interface for wallet transaction parameters
 */
export interface TransactionParams {
    to: string;
    value: bigint;
}

/**
 * Interface for message signing parameters
 */
export interface SignMessageParams {
    message: string;
}

