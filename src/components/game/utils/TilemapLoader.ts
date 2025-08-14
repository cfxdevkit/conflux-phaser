import { Scene } from 'phaser';

interface CollisionConfig {
  layer: string; // Layer name to enable collision on
  tiles?: number[]; // Specific tile indices to enable collision on
}

interface TilemapConfig {
  key: string;
  tilesets: {
    name: string; // The name of the tileset in the Tiled map
    key: string;  // The key used when loading the image in the preloader
    offset?: Phaser.Math.Vector2; // Optional offset for tileset positioning
  }[];
  layers?: string[]; // Optional array of layer names to create, if not provided all layers will be created
  backgroundColor?: string; // Optional background color
  animated?: boolean; // Whether to initialize animated tiles
  collision?: CollisionConfig | CollisionConfig[]; // Optional collision configuration for single or multiple layers
}

/**
 * Utility class for loading and managing Phaser tilemaps
 */
export class TilemapLoader {
  /**
   * Create a tiled background using a repeating texture
   * 
   * @param scene The Phaser scene
   * @param textureKey The texture key to use for the background
   * @param depth Optional depth value for the background (default: -1)
   * @returns The created TileSprite
   */
  static createTiledBackground(
    scene: Scene, 
    textureKey: string, 
    depth: number = -1
  ): Phaser.GameObjects.TileSprite {
    // Create a tiled sprite that efficiently tiles the texture across the entire screen
    const background = scene.add.tileSprite(
      0, 0,                       // Position (x, y)
      scene.cameras.main.width,   // Width - fill screen width
      scene.cameras.main.height,  // Height - fill screen height
      textureKey                  // Texture key
    );
    
    background.setOrigin(0, 0);   // Set origin to top-left
    background.setDepth(depth);   // Put behind everything else
    
    return background;
  }

  /**
   * Load and setup a tilemap with its tilesets and layers
   * 
   * @param scene The Phaser scene
   * @param config The tilemap configuration
   * @returns The created tilemap or null if loading failed
   */
  static loadTilemap(scene: Scene, config: TilemapConfig): Phaser.Tilemaps.Tilemap | null {
    // Create the tilemap
    const map = scene.make.tilemap({ key: config.key });
    if (!map) {
      console.error(`Failed to create tilemap with key: ${config.key}`);
      return null;
    }

    // Add all tilesets
    const tilesetObjects: Record<string, Phaser.Tilemaps.Tileset> = {};
    let allTilesetsLoaded = true;

    for (const tileset of config.tilesets) {
      const tilesetObj = map.addTilesetImage(tileset.name, tileset.key);
      
      if (!tilesetObj) {
        console.warn(`Failed to add tileset: ${tileset.name} with key: ${tileset.key}`);
        allTilesetsLoaded = false;
        continue;
      }

      // Apply offset if provided
      if (tileset.offset) {
        tilesetObj.tileOffset = tileset.offset;
      }

      tilesetObjects[tileset.name] = tilesetObj;
    }

    if (!allTilesetsLoaded) {
      console.warn('Some tilesets failed to load. Layers may not render correctly.');
    }

    // Create layers and store them
    const tilesetArray = Object.values(tilesetObjects);
    const layers: Record<string, Phaser.Tilemaps.TilemapLayer> = {};
    
    if (config.layers && config.layers.length > 0) {
      // Create only specified layers
      for (const layerName of config.layers) {
        const layer = map.createLayer(layerName, tilesetArray);
        if (layer) {
          layers[layerName] = layer;
        }
      }
    } else {
      // Create all layers
      for (const layerData of map.layers) {
        if (layerData.name) {
          const layer = map.createLayer(layerData.name, tilesetArray);
          if (layer) {
            layers[layerData.name] = layer;
          }
        }
      }
    }

    // Set up collision if configured
    if (config.collision) {
      // Convert to array for consistent handling
      const collisionConfigs = Array.isArray(config.collision) 
        ? config.collision 
        : [config.collision];
      
      // Process each collision config
      for (const collisionConfig of collisionConfigs) {
        if (layers[collisionConfig.layer]) {
          const collisionLayer = layers[collisionConfig.layer];
          
          if (collisionConfig.tiles && collisionConfig.tiles.length > 0) {
            // Enable collision for specific tiles
            collisionLayer.setCollision(collisionConfig.tiles, true);
          } else {
            // Enable collision for all tiles in the layer
            collisionLayer.setCollisionByExclusion([-1], true);
          }
        }
      }
    }

    // Initialize animated tiles if requested and available
    if (config.animated && 'animatedTiles' in scene) {
      // Use type assertion with unknown as an intermediate step
      const sceneWithPlugin = scene as unknown as {
        animatedTiles: { init: (map: Phaser.Tilemaps.Tilemap) => void }
      };
      
      // Now use the properly typed object
      sceneWithPlugin.animatedTiles.init(map);
    }

    return map;
  }

  /**
   * Add physics to a game object and make it collide with one or more tilemap layers
   * 
   * @param scene The Phaser scene
   * @param gameObject The game object to add physics to
   * @param map The tilemap to collide with
   * @param layerNames A single layer name or array of layer names to collide with
   * @param bounceX The bounce factor on X axis (default: 1)
   * @param bounceY The bounce factor on Y axis (default: 1)
   * @param collideWorldBounds Whether to collide with world bounds (default: true)
   */
  static addPhysicsToGameObject(
    scene: Scene, 
    gameObject: Phaser.GameObjects.GameObject, 
    map: Phaser.Tilemaps.Tilemap | null,
    layerNames: string | string[],
    bounceX: number = 1,
    bounceY: number = 1,
    collideWorldBounds: boolean = true
  ): void {
    if (!map) return;

    // Enable physics on the game object
    scene.physics.world.enable(gameObject);
    
    const body = gameObject.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // Set physics properties
    body.setBounce(bounceX, bounceY);
    body.setCollideWorldBounds(collideWorldBounds);

    // Handle both single layer name and array of layer names
    const layerNamesArray = Array.isArray(layerNames) ? layerNames : [layerNames];
    
    // Add colliders for each specified layer
    for (const layerName of layerNamesArray) {
      const layer = map.getLayer(layerName);
      if (layer && layer.tilemapLayer) {
        // Add collision between the game object and the layer
        scene.physics.add.collider(gameObject, layer.tilemapLayer);
      }
    }
  }

  /**
   * Load the specific tilemap configuration used in the MainMenu scene
   * 
   * @param scene The Phaser scene
   * @param enableCollision Whether to enable collision on the tilemap (default: true)
   * @returns The created tilemap
   */
  static loadDemoTilemap(scene: Scene, enableCollision: boolean = true): Phaser.Tilemaps.Tilemap | null {
    // Create the tiled background first
    this.createTiledBackground(scene, '1');

    // Configure and load the demo tilemap
    return this.loadTilemap(scene, {
      key: 'demo',
      tilesets: [
        { 
          name: 'Flag_Idle', 
          key: 'Flag_Idle',
          offset: new Phaser.Math.Vector2(0, 32)
        },
        { 
          name: '2', 
          key: '2',
          offset: new Phaser.Math.Vector2(0, 32)
        },
        { 
          name: 'Tileset', 
          key: 'Tileset'
        }
      ],
      layers: ['Base', 'Back'],
      animated: true,
      // Add collision configuration if enabled
      ...(enableCollision ? {
        collision: [
          { layer: 'Base' },  // Set collision on the Base layer
          { layer: 'Back' }   // Also set collision on the Back layer
        ]
      } : {})
    });
  }
}
