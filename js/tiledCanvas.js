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
        highestLayerIndex = 0;

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
            console.log(canvas);
            if (dx === undefined && dy === undefined && dw === undefined && dh === undefined) {
                dx_or_sx -= canvasDx;
                dy_or_sy -= canvasDy;
                ctx.drawImage(img_elem, 0, 0, (dw_or_sw > img_elem.naturalWidth) ? img_elem.naturalWidth : dw_or_sw, (dh_or_sh > img_elem.naturalHeight) ? img_elem.naturalHeight : dh_or_sh, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh);
            } else {
                dx -= canvasDx;
                dy -= canvasDy;
                ctx.drawImage(img_elem, (dw_or_sw > img_elem.naturalWidth) ? img_elem.naturalWidth : dw_or_sw, (dh_or_sh > img_elem.naturalHeight) ? img_elem.naturalHeight : dh_or_sh, dw_or_sw, dh_or_sh, dx, dy, dw, dh);
            }

            return this;
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


        this.drawImage = function (img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh) {
            var tileStart = [0, 0],
                tileStop = [0, 0],
                i = 0,
                j = 0;

            if (dx === undefined && dy === undefined && dw === undefined && dh === undefined) {
                if (dw_or_sw === undefined && dh_or_sh === undefined) {
                    dw_or_sw = img_elem.clientWidth;
                    dh_or_sh = img_elem.clientHeight;
                }
                tileStart = [
                    Math.floor(dx_or_sx / tileWidth),
                    Math.floor(dy_or_sy / tileHeight)
                ];
                tileStop = [
                    Math.ceil((dx_or_sx + dw_or_sw) / tileWidth),
                    Math.ceil((dy_or_sy + dh_or_sh) / tileHeight)
                ];
            }

            for (j = tileStart[1]; j < tileStop[1]; j++) {
                for (i = tileStart[0]; i < tileStop[0]; i++) {
                    if ((tiles[j] !== undefined) && (tiles[j][i] instanceof Tile) === true) {
                        //console.log(tiles[j][i].getCanvas().style.background = 'red');
                        tiles[j][i].drawImage(img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh);
                    }
                }
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

        return this;
    };

    this.getLayer = function (name) {
        return ((layers[name] instanceof Layer) === false) ? layers : layers[name];
    };
}