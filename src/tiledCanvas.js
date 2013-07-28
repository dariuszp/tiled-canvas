(function (global) {
    "use strict";

    function getLayerValue(value) {
        var intValue = parseInt(value, 10);
        if (intValue > 0) {
            return intValue;
        }
        return 100;
    }

    function extendShallow(obj, val) {
        var i;
        for (i in val) {
            if (val.hasOwnProperty(i)) {
                obj[i] = val[i];
            }
        }
        return obj;
    }

    // exports
    global.TiledCanvas = (function () {
        /**
         * @param {HTMLElement} container
         * @param {number} makeDefaultLayerTileWidth
         * @param {number} makeDefaultLayerTileHeight
         * @param {number} makeDefaultLayerTileZIndex
         * @constructor
         */
        function TiledCanvas(container, makeDefaultLayerTileWidth, makeDefaultLayerTileHeight, makeDefaultLayerTileZIndex) {
            if (!(this instanceof TiledCanvas)) {
                throw new TypeError("Invalid invocation");
            }

            if (!(container instanceof HTMLElement)) {
                throw new Error('Container must be an instance of HTMLElement');
            }

            if (makeDefaultLayerTileWidth !== undefined && makeDefaultLayerTileHeight !== undefined) {
                makeDefaultLayerTileWidth = parseInt(makeDefaultLayerTileWidth, 10);
                makeDefaultLayerTileHeight = parseInt(makeDefaultLayerTileHeight, 10);
                if (makeDefaultLayerTileWidth > 0 && makeDefaultLayerTileHeight > 0) {
                    this.addLayer('default', parseInt(makeDefaultLayerTileZIndex, 10), makeDefaultLayerTileWidth, makeDefaultLayerTileHeight);
                }
            }

            this.container = container;
            this.layers = {};
            this.highestLayerIndex = 0;
            this.latestLayer = null;
            this.defaultSettings = {
                tile: {
                    width: getLayerValue(makeDefaultLayerTileWidth),
                    height: getLayerValue(makeDefaultLayerTileHeight)
                }
            };
        }

        TiledCanvas.prototype.addLayer = function (name, zIndex, tileWidth, tileHeight) {
            if (typeof name !== 'string' || name.length === 0) {
                throw new Error('Invalid name of the Layer: ' + name);
            }

            if ((this.layers[name] instanceof Layer) === true) {
                this.layers[name].destroy();
                delete this.layers[name];
            }

            if (zIndex === undefined) {
                this.highestLayerIndex += 1;
                zIndex = this.highestLayerIndex;
            } else {
                zIndex = parseInt(zIndex, 10);
                if (this.highestLayerIndex < zIndex) {
                    this.highestLayerIndex = zIndex;
                }
            }

            this.layers[name] = new Layer(this.container, name, zIndex, (tileWidth === undefined) ? this.defaultSettings.tile.width : tileWidth, (tileHeight === undefined) ? this.defaultSettings.tile.height : tileHeight);

            if (zIndex === this.highestLayerIndex) {
                this.latestLayer = this.layers[name];
            }

            return this;
        };

        TiledCanvas.prototype.drawImage = function (img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh) {
            if (!(this.latestLayer instanceof Layer)) {
                throw new Error('No layers in this canvas, add at least one layer');
            }

            this.latestLayer.drawImage(img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh);
        };

        TiledCanvas.prototype.clearRect = function (x, y, w, h) {
            if (!(this.latestLayer instanceof Layer)) {
                throw new Error('No layers in this canvas, add at least one layer');
            }

            this.latestLayer.clearRect(x, y, w, h);
        };

        /**
         * @param {number} canvasDx
         * @param {number} canvasDy
         * @param {number} width
         * @param {number} height
         * @param {number} zIndex
         * @constructor
         */
        function Tile(canvasDx, canvasDy, width, height, zIndex) {
            /**
             * Create small canvas as part of tile
             * @type {HTMLElement}
             */
            this.canvas = document.createElement('canvas');

            /**
             * @type {CanvasRenderingContext2D}
             */
            this.ctx = this.canvas.getContext('2d');

            // Make sure that all parameters have proper type and value
            this.canvasDx = parseInt(canvasDx, 10);
            this.canvasDy = parseInt(canvasDy, 10);
            this.width = parseInt(width, 10);
            this.height = parseInt(height, 10);
            this.zIndex = parseInt(zIndex, 10);

            if (this.width <= 0 || this.height <= 0) {
                throw new RangeError('Width and height of canvas tile must be positive');
            }

            // Set visual style of canvas element
            this.canvas.setAttribute('width', this.width);
            this.canvas.setAttribute('height', this.height);

            this.canvas.style = extendShallow(this.canvas.style, {
                "width": this.width + 'px',
                "height": this.height + 'px',
                "position": "absolute",
                "padding": 0,
                "left": this.canvasDx + 'px',
                "top": this.canvasDy + 'px',
                "zIndex": this.zIndex,
                "overflow": "hidden"
            });
        }

        Tile.prototype.drawImage = function (img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh) {
            if (dx === undefined && dy === undefined && dw === undefined && dh === undefined) {
                dx_or_sx -= Math.abs(this.canvasDx);
                dy_or_sy -= Math.abs(this.canvasDy);
                this.ctx.drawImage(img_elem, 0, 0, img_elem.naturalWidth, img_elem.naturalHeight, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh);
            } else {
                dx -= Math.abs(this.canvasDx);
                dy -= Math.abs(this.canvasDy);
                this.ctx.drawImage(img_elem, (dw_or_sw > img_elem.naturalWidth) ? img_elem.naturalWidth : dw_or_sw, (dh_or_sh > img_elem.naturalHeight) ? img_elem.naturalHeight : dh_or_sh, dw_or_sw, dh_or_sh, dx, dy, dw, dh);
            }

            return this;
        };

        Tile.prototype.clearRect = function (x, y, w, h) {
            x -= Math.abs(this.canvasDx);
            y -= Math.abs(this.canvasDy);
            this.ctx.clearRect(x, y, w, h);
        };

        Tile.prototype.getCanvas = function () {
            return this.canvas;
        };

        /**
         * @param {HTMLElement} container
         * @param {string} name
         * @param {number} zIndex
         * @param {number} tileWidth
         * @param {number} tileHeight
         * @constructor
         */
        function Layer(container, name, zIndex, tileWidth, tileHeight) {
            if (!(this instanceof Layer)) {
                throw new TypeError("Invalid invocation");
            }

            if (!(container instanceof HTMLElement)) {
                throw new Error('Container must be an instance of HTMLElement');
            }

            if (typeof name !== 'string' || name.length === 0) {
                throw new Error('Invalid name of the Layer: ' + name);
            }

            tileWidth = tileWidth || 100;
            tileHeight = tileHeight || 100;

            this.container = container;
            this.zIndex = parseInt(zIndex, 10);
            this.tileWidth = parseInt(tileWidth, 10);
            this.tileHeight = parseInt(tileHeight, 10);

            if (this.tileWidth <= 0 || this.tileHeight <= 0) {
                throw new Error('Width and height of the tile must be positive');
            }

            var tileSize = {
                    x: Math.ceil(this.container.clientWidth / this.tileWidth),
                    y: Math.ceil(this.container.clientHeight / this.tileHeight)
                },
                i,
                j;

            this.tiles = [];
            this.limitI = tileSize.x;
            this.limitJ = tileSize.y;

            for (j = 0; j < this.limitJ; j++) {
                for (i = 0; i < this.limitI; i++) {
                    if (this.tiles[j] === undefined) {
                        this.tiles[j] = [];
                    }
                    if (this.tiles[j][i] === undefined) {
                        this.tiles[j][i] = [];
                    }

                    this.tiles[j][i] = new Tile(i * this.tileWidth, j * this.tileHeight, this.tileWidth, this.tileHeight, this.zIndex);
                    this.container.appendChild(this.tiles[j][i].getCanvas());
                }
            }
        }

        Layer.prototype.destroy = function () {
            var i, j;

            for (j = 0; j < this.limitJ; j++) {
                for (i = 0; i < this.limitI; i++) {
                    if (this.tiles[j] === undefined) {
                        this.tiles[j] = [];
                    }
                    if (this.tiles[j][i] === undefined) {
                        this.tiles[j][i] = [];
                    }

                    this.container.removeChild(this.tiles[j][i]);
                }
            }

            return this;
        };

        Layer.prototype.getTilesToDraw = function (x, y, w, h) {
            var tileStart = [
                    Math.floor(x / this.tileWidth),
                    Math.floor(y / this.tileHeight)
                ],
                tileStop = [
                    Math.floor((x + w) / this.tileWidth),
                    Math.floor((y + h) / this.tileHeight)
                ],
                i = 0,
                j = 0,
                tilesToDraw = [];

            switch (true) {
                case (tileStart[0] === tileStop[0] && tileStart[1] === tileStop[1]):
                    if (this.isTileExist(tileStart[0], tileStart[1])) {
                        tilesToDraw.push(this.tiles[tileStart[1]][tileStart[0]]);
                    }
                    break;
                case (tileStart[0] === tileStop[0]):
                    for (i = tileStart[1]; i <= tileStop[1]; i++) {
                        if (this.isTileExist(tileStart[0], i)) {
                            tilesToDraw.push(this.tiles[i][tileStart[0]]);
                        }
                    }
                    break;
                case (tileStart[1] === tileStop[1]):
                    for (i = tileStart[0]; i <= tileStop[0]; i++) {
                        if (this.isTileExist(i, tileStart[1])) {
                            tilesToDraw.push(this.tiles[tileStart[1]][i]);
                        }
                    }
                    break;
                default:
                    for (j = tileStart[1]; j <= tileStop[1]; j++) {
                        for (i = tileStart[0]; i <= tileStop[0]; i++) {
                            if (this.isTileExist(i, j)) {
                                tilesToDraw.push(this.tiles[j][i]);
                            }
                        }
                    }
            }

            return tilesToDraw;
        };

        Layer.prototype.isTileExist = function (x, y) {
            return this.tiles[y] !== undefined && (this.tiles[y][x] instanceof Tile) === true;
        };

        Layer.prototype.drawImage = function (img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh) {
            var tilesToDraw,
                i,
                loopLimit;

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

        Layer.prototype.clearRect = function (x, y, w, h) {
            var tilesToDraw,
                i,
                loopLimit;

            tilesToDraw = this.getTilesToDraw(x, y, w, h);
            loopLimit = tilesToDraw.length;

            for (i = 0; i < loopLimit; i++) {
                tilesToDraw[i].clearRect(x, y, w, h);
            }

            return this;
        };

        return TiledCanvas;
    }());

}(this));

