(function (global) {
    'use strict';

    function extendShallow(obj, val) {
        var i;
        for (i in val) {
            if (val.hasOwnProperty(i)) {
                obj[i] = val[i];
            }
        }
        return obj;
    }

    /**
     * @param {number} canvasDx
     * @param {number} canvasDy
     * @param {number} width
     * @param {number} height
     * @constructor
     */
    var Tile = global.Tile = function (canvasDx, canvasDy, width, height) {
        /**
         * Create small canvas as part of tile
         * @type {HTMLElement}
         */
        this.canvas = document.createElement('canvas');
        this.canvas.className = "canvas-tile";

        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = this.canvas.getContext('2d');

        // Make sure that all parameters have proper type and value
        this.canvasDx = parseInt(canvasDx, 10);
        this.canvasDy = parseInt(canvasDy, 10);
        this.width = parseInt(width, 10);
        this.height = parseInt(height, 10);

        // Set visual style of canvas element
        this.canvas.setAttribute('width', this.width);
        this.canvas.setAttribute('height', this.height);

        this.canvas.style = extendShallow(this.canvas.style, {
            "width": this.width + 'px',
            "height": this.height + 'px',
            "left": this.canvasDx + 'px',
            "top": this.canvasDy + 'px'
        });
    };

    Tile.WIDTH = 100;
    Tile.HEIGHT = 100;

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

}(this));
