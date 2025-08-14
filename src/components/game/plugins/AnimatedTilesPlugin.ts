import 'phaser';

interface AnimatedTileData {
    index: number;
    frames: Array<{ duration: number; tileid: number }>;
    currentFrame: number;
    tiles: Phaser.Tilemaps.Tile[][];
    rate: number;
    next: number;
}

interface MapAnimData {
    map: Phaser.Tilemaps.Tilemap;
    animatedTiles: AnimatedTileData[];
    active: boolean;
    rate: number;
    activeLayer: boolean[];
}

export const Events = {
    TILE_ANIMATION_UPDATE: 'tileanimationupdate'
};

declare module 'phaser' {
    interface Scene {
        animatedTiles: AnimatedTilesPlugin;
    }
}

export class AnimatedTilesPlugin extends Phaser.Plugins.ScenePlugin {
    // private map: Phaser.Tilemaps.Tilemap | null = null;
    private animatedTiles: MapAnimData[] = [];
    private rate: number = 1;
    private active: boolean = false;
    private activeLayer: boolean[] = [];
    private followTimeScale: boolean = true;

    constructor(scene: Phaser.Scene, pluginManager: Phaser.Plugins.PluginManager) {
        super(scene, pluginManager, 'AnimatedTiles');

        if (!scene.sys.settings.isBooted) {
            scene.sys.events.once('boot', this.boot, this);
        }
    }

    boot(): void {
        const eventEmitter = this.systems?.events;
        if (eventEmitter) {
            eventEmitter.on('postupdate', this.postUpdate, this);
            eventEmitter.on('shutdown', this.shutdown, this);
            eventEmitter.on('destroy', this.destroy, this);
        }
    }

    init(map: Phaser.Tilemaps.Tilemap): void {
        const mapAnimData = this.getAnimatedTiles(map);
        const animatedTiles: MapAnimData = {
            map: map,
            animatedTiles: mapAnimData,
            active: true,
            rate: 1,
            activeLayer: []
        };
        
        map.layers.forEach(() => {
            animatedTiles.activeLayer.push(true);
        });
        
        this.animatedTiles.push(animatedTiles);
        
        if (this.animatedTiles.length === 1) {
            this.active = true;
        }
    }

    setRate(rate: number, gid: number | null = null, map: number | null = null): void {
        if (gid === null) {
            if (map === null) {
                this.rate = rate;
            } else {
                this.animatedTiles[map].rate = rate;
            }
        } else {
            const loopThrough = (animatedTiles: AnimatedTileData[]) => {
                animatedTiles.forEach((animatedTile) => {
                    if (animatedTile.index === gid) {
                        animatedTile.rate = rate;
                    }
                });
            };
            
            if (map === null) {
                this.animatedTiles.forEach((animatedTiles) => {
                    loopThrough(animatedTiles.animatedTiles);
                });
            } else {
                loopThrough(this.animatedTiles[map].animatedTiles);
            }
        }
    }

    resume(layerIndex: number | null = null, mapIndex: number | null = null): void {
        if (mapIndex === null) {
            if (layerIndex === null) {
                this.active = true;
            } else {
                this.activeLayer[layerIndex] = true;
                this.animatedTiles.forEach(mapData => {
                    mapData.animatedTiles.forEach((animatedTile: AnimatedTileData) => {
                        this.updateLayer(animatedTile, animatedTile.tiles[layerIndex]);
                    });
                });
            }
        } else {
            const mapData = this.animatedTiles[mapIndex];
            if (layerIndex === null) {
                mapData.active = true;
            } else {
                mapData.activeLayer[layerIndex] = true;
                mapData.animatedTiles.forEach((animatedTile: AnimatedTileData) => {
                    this.updateLayer(animatedTile, animatedTile.tiles[layerIndex]);
                });
            }
        }
    }

    pause(layerIndex: number | null = null, mapIndex: number | null = null): void {
        if (mapIndex === null) {
            if (layerIndex === null) {
                this.active = false;
            } else {
                this.activeLayer[layerIndex] = false;
            }
        } else {
            const mapData = this.animatedTiles[mapIndex];
            if (layerIndex === null) {
                mapData.active = false;
            } else {
                mapData.activeLayer[layerIndex] = false;
            }
        }
    }

    postUpdate(_time: number, delta: number): void {
        if (!this.active || !this.scene) return;

        let animationTriggered = false;
        const globalElapsedTime = delta * this.rate * (this.followTimeScale ? this.scene.time.timeScale : 1);

        this.animatedTiles.forEach((mapAnimData) => {
            if (!mapAnimData.active) return;

            const elapsedTime = globalElapsedTime * mapAnimData.rate;
            mapAnimData.animatedTiles.forEach((animatedTile: AnimatedTileData) => {
                animatedTile.next -= elapsedTime * animatedTile.rate;

                if (animatedTile.next < 0) {
                    const currentIndex = animatedTile.currentFrame;
                    const oldTileId = animatedTile.frames[currentIndex].tileid;
                    let newIndex = currentIndex + 1;

                    if (newIndex > animatedTile.frames.length - 1) {
                        newIndex = 0;
                    }

                    animatedTile.next = animatedTile.frames[newIndex].duration;
                    animatedTile.currentFrame = newIndex;

                    animatedTile.tiles.forEach((layer, layerIndex) => {
                        if (!mapAnimData.activeLayer[layerIndex]) return;
                        this.updateLayer(animatedTile, layer, oldTileId);
                    });

                    animationTriggered = true;
                }
            });
        });

        if (animationTriggered && this.scene.events) {
            this.scene.events.emit(Events.TILE_ANIMATION_UPDATE);
        }
    }

    private updateLayer(animatedTile: AnimatedTileData, layer: Phaser.Tilemaps.Tile[], oldTileId: number = -1): void {
        const tilesToRemove: Phaser.Tilemaps.Tile[] = [];
        const tileId = animatedTile.frames[animatedTile.currentFrame].tileid;

        layer.forEach((tile) => {
            if (oldTileId > -1 && (tile === null || tile.index !== oldTileId)) {
                tilesToRemove.push(tile);
            } else {
                tile.index = tileId;
            }
        });

        tilesToRemove.forEach((tile) => {
            const pos = layer.indexOf(tile);
            if (pos > -1) {
                layer.splice(pos, 1);
            }
        });
    }

    private getAnimatedTiles(map: Phaser.Tilemaps.Tilemap): AnimatedTileData[] {
        const animatedTiles: AnimatedTileData[] = [];

        map.tilesets.forEach((tileset) => {
            const tileData = tileset.tileData as Record<string, { 
                animation?: Array<{ duration: number; tileid: number }> 
            }>;
            
            Object.keys(tileData).forEach((index) => {
                const idx = parseInt(index);
                const tileInfo = tileData[index];
                if (tileInfo && tileInfo.animation) {
                    const animatedTileData: AnimatedTileData = {
                        index: idx + tileset.firstgid,
                        frames: [],
                        currentFrame: 0,
                        tiles: [],
                        rate: 1,
                        next: 0
                    };

                    const animation = tileData[index]?.animation;
                    if (animation) {
                        animation.forEach((frameData: { duration: number; tileid: number }) => {
                            animatedTileData.frames.push({
                                duration: frameData.duration,
                                tileid: frameData.tileid + tileset.firstgid
                            });
                        });
                    }

                    animatedTileData.next = animatedTileData.frames[0].duration;
                    animatedTileData.currentFrame = animatedTileData.frames.findIndex(
                        (f) => f.tileid === idx + tileset.firstgid
                    );

                    map.layers.forEach((layer) => {
                        // In newer Phaser versions, all layers are dynamic by default
                        if (!layer || !layer.tilemapLayer) {
                            animatedTileData.tiles.push([]);
                            return;
                        }

                        const tiles: Phaser.Tilemaps.Tile[] = [];
                        if (layer.data) {
                            layer.data.forEach((tileRow: Phaser.Tilemaps.Tile[]) => {
                                tileRow.forEach((tile) => {
                                    if (tile && tile.index && tile.index - tileset.firstgid === idx) {
                                        tiles.push(tile);
                                    }
                                });
                            });
                        }

                        animatedTileData.tiles.push(tiles);
                    });

                    animatedTiles.push(animatedTileData);
                }
            });
        });

        map.layers.forEach((_layer, layerIndex) => {
            this.activeLayer[layerIndex] = true;
        });

        return animatedTiles;
    }

    shutdown(): void {
        // Cleanup code here
    }

    destroy(): void {
        this.shutdown();
        super.destroy();
    }

    static register(): void {
        // This plugin is registered via the game config
    }
}
