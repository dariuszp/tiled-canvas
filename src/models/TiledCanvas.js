(function (global) {
    'use strict';

    /**
     * @param {HTMLElement} container
     * @constructor
     */
    var TiledCanvas = global.TiledCanvas = function (container) {
        this.container = container;
        this.layers = {};
        this.latestLayer = null;
    };

    TiledCanvas.prototype.addLayer = function (name) {
        if ((this.layers[name] instanceof Layer) === true) {
            this.layers[name].destroy();
            delete this.layers[name];
        }

        this.latestLayer = this.layers[name] = new Layer(this.container);

        return this;
    };

    TiledCanvas.prototype.drawImage = function (img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh) {
        this.latestLayer.drawImage(img_elem, dx_or_sx, dy_or_sy, dw_or_sw, dh_or_sh, dx, dy, dw, dh);
    };

    TiledCanvas.prototype.clearRect = function (x, y, w, h) {
        this.latestLayer.clearRect(x, y, w, h);
    };

}(this));