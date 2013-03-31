function TiledCanvas(container) {
    'use strict';

    if ((this instanceof TiledCanvas) === false) {
        return new TiledCanvas(container);
    }


    function Tile(dx, dy, width, height, zIndex) {
        if ((this instanceof Tile) === false) {
            return new Tile(dx, dy, width, height);
        }

        // Create small canvas as part of tile
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

        // Make sure that all parameters have proper type and value
        width = parseInt(width, 10);
        height = parseInt(height, 10);
        dx = parseInt(dx, 10);
        dy = parseInt(dy, 10);
        zIndex = parseInt(zIndex, 10);

        if (width <= 0 || height <= 0) {
            throw new Error('Width and height of canvas tile must be positive');
        }

        // Set visual style of canvas element
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.style.position = 'absolute';
        canvas.style.padding = 0;
        canvas.style.left = dx + 'px';
        canvas.style.top = dy + 'px';
        canvas.style.zIndex = zIndex;

        this.drawImage = function (img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh) {
            if (dx === undefined && dy === undefined && dw === undefined && dh === undefined) {
                dx_or_sx -= dx;
                dy_or_sy -= dy;
            } else {
                dx -= dx;
                dy -= dy;
            }

            ctx.drawImage(img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh);
        };


        this.getCanvas = function () {
            return canvas;
        };


        this.getCtx = function () {
            return ctx;
        };
    }


    function Layer(container, name, zIndex, tileWidth, tileHeight) {
        if ((this instanceof Layer) === false) {
            return new Layer(container, name, zIndex, tileWidth, tileHeight);
        }

        if ((container instanceof HTMLElement) === false) {
            throw new Error('Container must be an instance of HTMLElement');
        }

        if (typeof name !== 'string' || name.length === 0) {
            throw new Error('Invalid name of the Layer: ' + name);
        }

        if (tileWidth === undefined) {
            tileWidth = 100;
        }

        if (tileHeight === undefined) {
            tileHeight = 100;
        }

        zIndex = parseInt(zIndex, 10);
        tileWidth = parseInt(tileWidth, 10);
        tileHeight = parseInt(tileHeight, 10);

        if (tileWidth <= 0 || tileHeight <= 0) {
            throw new Error('Width and height of the tile must be positive');
        }

        if (container.style.position === 'static' || container.style.position === '') {
            container.style.position = 'relative';
        }
        container.style.overflow = 'hidden';

        var tileSize = {
                x: Math.ceil(container.clientWidth / tileWidth),
                y: Math.ceil(container.clientHeight / tileHeight)
            },
            tiles = [],
            i = 0,
            j = 0,
            limitI = tileSize.x,
            limitJ = tileSize.y;

        for (j = 0; j < limitJ; j++) {
            for (i = 0; i < limitI; i++) {
                if (tiles[zIndex] === undefined) {
                    tiles[zIndex] = [];
                }
                if (tiles[zIndex][j] === undefined) {
                    tiles[zIndex][j] = [];
                }
                if (tiles[zIndex][j][i] === undefined) {
                    tiles[zIndex][j][i] = [];
                }

                tiles[zIndex][j][i] = new Tile(i * tileWidth, j * tileHeight, tileWidth, tileHeight, zIndex);
                container.appendChild(tiles[zIndex][j][i].getCanvas());
            }
        }


        this.destroy = function () {
            for (j = 0; j < limitJ; j++) {
                for (i = 0; i < limitI; i++) {
                    if (tiles[zIndex] === undefined) {
                        tiles[zIndex] = [];
                    }
                    if (tiles[zIndex][j] === undefined) {
                        tiles[zIndex][j] = [];
                    }
                    if (tiles[zIndex][j][i] === undefined) {
                        tiles[zIndex][j][i] = [];
                    }

                    container.removeChild(tiles[zIndex][j][i]);
                }
            }
        };


        this.drawImage = function (img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh) {
            var tileStart = [0, 0],
                tileStop = [0, 0];
            if (dx === undefined && dy === undefined && dw === undefined && dh === undefined) {

            } else {

            }

            //ctx.drawImage(img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh);
        };
    }

    if ((container instanceof HTMLElement) === false) {
        throw new Error('Container must be an instance of HTMLElement');
    }

    var layers = {},
        configuration = {
            tile: {
                width: 100,
                height: 100
            }
        },
        highestLayerIndex = 0;


    this.addLayer = function (name, zIndex, tileWidth, tileHeight) {
        if (typeof name !== 'string' || name.length === 0) {
            throw new Error('Invalid name of the Layer: ' + name);
        }

        if ((layers[name] instanceof Layer) === true) {
            layers[name].destroy();
            delete layers[name];
        }

        if (zIndex === undefined) {
            highestLayerIndex += 1;
            zIndex = highestLayerIndex;
        } else {
            zIndex = parseInt(zIndex, 10);
            if (highestLayerIndex < zIndex) {
                highestLayerIndex = zIndex;
            }
        }

        layers[name] = new Layer(container, name, zIndex, (tileWidth === undefined) ? configuration.tile.width : tileWidth, (tileHeight === undefined) ? configuration.tile.height : tileHeight);

        return this;
    };

    this.getLayer = function (name) {
        return ((layers[name] instanceof Layer) === false) ? layers : layer[name];
    }
}