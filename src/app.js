(function () {
    'use strict';

    var img = new Image();
    img.src = './img/demo.png';
    img.onload = function () {
        var view = document.getElementById('view'),
            tc = new TiledCanvas(view),
            x,
            y = 0;

        tc.addLayer('default');

        for(x = 0; x < 160; x += 32 ) {
            for (y = 0; y < 480; y += 48) {
                // tc.clearRect(x, y, 32, 48);
                tc.drawImage(img, 0, 0, 32, 48, x, y, 32, 48);
            }
        }
    };
}());