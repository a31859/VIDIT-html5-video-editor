var imageEffects = {
    adjustment: {
        autocolor: function() {},
        autocontrast: function() {},
        autolevels: function() {}
    },

    blur_sharpen: {
        gaussian_blur: function() {},
        sharpen: function() {}
    },

    color_correction: {
        brightness: function() {},
        contrast: function() {},
        color_balance: function() {},
        color_change: {
            black_white: function() {},
            sepia: function(pixels) {
                var d = pixels.data;
                for (var i = 0; i < d.length; i += 4) {
                    var r = d[i];
                    var g = d[i + 1];
                    var b = d[i + 2];

                    d[i] = (r * .393) + (g * .769) + (b * .189);
                    d[i + 1] = (r * .349) + (g * .686) + (b * .168);
                    d[i + 2] = (r * .272) + (g * .534) + (b * .131);
                }
                return pixels;
            },
            gray: function(pixels) {
                var d = pixels.data;
                for (var i = 0; i < d.length; i += 4) {
                    var r = d[i];
                    var g = d[i + 1];
                    var b = d[i + 2];
                    var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    d[i] = d[i + 1] = d[i + 2] = v
                }
                return pixels;
            },
            invert: function(pixels) {
                var d = pixels.data;
                for (var i = 0; i < d.length; i += 4) {
                    var r = d[i];
                    var g = d[i + 1];
                    var b = d[i + 2];

                    d[i] = 255 - r;
                    d[i + 1] = 255 - g;
                    d[i + 2] = 255 - b;
                }
                return pixels;
            }
        }
    },

    distort: {
        fisheye: function() {}
    },

    keying: {
        chromakey: function() {},
        matte: function() {}
    },

    noise_grain: {
        remove_noise: function() {},
        add_noise: function() {}
    },

    transform: {
        zoom: function() {},
        resize: function() {},
        rotate: function() {},
        crop: function() {},
        invert: function() {}
    },

    transition: {
        dissolve: function() {},
        wipe: function() {},
        slide: function() {}
    }
}
