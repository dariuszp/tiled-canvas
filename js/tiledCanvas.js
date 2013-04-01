function TiledCanvas(container) {
    'use strict';

    if ((this instanceof TiledCanvas) === false) {
        return new TiledCanvas(container);
    }

    var layers = {},
        configuration = {
            tile: {
                width: 100,
                height: 100
            }
        },
        highestLayerIndex = 0,
        latestLayer;

    function Tile(canvasDx, canvasDy, width, height, zIndex) {
        if ((this instanceof Tile) === false) {
            return new Tile(canvasDx, canvasDy, width, height, zIndex);
        }

        // Create small canvas as part of tile
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

        // Make sure that all parameters have proper type and value
        width = parseInt(width, 10);
        height = parseInt(height, 10);
        canvasDx = parseInt(canvasDx, 10);
        canvasDy = parseInt(canvasDy, 10);
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
        canvas.style.left = canvasDx + 'px';
        canvas.style.top = canvasDy + 'px';
        canvas.style.zIndex = zIndex;


        this.drawImage = function (img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh) {
            if (dx === undefined && dy === undefined && dw === undefined && dh === undefined) {
                dx_or_sx -= Math.abs(canvasDx);
                dy_or_sy -= Math.abs(canvasDy);
                ctx.drawImage(img_elem, 0, 0, img_elem.naturalWidth, img_elem.naturalHeight, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh);
            } else {
                dx -= Math.abs(canvasDx);
                dy -= Math.abs(canvasDy);
                ctx.drawImage(img_elem, (dw_or_sw > img_elem.naturalWidth) ? img_elem.naturalWidth : dw_or_sw, (dh_or_sh > img_elem.naturalHeight) ? img_elem.naturalHeight : dh_or_sh, dw_or_sw, dh_or_sh, dx, dy, dw, dh);
            }

            return this;
        };


        this.clearRect = function (x, y, w, h) {
            x -= Math.abs(canvasDx);
            y -= Math.abs(canvasDy);
            ctx.clearRect(x, y, w, h);
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
                if (tiles === undefined) {
                    tiles = [];
                }
                if (tiles[j] === undefined) {
                    tiles[j] = [];
                }
                if (tiles[j][i] === undefined) {
                    tiles[j][i] = [];
                }

                tiles[j][i] = new Tile(i * tileWidth, j * tileHeight, tileWidth, tileHeight, zIndex);
                container.appendChild(tiles[j][i].getCanvas());
            }
        }


        this.destroy = function () {
            for (j = 0; j < limitJ; j++) {
                for (i = 0; i < limitI; i++) {
                    if (tiles === undefined) {
                        tiles = [];
                    }
                    if (tiles[j] === undefined) {
                        tiles[j] = [];
                    }
                    if (tiles[j][i] === undefined) {
                        tiles[j][i] = [];
                    }

                    container.removeChild(tiles[j][i]);
                }
            }

            return this;
        };


        this.getTilesToDraw = function (x, y, w, h) {
            var tileStart = [0, 0],
                tileStop = [0, 0],
                i = 0,
                j = 0,
                tilesToDraw = [];

            tileStart = [
                Math.floor(x / tileWidth),
                Math.floor(y / tileHeight)
            ];

            tileStop = [
                Math.floor((x + w) / tileWidth),
                Math.floor((y + h) / tileHeight)
            ];

            switch (true) {
            case (tileStart[0] === tileStop[0] && tileStart[1] === tileStop[1]):
                if (this.tileExist(tileStart[0], tileStart[1])) {
                    tilesToDraw.push(tiles[tileStart[1]][tileStart[0]]);
                }
                break;
            case (tileStart[0] === tileStop[0]):
                for (i = tileStart[1]; i <= tileStop[1]; i++) {
                    if (this.tileExist(tileStart[0], i)) {
                        tilesToDraw.push(tiles[i][tileStart[0]]);
                    }
                }
                break;
            case (tileStart[1] === tileStop[1]):
                for (i = tileStart[0]; i <= tileStop[0]; i++) {
                    if (this.tileExist(i, tileStart[1])) {
                        tilesToDraw.push(tiles[tileStart[1]][i]);
                    }
                }
                break;
            default:
                for (j = tileStart[1]; j <= tileStop[1]; j++) {
                    for (i = tileStart[0]; i <= tileStop[0]; i++) {
                        if (this.tileExist(i, j)) {
                            tilesToDraw.push(tiles[j][i]);
                        }
                    }
                }
            }

            return tilesToDraw;
        };


        this.tileExist = function (x, y) {
            if (tiles[y] !== undefined && (tiles[y][x] instanceof Tile) === true) {
                return true;
            }
            return false;
        };


        this.drawImage = function (img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh) {
            var tilesToDraw,
                i = 0,
                loopLimit = 0;

            if (dw_or_sw === undefined && dh_or_sh === undefined) {
                dw_or_sw = img_elem.naturalWidth;
                dh_or_sh = img_elem.naturalHeight;
            }

            if (dx === undefined && dy === undefined && dw === undefined && dh === undefined) {
                dx_or_sx = parseInt(dx_or_sx, 10);
                dy_or_sy = parseInt(dy_or_sy, 10);
                dw_or_sw = parseInt(dw_or_sw, 10);
                dh_or_sh = parseInt(dh_or_sh, 10);

                tilesToDraw = this.getTilesToDraw(dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh);
            } else {
                dx = parseInt(dx, 10);
                dy = parseInt(dy, 10);
                dw = parseInt(dw, 10);
                dh = parseInt(dh, 10);

                tilesToDraw = this.getTilesToDraw(dx, dy, dw, dh);
            }

            loopLimit = tilesToDraw.length;
            for (i = 0; i < loopLimit; i++) {
                tilesToDraw[i].drawImage(img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh);
            }

            return this;
        };


        this.clearRect = function (x, y, w, h) {
            var tilesToDraw,
                i = 0,
                loopLimit = 0;

            tilesToDraw = this.getTilesToDraw(x, y, w, h);

            loopLimit = tilesToDraw.length;
            for (i = 0; i < loopLimit; i++) {
                tilesToDraw[i].clearRect(x, y, w, h);
            }

            return this;
        };

    }

    if ((container instanceof HTMLElement) === false) {
        throw new Error('Container must be an instance of HTMLElement');
    }

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

        if (zIndex === highestLayerIndex) {
            latestLayer = layers[name];
        }

        return this;
    };


    this.getLayer = function (name) {
        return ((layers[name] instanceof Layer) === false) ? layers : layers[name];
    };


    this.drawImage = function (img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh) {
        if ((latestLayer instanceof Layer) === false) {
            throw new Error('No layers in this canvas, add at least one layer');
        }
        latestLayer.drawImage(img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh);
    };


    this.clearRect = function (x, y, w, h) {
        if ((latestLayer instanceof Layer) === false) {
            throw new Error('No layers in this canvas, add at least one layer');
        }
        latestLayer.clearRect(x, y, w, h);
    };

}