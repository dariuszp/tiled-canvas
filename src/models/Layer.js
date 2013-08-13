(function (global) {
    'use strict';

    /**
     * @param {HTMLElement} container
     * @param {string} name
     * @constructor
     */
    var Layer = global.Layer = function (container) {
        this.container = container;

        var i, j;

        this.tiles = [];
        this.limitI = Math.ceil(this.container.clientWidth / Tile.WIDTH);
        this.limitJ = Math.ceil(this.container.clientHeight / Tile.HEIGHT);

        for (j = 0; j < this.limitJ; j++) {
            for (i = 0; i < this.limitI; i++) {
                if (this.tiles[j] === undefined) {
                    this.tiles[j] = [];
                }
                if (this.tiles[j][i] === undefined) {
                    this.tiles[j][i] = [];
                }

                this.tiles[j][i] = new Tile(i * Tile.WIDTH, j * Tile.HEIGHT, Tile.WIDTH, Tile.HEIGHT);
                this.container.appendChild(this.tiles[j][i].getCanvas());
            }
        }
    };

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
                Math.floor(x / Tile.WIDTH),
                Math.floor(y / Tile.HEIGHT)
            ],
            tileStop = [
                Math.floor((x + w) / Tile.WIDTH),
                Math.floor((y + h) / Tile.HEIGHT)
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

}(this));