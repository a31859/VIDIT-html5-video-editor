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
			sepia: function() {},
			gray: function() {}
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