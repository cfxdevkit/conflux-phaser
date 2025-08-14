# Conflux Phaser RainbowKit Integration

This project integrates Phaser game engine with RainbowKit for blockchain wallet connectivity on the Conflux network. It provides a complete framework for developing blockchain-powered games that can interact with the Conflux blockchain.

## Project Structure

```
/src
  /components
    /game               # Phaser game implementation
      /plugins          # Custom Phaser plugins
      /scenes           # Game scenes (Menu, Game, etc.)
      /ui               # Game UI components
      EventBus.ts       # Event communication system
      main.ts           # Game initialization
    Game.tsx            # React wrapper for Phaser game
    WalletConnect.tsx   # RainbowKit/Wagmi configuration
  /contexts
    WalletContext.tsx   # Wallet state management
  /styles
    layoutStyles.ts     # Application layout styles
  /utils
    canvasUtils.ts      # Canvas manipulation utilities
  App.tsx               # Main application component
  main.tsx              # Application entry point
```

## Features

- **RainbowKit Integration**: Easy wallet connection with a beautiful UI
- **Conflux Network Support**: Configured for Conflux eSpace
- **Responsive Game Canvas**: Properly scales on different screen sizes
- **Event-based Communication**: EventBus for communication between React and Phaser
- **Clean Separation of Concerns**: React handles UI and wallet connectivity, Phaser handles game rendering and logic

## Architecture

The application uses a layered architecture:

1. **React Layer**: Handles UI components, wallet connectivity, and application state
2. **Integration Layer**: EventBus and utility functions provide communication between React and Phaser
3. **Game Layer**: Phaser handles all game rendering, animation, and game-specific logic

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Wallet Integration

The wallet integration works through events:

1. User connects wallet through RainbowKit UI
2. React components detect wallet state changes
3. Events are emitted through EventBus to Phaser
4. Phaser game responds to wallet connection/disconnection events
5. Game features can be unlocked based on wallet state

## Game Customization

To customize the game, focus on:

- `src/components/game/scenes/` - Add or modify game scenes
- `src/components/game/main.ts` - Configure the Phaser game instance
- `src/utils/canvasUtils.ts` - Adjust canvas styling and resizing behavior
```
