var project = project || {};

var inputOpenFileID = 'openfiles',
    buttonOpenFileID = 'openfilesButton',
    contentDivID = 'content',
    previewID = "preview",
    audio_ids = [],
    maxVideoFiles = 1,
    maxAudioFiles = 1;

var canvas = document.getElementById('canvas');
var canvas_ctx = canvas.getContext("2d");

var leftchannel = [];
var rightchannel = [];
var framenum, w, h;
var audio_context;

var pushtoRender = false;

var video_container, image_container, audio_container;

/**
 * Represents a project.
 * @constructor
 */
var project = {
    /**
     * Initializes the project. Checks for the suported formats
     */
    init: function() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.webAudioSuported = true;
        } catch (e) {
            swal("Not Supported!", "Web Audio API is not supported in this browser", "warning");
            this.webAudioSuported = false;
        }
        this.setSupportedFormats();
    },

    project_id: '',

    project_name: 'Untitled',

    email: '',

    resolution: {
        width: 1280,
        height: 720
    },

    webAudioSuported: false,

    video_files: [],
    audio_files: [],

    video_frames: {},

    renderImages: [],

    timeline: [],

    supportedVideoFormat: {
        ogg: false,
        h264: false,
        webm: false
    },

    supportedAudioFormat: {
        ogg: false,
        mp3: false,
        m4a: false,
        wav: false
    },

    formats: 'image/*,',

    /**
     * Sets the suported file formats.
     */
    setSupportedFormats: function() {
        if (Modernizr.video['ogg']) {
            this.supportedVideoFormat.ogg = true;
            this.formats += 'video/ogg,video/ogv';
        }

        if (Modernizr.video['h264'] && (Modernizr.audio['aac'] || Modernizr.audio['mp3'])) {
            this.supportedVideoFormat.h264 = true;
            this.formats += 'video/mp4,';
        }

        if (Modernizr.video['webm']) {
            this.supportedVideoFormat.webm = true;
            this.formats += 'video/webm,';
        }

        if (Modernizr.audio['ogg']) {
            this.supportedAudioFormat.ogg = true;
            this.formats += 'audio/ogg,';
        }

        if (Modernizr.audio['mp3']) {
            this.supportedAudioFormat.mp3 = true;
            this.formats += 'audio/mp3,';
        }

        if (Modernizr.audio['m4a']) {
            this.supportedAudioFormat.m4a = true;
            this.formats += 'audio/m4a,';
        }

        if (Modernizr.audio['wav']) {
            this.supportedAudioFormat.wav = true;
            this.formats += 'audio/wav,';
        }

        document.getElementById(inputOpenFileID).setAttribute('accept', this.formats);

        console.log("This browser has video support for: " +
            "\nogg:" + this.supportedVideoFormat.ogg +
            "\nh264:" + this.supportedVideoFormat.h264 +
            "\nwebm:" + this.supportedVideoFormat.webm +
            "\nThis browser has audio support for: " +
            "\nogg:" + this.supportedAudioFormat.ogg +
            "\nmp3:" + this.supportedAudioFormat.mp3 +
            "\nm4a:" + this.supportedAudioFormat.m4a +
            "\nwave:" + this.supportedAudioFormat.wav);
    },

    /**
     * Sets the project id.
     * @param {string} ID - The id of the project.
     */
    setProjectID: function(ID) {
        if (typeof ID === 'string') {
            this.project_id = ID;
        }
    },

    /**
     * Return the project id.
     * @returns {string}
     */
    getProjectID: function() {
        return this.project_id;
    },

    /**
     * Sets the project name.
     * @param {string} newName - The name of the project.
     */
    setProjectName: function(newName) {
        if (typeof newName === 'string') {
            this.project_name = newName;
        }
    },

    /**
     * Return the project name.
     * @returns {string}
     */
    getProjectName: function() {
        return this.project_name;
    },

    /**
     * Sets the project resolution.
     * @param {object} newResolution - The resolution of the project.
     */
    setResolution: function(newResolution) {
        if (typeof newResolution === "object") {
            this.resolution = newResolution;
        }
    },

    /**
     * Return the project name.
     * @returns {object}
     */
    getResolution: function() {
        return this.resolution;
    },

    /**
     * Adds the imageData information to the render array.
     * @param {imageData} imageData - The imageData of a canvas.
     */
    saveImageData: function(imageData) {
        this.renderImages.push(imageData);
    }

};

/**
 * Represents a container for the audio object and functions.
 * @constructor
 * @param {HTML_Object} file - The audio element object.
 * @param {string} url - The source url for the audio element.
 * @param {Number} idx - The index of the object in the timeline.
 */
var AudioContainer = function(file, url, idx) {
    "use strict";

    var self = this;

    this.fileId = 'audio' + idx;
    console.log(this.fileId);
    console.log('1 - ' + file);
    this.audioFile = file;
    console.log('2 - ' + this.audioFile);
    this.audio_context = audio_context;
    console.log('3 - ' + this.audio_context);
    this.originalurl = url;
    this.playingFile;
    this.animation;
    this.recordingLength;
    this.leftchannel = [];
    this.rightchannel = [];
    this.sampleRate;
    this.source;
    this.analyser;
    this.gainNode;
    this.recorder;
    this.startTime;
    this.endTime;
    this.playing = false;
    this.playForRender = false;
    this.fade = false;
    this.fadedOut = false;
    this.counter = 0;
    this.fadeCounts = 0;
    this.muteCounts = 0;
    this.fileEndTime = 0.0;
    this.duration = 0.0;
    this.startTime = 0.0;
    this.endTime;
    this.volume = 0.0;

    this.renderOver = false;

    /**
     * Sets the start time for the audio.
     * @param {Number} time - The time where to start the audio.
     * @param {HTML_Element} file_element - The audio element.
     */
    this.setStart = function(time, file_element) {
        console.log(time);
        notify("audio file start set to " + time, "information");
        self.startTime = time;
        self.updateTime(file_element);
    };

    /**
     * Sets the end time for the audio.
     * @param {Number} time - The time where to end the audio.
     * @param {HTML_Element} file_element - The audio element.
     */
    this.setEnd = function(time, file_element) {
        console.log(time);
        notify("audio file end set to " + time, "information");
        self.endTime = time;
        self.updateTime(file_element);
    };

    /**
     * Updates the start and end time for the audio.
     * @param {HTML_Element} file_element - The audio element.
     */
    this.updateTime = function(file_element) {
        if (typeof self.endTime == 'undefined' || self.endTime > self.startTime || self.endTime == "") {
            console.log(self.originalurl + '#t=' + self.startTime + ',' + self.endTime);
            file_element.src = self.originalurl + '#t=' + self.startTime + ',' + self.endTime;
        }
    };

    /**
     * Plays or pauses the audio element.
     * @param {HTML_Element} elem - The audio element.
     */
    this.play = function(elem) {
        if (elem.paused) {
            self.playing = true;
            self.counter = 0;
            if (self.fade) {
                self.fadedOut = false;
                if (typeof self.endTime == "undefined") {
                    self.endTime = self.fileEndTime;
                }
                self.duration = self.endTime - self.startTime;
                var fadeTime = 3;
                if (self.duration >= 10 && self.playingFile.currentTime >= self.startTime) {
                    // do fade in
                    self.gainNode.gain.value = 0.0; // set volume to 0
                    self.gainNode.gain.setTargetAtTime(1.0, self.audio_context.currentTime + fadeTime, 1.0); // fade in sound
                    console.log('fadeIn');
                }
            }
            elem.play();
            self.draw();
            console.log("started...");
            document.getElementById('play_audio' + idx).textContent = "pause";
        } else {
            elem.pause();
            self.playing = false;
            document.getElementById('play_audio' + idx).textContent = "play";
        }
    };

    /**
     * Stops the audio element while playing.
     * @param {HTML_Element} elem - The audio element.
     */
    this.stop = function(elem) {
        elem.pause();
        self.playing = false;
        self.playForRender = false;
        elem.currentTime = 0;
        document.getElementById('play_audio' + idx).textContent = "play";
        window.cancelAnimationFrame(self.animation);
        console.log("stopped...");
        notify("audio stopped playing", "notification");
    };

    /**
     * Add or remove fade in/fade out effect of the audio.
     */
    this.fadeSound = function() {
        var elem = document.getElementById("fade_audio" + idx);
        var inner = "fade in/out audio";
        self.fadeCounts += 1;
        var action = false;
        if (self.fadeCounts % 2 !== 0) {
            action = true;
            inner = "remove fade in/out";
        }
        self.fade = action;
        elem.innerHTML = inner;
        console.log("do fade in/out", self.fade);
    }

    /**
     * Mute and unmute the audio.
     */
    this.mute = function() {
        var elem = document.getElementById("mute_audio" + idx);
        var inner = "mute";
        self.muteCounts += 1;
        if (self.muteCounts % 2 !== 0) {
            inner = "remove mute";
            self.volume = self.gainNode.gain.value;
            self.gainNode.gain.value = 0.0;
        } else {
            self.gainNode.gain.value = (self.volume == 0.0) ? 1.0 : self.volume;
        }
        elem.innerHTML = inner;
    };

    /**
     * Add a value of 0.1 to the audio gain value.
     */
    this.gainPlus = function() {
        if (self.gainNode.gain.value <= 2) {
            self.gainNode.gain.value += .1;
        }
        console.log(self.gainNode.gain.value);
        notify("audio volume set to " + self.gainNode.gain.value * 100 + "%", "information");
    };

    /**
     * Remove a value of 0.1 to the audio gain value.
     */
    this.gainMinus = function() {
        if (self.gainNode.gain.value >= 0) {
            self.gainNode.gain.value -= .1;
        }
        console.log(self.gainNode.gain.value);
        notify("audio volume set to " + self.gainNode.gain.value * 100 + "%", "information");
    };

    /**
     * Resets all variables used for the recording of the audio
     */
    this.cleanForRecording = function() {
        self.leftchannel = [];
        self.rightchannel = [];
        self.recordingLength = 0;
        self.leftchannel.length = self.rightchannel.length = 0;
    };

    /**
     * Updates time the audio is playing in the web page.
     * @param {Number} time - The time to update in page.
     */
    this.updatePlayTime = function(time) {
        document.getElementById("audioTime" + idx).innerHTML = " <strong>Playing<strong> " + parseInt(time);
        document.getElementById("audioTimeEnd" + idx).innerHTML = parseInt(self.playingFile.duration);
    };

    /**
     * Add the audio element, settings and controls to the web page
     */
    this.addToPage = function() {
        var newFile = self.audioFile.cloneNode(true);
        newFile.id = self.fileId;
        newFile.controls = false;
        newFile.addEventListener('loadedmetadata', function() {
            self.fileEndTime = this.duration;
        });
        newFile.addEventListener('pause', function() {
            self.updateTime(this);
            if (!self.playForRender) {
                self.stop(this);
            }
            this.load();
            console.log('pause');
        }, false);
        var span = document.createElement('span');
        var controlPanel = "<div class='col-md-8 col-md-offset-2'><br />" +
            "<button class='btn btn-default' id=\"play_audio" + idx + "\" onclick='audio_container.cleanForRecording();audio_container.play(document.getElementById(\"" + self.fileId + "\"))'>play</button>" +
            "<button class='btn btn-default' onclick='audio_container.stop(document.getElementById(\"" + self.fileId + "\"))'>stop</button>" +
            "<span id='audioTime" + idx + "'> playing 0.0</span> of <span id='audioTimeEnd" + idx + "'>0.0</span>" +
            "<br />" +
            "<label>Set Video Start Time (s)</label><div class='input-group'><input class='form-control' type='number' id='" + self.fileId + "_startTime' placeholder='0' /><span class='input-group-btn'><button class='btn btn-default' onclick='setStartTime(" + idx + ", \"" + self.fileId + "\")'>set</button></span></div>" +
            " <label>Set Video End Time (s)</label><div class='input-group'><input class='form-control' type='number' id='" + self.fileId + "_endTime' placeholder='5' /><span class='input-group-btn'><button class='btn btn-default' onclick='setEndTime(" + idx + ", \"" + self.fileId + "\")'>set</button></span></div>" +
            "<br />" +
            "<button class='btn btn-default' id=\"fade_audio" + idx + "\" onclick='audio_container.fadeSound()'>fade in/out audio</button>" +
            "<button class='btn btn-default' id=\"mute_audio" + idx + "\" onclick='audio_container.mute()'>mute</button>" +
            "<button class='btn btn-default' onclick='audio_container.gainPlus()'>Vol +</button>" +
            "<button class='btn btn-default' onclick='audio_container.gainMinus()'>Vol -</button>" +
            "<br />" +
            "<canvas id=\"canvas_audio" + idx + "\" width=\"600\" height=\"130\"></canvas>" +
            "<br /></div>";

        console.log(controlPanel);

        span.innerHTML += controlPanel;

        span.appendChild(newFile);
        self.createAudioContext(newFile);
        self.playingFile = newFile;
        document.getElementById('sound-timeline').appendChild(span);
    };

    /**
     * Creates de AudioContext from the file and connects with nodes.
     * @param {HTML_Element} file - The audio element.
     */
    this.createAudioContext = function(file) {
        console.log('5 - ' + self.audio_context);
        self.recordingLength = 0;
        self.leftchannel.length = self.rightchannel.length = 0;

        self.source = self.audio_context.createMediaElementSource(file);

        self.sampleRate = self.audio_context.sampleRate;

        console.log('6 - ' + self.recordingLength + " - " + self.sampleRate);
        console.log('7 - ' + self.leftchannel + " - " + self.rightchannel);

        self.gainNode = self.audio_context.createGain();
        self.source.connect(self.gainNode);

        self.analyser = self.audio_context.createAnalyser();
        self.analyser.fftSize = 2048;
        var bufferLength = self.analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        self.analyser.getByteTimeDomainData(dataArray);

        var bufferSize = 2048;
        self.recorder = self.audio_context.createScriptProcessor(bufferSize, 2, 2);

        /**
         * Records and pushed the input audio to the output.
         * @param {object} e - The audio object.
         */
        self.recorder.onaudioprocess = function(e) {
            if (self.playing && !file.paused) {
                console.log('recording');
                var left = e.inputBuffer.getChannelData(0);
                var right = e.inputBuffer.getChannelData(1);

                self.leftchannel.push(new Float32Array(left));
                self.rightchannel.push(new Float32Array(right));
                self.recordingLength += bufferSize;
                if (!self.playForRender) {
                    for (var channel = 0; channel < e.outputBuffer.numberOfChannels; channel++) {
                        var inputData = e.inputBuffer.getChannelData(channel);
                        var outputData = e.outputBuffer.getChannelData(channel);

                        // Loop through the 4096 samples
                        for (var sample = 0; sample < e.inputBuffer.length; sample++) {
                            // make output equal to the same as the input
                            outputData[sample] = inputData[sample];
                        }
                    }
                }
            } else {
                if (self.counter < 10 && !self.playForRender) {
                    for (var channel = 0; channel < e.outputBuffer.numberOfChannels; channel++) {
                        var inputData = e.inputBuffer.getChannelData(channel);
                        var outputData = e.outputBuffer.getChannelData(channel);

                        // Loop through the 4096 samples
                        for (var sample = 0; sample < e.inputBuffer.length; sample++) {
                            // make output equal to the same as the input
                            outputData[sample] = inputData[sample];
                        }
                    }
                    self.counter += 1;
                    console.log("not recording");
                }
            }
        }

        console.log('9 - ', self.audioFile, self.source, self.sampleRate, self.gainNode, self.analyser, self.recorder);
        console.log('10 - ' + self.recordingLength + " - " + self.sampleRate);
        console.log('11 - ' + self.leftchannel + " - " + self.rightchannel);

        self.gainNode.connect(self.analyser);
        self.analyser.connect(self.recorder);
        self.recorder.connect(self.audio_context.destination);
    };

    /**
     * Draws the audio graph into a canvas.
     */
    this.draw = function() {
        if (self.playing && !self.playingFile.paused) {
            self.updatePlayTime(self.playingFile.currentTime);
            if (typeof self.endTime == "undefined") {
                self.endTime = self.fileEndTime;
            }
            self.duration = self.endTime - self.startTime;
            if (self.playingFile.currentTime >= self.endTime) {
                self.playingFile.pause();
                self.playingFile.currentTime = 0.0;
            }
            if (self.fade) {
                var fadeTime = 3;
                if (self.duration >= 10 && self.playingFile.currentTime >= (self.endTime - (fadeTime + 1)) && !self.fadedOut) {
                    // do fade out
                    self.gainNode.gain.setTargetAtTime(0.0, self.audio_context.currentTime, 1.0); // fade out sound
                    self.fadedOut = true;
                    console.log('fadeOut');
                }
            }
            var canvas = document.getElementById("canvas_audio" + idx);

            var WIDTH = canvas.width;
            var HEIGHT = canvas.height;

            var ctx = canvas.getContext("2d");

            var bufferLength = self.analyser.frequencyBinCount;
            var dataArray = new Uint8Array(bufferLength);
            self.analyser.getByteTimeDomainData(dataArray);

            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgb(128, 255, 0)';

            ctx.beginPath();

            var sliceWidth = WIDTH * 1.0 / bufferLength;
            var x = 0;

            for (var i = 0; i < bufferLength; i++) {

                var v = dataArray[i] / 128.0;
                var y = v * HEIGHT / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
            self.animation = window.requestAnimationFrame(self.draw);
        } else {
            if (self.playForRender) {
                self.renderOver = true;
            }
        }
    };

};

/**
 * Represents a container for the image object and functions.
 * @constructor
 * @param {Number} idx - The index of the object in the timeline.
 */
var ImageContainer = function(idx) {
    "use strict";
    var self = this;

    this.duration = 5;
    this.startTime = (new Date()).getTime() / 1000;
    this.lasttime = 0.0;
    this.framenum = 0;
    this.paused = false;
    this.image_files = [];
    this.imagesFiles = [];
    this.appliedFilters = [];
    this.appliedFiltersName = [];
    this.frameTime = [];
    this.renderOver = false;

    /**
     * Sets the duration to show each image.
     * @param {Number} duration - The duration to play a image.
     */
    this.setDuration = function(duration) {
        self.duration = duration;
        notify("images duration set to " + duration, "information");
    };

    /**
     * Converts an object to a Image Elemnt and adds it to the image storage array.
     * @param {object} image_file - The image file object.
     */
    this.addImageFile = function(image_file) {
        var image_element = document.createElement('img');
        image_element.src = URL.createObjectURL(image_file);
        self.image_files.push(image_element);
    };

    /**
     * Draws each image from the image storage array into the canvas, for the duration that was set, making a slideshow.
     */
    this.draw = function() {
        if (!self.paused) {
            var endTime = (new Date()).getTime() / 1000;
            var time = endTime - self.startTime;

            if (time < self.image_files.length * self.duration) {

                var canvas = document.getElementById('canvas');
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                var image = self.image_files[self.framenum];

                var resolution = project.getResolution();
                var scaleX = 1.0;
                var scaleY = 1.0;
                if (image.width > resolution.width) {
                    scaleX = scaleY = resolution.width / image.width;
                } else if (image.height > resolution.height) {
                    scaleY = scaleX = resolution.height / image.height;
                }
                var posX = parseInt((resolution.width / 2) - ((image.width * scaleX) / 2));
                var posY = parseInt((resolution.height / 2) - ((image.height * scaleY) / 2));

                ctx.drawImage(image, posX, posY, image.width * scaleX, image.height * scaleY);
                self.frameTime.push(time);

                var framedur = self.duration * (self.framenum + 1);
                //console.log("time passed " + time);
                if (parseInt(time) % self.duration == 0 && self.lasttime < framedur && time >= framedur) {
                    if (self.image_files.length > self.framenum) {
                        self.framenum += 1;
                    }
                }
                self.lasttime = time;
                var idata = ctx.getImageData(posX, posY, canvas.width, canvas.height);
                var filters = self.getAppliedFilters();
                if (filters.length > 0) {
                    for (var filter = 0; filter < filters.length; filter++) {
                        idata = filters[filter](idata);
                    }
                }
                idata.originalWidth = image.width * scaleX;
                idata.originalHeight = image.height * scaleY;
                if (pushtoRender === true) {
                    self.imagesFiles.push(idata);
                }

                ctx.putImageData(idata, posX, posY);

                setTimeout(function() {
                    window.requestAnimationFrame(self.draw);
                }, 1000 / 30);
            } else {
                self.framenum = 0;
                self.lasttime = 0.0;
                self.paused = true;
                console.log("stopped playing images");
                notify("images stopped playing", "notification");
                if (pushtoRender === true) {
                    console.log("playing images render");
                    self.paused = false;
                    self.startTime = (new Date()).getTime() / 1000;
                    self.playForRender();
                }
            }
        }
    };

    /**
     * Starts playing the images slideshow.
     */
    this.play = function() {
        console.log("play images");
        self.paused = false;
        self.frameTime = [];
        self.imagesFiles = [];
        self.startTime = (new Date()).getTime() / 1000;
        self.renderOver = false;
        self.draw();
    };

    /**
     * Stops playing the images slideshow.
     */
    this.pause = function() {
        console.log("stop images");
        self.framenum = 0;
        self.lasttime = 0.0;
        self.paused = true;
    };

    /**
     * Starts playing the images captured while playing the slideshow and saves them to the project.
     */
    this.playForRender = function() {
        if (!self.paused) {
            var endTime = (new Date()).getTime() / 1000;
            var time = endTime - self.startTime;

            if (time < self.image_files.length * self.duration) {
                var canvas = document.getElementById('canvas');
                var ctx = canvas.getContext('2d');
                var resolution = project.getResolution();
                var imageData = self.imagesFiles[self.framenum];

                var posX = parseInt((resolution.width / 2) - (imageData.originalWidth / 2));
                var posY = parseInt((resolution.height / 2) - (imageData.originalHeight / 2));

                // console.log("time passed " + time);
                if (time >= self.frameTime[self.framenum]) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.putImageData(imageData, posX, posY);
                    //console.log("time passed " + time);
                    self.framenum += 1;
                }

                var idata = ctx.getImageData(posX, posY, canvas.width, canvas.height);
                idata.originalWidth = imageData.originalWidth;
                idata.originalHeight = imageData.originalHeight;

                project.saveImageData(idata);

                setTimeout(function() {
                    window.requestAnimationFrame(self.playForRender);
                }, 1000 / 30);
            } else {
                self.framenum = 0;
                self.lasttime = 0.0;
                self.paused = true;
                console.log("stopped playing images render");
                self.renderOver = true;
            }
        }
    };

    /**
     * Add the image element, settings and controls to the web page
     */
    this.addToPage = function() {
        var span = document.createElement('span');
        var div = document.createElement('div');
        // span.innerHTML = '<button class='btn btn-default' onclick="document.getElementById(\'image-timeline\').removeChild(this.parentNode)">Remove</button><br />';
        var controlPanel = "<div class='col-md-8 col-md-offset-2'><br />" +
            "<button class='btn btn-default' onclick='image_container.play()'>play</button>" +
            "<button class='btn btn-default' onclick='image_container.pause()'>stop</button>" +
            // "<button class='btn btn-default' onclick='pushtoRender=true;image_container.pause();image_container.play()'>playForRender</button>" +
            "<br />" +
            "<label>Set Image Duration (s)</label><div class='input-group'><input class='form-control' type='number' id='image_duration' placeholder='5' /><span class='input-group-btn'><button class='btn btn-default' onclick='image_container.setDuration(document.getElementById(\"image_duration\").value)'>set</button></span></div>" +
            "<br />" +
            "<label>select effect to apply</label><div class='input-group'><select class='form-control' id='imageEffects'>" +
            "<option value='color_gray'>grayscale</option>" +
            "<option value='color_invert'>invert color</option>" +
            "<option value='color_sepia'>sepia</option>" +
            "</select><span class='input-group-btn'><button class='btn btn-default' onclick='applyFilter(document.getElementById(\"imageEffects\").value, " + idx + ")'>apply</button></span></div>" +
            "<br /><div id='image_applied_filters'></div><br /></div>";

        console.log(controlPanel);

        span.innerHTML += controlPanel;

        var carousel = document.createElement('div');
        carousel.id = "myCarousel";
        carousel.className = "carousel slide";
        carousel.setAttribute("data-ride", "carousel");

        var ol = document.createElement('ol');
        ol.className = "carousel-indicators";

        var inner = document.createElement('div');
        inner.className = "carousel-inner";

        for (var i = 0; i < self.image_files.length; i++) {
            var newFile = self.image_files[i].cloneNode(true);
            var li = document.createElement('li');
            var item = document.createElement('div');
            item.className = "item";
            li.setAttribute("data-ride", "#myCarousel");
            li.setAttribute("data-slide-to", "" + i);
            if (i == 0) {
                li.className = "active";
                item.className = item.className + " active";
            }
            newFile.className = "img-responsive img-height";
            ol.appendChild(li);
            item.appendChild(newFile);
            inner.appendChild(item);
        }

        var control_left = document.createElement('a');
        var control_right = document.createElement('a');

        var icon_left = document.createElement('span');
        var icon_right = document.createElement('span');

        control_left.className = "carousel-control left";
        control_left.href = "#myCarousel";
        control_left.setAttribute("data-slide", "prev");

        icon_left.className = "glyphicon glyphicon-chevron-left";

        control_left.appendChild(icon_left);

        control_right.className = "carousel-control right";
        control_right.href = "#myCarousel";
        control_right.setAttribute("data-slide", "next");

        icon_right.className = "glyphicon glyphicon-chevron-right";

        control_right.appendChild(icon_right);

        carousel.appendChild(ol);
        carousel.appendChild(inner);
        carousel.appendChild(control_left);
        carousel.appendChild(control_right);

        div.appendChild(carousel);

        div.className = "col-md-8 col-md-offset-2";

        span.appendChild(div);


        document.getElementById('image-timeline').appendChild(span);
    };

    /**
     * Returns the array of filters that were applied
     * @returns {Array}
     */
    this.getAppliedFilters = function() {
        return self.appliedFilters;
    };

    /**
     * Add the filter to the apply queue
     * @param {function} filter - A function for the applied filter.
     * @param {string} option - The selected filter name.
     */
    this.applyFilter = function(filter, option) {
        console.log(filter);
        self.appliedFilters.push(filter);
        self.appliedFiltersName.push(option);
        self.updateAppliedFilters();
    };

    /**
     * Removes the filter from the applied array.
     * @param {Number} index - The index to remove the filter.
     */
    this.removeAppliedFilter = function(index) {
        self.appliedFilters.splice(index);
        self.appliedFiltersName.splice(index);
    };

    /**
     * Updades the applied filters and adds them to the web page.
     */
    this.updateAppliedFilters = function() {
        var element = document.getElementById('image_applied_filters');
        var filters = self.getAppliedFilters();
        var content = "<button type='button' class='btn btn-primary' data-toggle='collapse' data-target='#filters_applied'>Show Applied Filters</button><div id='filters_applied' class='collapse out'><div class='list-group'>";
        for (var i = 0; i < filters.length; i++) {
            content += "<button type='button' onclick='image_container.removeAppliedFilter(\"" + i + "\");image_container.updateAppliedFilters()' class='list-group-item'><span class='glyphicon glyphicon-remove text-danger'></span> Remove Filter - " + self.appliedFiltersName[i] + "</button>";
        }
        content += "</div></div>";

        element.innerHTML = content;
    }
};

/**
 * Represents a container for the video object and functions.
 * @constructor
 * @param {HTML_Object} file - The audio element object.
 * @param {Number} idx - The index of the object in the timeline.
 * @param {string} url - The source url for the audio element.
 * @param {boolean} muted - If the audio must be or not muted.
 */
var VideoContainer = function(file, idx, url, muted) {
    "use strict";

    var self = this;

    this.videoFile = file;
    this.fileId = 'video' + idx;
    this.originalurl = url;

    this.startTime = 0.0;
    this.framenum = 0;
    this.initTime = 0;
    this.preRender = false;
    this.ended = false;
    this.endTime = this.videoFile.duration;
    this.duration = this.endTime - this.startTime;
    this.frameTime = [];
    this.appliedFilters = [];
    this.appliedFiltersName = [];
    this.imagesFiles = [];

    this.width = 0;
    this.height = 0;

    this.muted = muted;

    this.temp_canvas = document.createElement('canvas');
    this.temp_canvas.width = canvas.width;
    this.temp_canvas.height = canvas.height;
    this.temp_canvas_cxt = this.temp_canvas.getContext('2d');

    this.renderOver = false;

    /**
     * Sets the start time the video started to play.
     */
    this.setInitTime = function() {
        self.initTime = (new Date()).getTime() / 1000;
    };

    /**
     * Resets the start time the video started to 0.
     */
    this.resetInitTime = function() {
        self.initTime = 0;
    };

    /**
     * Sets the start time for the video.
     * @param {Number} time - The time to start the video.
     * @param {HTML_Element} file_element - The video element.
     */
    this.setStart = function(time, file_element) {
        console.log(time);
        notify("video file start set to " + time, "information");
        self.startTime = time;
        self.updateTime(file_element);
    };

    /**
     * Sets the end time for the video.
     * @param {Number} time - The time to end the video.
     * @param {HTML_Element} file_element - The video element.
     */
    this.setEnd = function(time, file_element) {
        console.log(time);
        notify("video file end set to " + time, "information");
        self.endTime = time;
        self.updateTime(file_element);
    };

    /**
     * Updates the duration for the video.
     * @param {HTML_Element} file_element - The video element.
     */
    this.updateTime = function(file_element) {
        if (typeof self.endTime == 'undefined' || self.endTime > self.startTime || self.endTime == "") {
            console.log(self.originalurl + '#t=' + self.startTime + ',' + self.endTime);
            self.duration = self.endTime - self.startTime;
            file_element.src = self.originalurl + '#t=' + self.startTime + ',' + self.endTime;
        }
    };

    /**
     * Returns the array of filters that were applied
     * @returns {Array}
     */
    this.getAppliedFilters = function() {
        return self.appliedFilters;
    };

    /**
     * Add the filter to the apply queue
     * @param {function} filter - A function for the applied filter.
     * @param {string} option - The selected filter name.
     */
    this.applyFilter = function(filter, option) {
        console.log(filter);
        self.appliedFilters.push(filter);
        self.appliedFiltersName.push(option);
        self.updateAppliedFilters();
    };

    /**
     * Removes the filter from the applied array.
     * @param {Number} index - The index to remove the filter.
     */
    this.removeAppliedFilter = function(index) {
        self.appliedFilters.splice(index);
        self.appliedFiltersName.splice(index);
    };

    /**
     * Updades the applied filters and adds them to the web page.
     */
    this.updateAppliedFilters = function() {
        var element = document.getElementById('video_applied_filters');
        var filters = self.getAppliedFilters();
        var content = "<button type='button' class='btn btn-primary' data-toggle='collapse' data-target='#filters_applied'>Show Applied Filters</button><div id='filters_applied' class='collapse out'><div class='list-group'>";
        for (var i = 0; i < filters.length; i++) {
            content += "<button type='button' onclick='video_container.removeAppliedFilter(\"" + i + "\");video_container.updateAppliedFilters()' class='list-group-item'><span class='glyphicon glyphicon-remove text-danger'></span> Remove Filter - " + self.appliedFiltersName[i] + "</button>";
        }
        content += "</div></div>";

        element.innerHTML = content;
    }

    /**
     * Add the video element, settings and controls to the web page
     */
    this.addToPage = function() {
        var newFile = self.videoFile.cloneNode(true);
        newFile.id = self.fileId;
        var span = document.createElement('span');
        var div = document.createElement('div');
        // span.innerHTML = '<button class="btn btn-default" onclick="document.getElementById(\'video-timeline\').removeChild(this.parentNode)">Remove</button><br />';
        newFile.addEventListener('play', function() {
            console.log('play', this.videoWidth, this.videoHeight);
            if (self.muted) {
                this.volume = 0.0;
            }
            self.renderOver = false;
            self.draw();
        }, false);
        newFile.addEventListener('pause', function() {
            self.updateTime(this);
            this.load();
            console.log('pause');
            notify("video stopped playing", "notification");
        }, false);
        newFile.addEventListener('ended', function() {
            self.ended = true;
            console.log('ended');
            notify("video stopped playing", "notification");
        }, false);
        newFile.addEventListener("loadedmetadata", function(e) {
            self.width = this.videoWidth,
                self.height = this.videoHeight;
            self.duration = this.duration;
        }, false);
        var controlPanel = "<div class='col-md-8 col-md-offset-2'><br />" +
            "<button class='btn btn-default' onclick='document.getElementById(\"" + self.fileId + "\").play()'>play</button>" +
            "<button class='btn btn-default' onclick='document.getElementById(\"" + self.fileId + "\").pause()'>stop</button>" +
            // "<button onclick='pushtoRender=true;video_container.preRender=true;document.getElementById(\"" + self.fileId + "\").play();'>playForRender</button>" +
            "<br />" +
            "<label>Set Video Start Time (s)</label><div class='input-group'><input type='number' class='form-control' id='" + self.fileId + "_startTime' placeholder='0' /><span class='input-group-btn'><button class='btn btn-default' onclick='setStartTime(" + idx + ", \"" + self.fileId + "\")'>set</button></span></div>" +
            " <label>Set Video End Time (s)</label><div class='input-group'><input type='number' class='form-control' id='" + self.fileId + "_endTime' placeholder='5' /><span class='input-group-btn'><button class='btn btn-default' onclick='setEndTime(" + idx + ", \"" + self.fileId + "\")'>set</button></span></div>" +
            "<br />" +
            "<label>select effect to apply</label><div class='input-group'><select class='form-control' id='" + self.fileId + "_filter'>" +
            "<option value='color_gray'>grayscale</option>" +
            "<option value='color_invert'>invert color</option>" +
            "<option value='color_sepia'>sepia</option>" +
            "</select><span class='input-group-btn'><button class='btn btn-default' onclick='applyFilter(document.getElementById(\"" + self.fileId + "_filter\").value, " + idx + ")'>apply</button></span></div>" +
            "<br /><div id='video_applied_filters'></div><br /></div>";

        console.log(controlPanel);

        span.innerHTML += controlPanel;

        newFile.className = "img-responsive";
        newFile.controls = false;

        div.appendChild(newFile);

        div.className = "col-md-8 col-md-offset-2";

        div.appendChild(span);

        document.getElementById('video-timeline').appendChild(div);
    };

    /**
     * Draws each frame from the video into the canvas.
     */
    this.draw = function() {
        var video_frame = document.getElementById(self.fileId);
        if (video_frame.paused || video_frame.ended) {
            console.log("done");
            if (pushtoRender && self.preRender) {
                console.log(self.frameTime.length); //, self.frameTime, self.imagesFiles);
                self.preRender = false;
                self.ended = false;
                self.setInitTime();
                self.playForRender();
            }
            return false;
        }

        var resolution = project.getResolution();
        var posX = parseInt((resolution.width / 2) - (self.width / 2));
        var posY = parseInt((resolution.height / 2) - (self.height / 2));

        self.temp_canvas_cxt.drawImage(video_frame, posX, posY);
        var idata = self.temp_canvas_cxt.getImageData(posX, posY, self.temp_canvas.width, self.temp_canvas.height);
        var filters = self.getAppliedFilters();
        if (filters.length > 0) {
            for (var filter = 0; filter < filters.length; filter++) {
                idata = filters[filter](idata);
            }
        }
        if (pushtoRender === true) {
            self.frameTime.push(video_frame.currentTime);
            self.imagesFiles.push(idata);
        }

        canvas_ctx.putImageData(idata, posX, posY);

        setTimeout(function() {
            window.requestAnimationFrame(self.draw);
        }, 1000 / 30);
    };

    /**
     * Starts playing the images captured while playing the video and saves them to the project.
     */
    this.playForRender = function() {
        if (self.framenum < self.imagesFiles.length) {
            var canvas = document.getElementById('canvas');
            var ctx = canvas.getContext('2d');

            var resolution = project.getResolution();
            var posX = parseInt((resolution.width / 2) - (self.width / 2));
            var posY = parseInt((resolution.height / 2) - (self.height / 2));

            var secondsPassed = (new Date()).getTime() / 1000;
            var time = secondsPassed - self.initTime;
            // console.log("time passed " + time);
            if (time >= self.frameTime[self.framenum]) {
                ctx.putImageData(self.imagesFiles[self.framenum], posX, posY);
                //console.log("time passed " + time);
                self.framenum += 1;
            }
            var idata = ctx.getImageData(posX, posY, canvas.width, canvas.height);
            idata.originalWidth = self.width;
            idata.originalHeight = self.height;

            project.saveImageData(idata);

            setTimeout(function() {
                window.requestAnimationFrame(self.playForRender);
            }, 1000 / 30);
        } else {
            self.renderOver = true;
            console.log("frames " + project.renderImages.length);
        }
    };
};

/**
 * Sets the start time for the input element.
 * @param {Number} idx - The index of the element in the project timeline.
 * @param {string} element_idx - The id of the element in the web page.
 */
function setStartTime(idx, element_id) {
    project.timeline[idx].setStart(document.getElementById(element_id + "_startTime").value, document.getElementById(element_id));
}

/**
 * Sets the end time for the input element.
 * @param {Number} idx - The index of the element in the project timeline.
 * @param {string} element_idx - The id of the element in the web page.
 */
function setEndTime(idx, element_id) {
    project.timeline[idx].setEnd(document.getElementById(element_id + "_endTime").value, document.getElementById(element_id));
}

/**
 * Applys the filter the object in the input index in the timeline.
 * @param {string} option - The select option value.
 * @param {Number} idx - The index of the element in the project timeline.
 */
function applyFilter(option, idx) {
    var filter;
    if (option === 'color_gray') {
        filter = imageEffects.color_correction.color_change.gray;
    } else if (option === 'color_invert') {
        filter = imageEffects.color_correction.color_change.invert;
    } else if (option === 'color_sepia') {
        filter = imageEffects.color_correction.color_change.sepia;
    }
    console.log(filter);
    project.timeline[idx].applyFilter(filter, option);
}

/**
 * Request the server for a unique id and sets the project parameters.
 * @param {HTML_Element} projectForm - The HTML form with filled parameters.
 */
function setProject(projectForm) {
    var request = new XMLHttpRequest();
    request.open("GET", "/getUniqueID", true);
    request.send();
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status === 200) {
                var unique_id = request.responseText;
                project.setProjectID(unique_id);
                console.log(project.getProjectID());
            } else {
                console.log('There was a problem with the request.');
            }
        }
    }

    var newName = projectForm.pname.value,
        email = projectForm.email.value,
        newWidth = projectForm.pwidth.value,
        newHeight = projectForm.pheight.value;

    if (newName !== '' && newName !== null) {
        project.setProjectName(newName);
        document.getElementById("title").innerHTML = newName;
    }

    if (email !== '' && email !== null) {
        project.email = email;
    }


    if (newWidth !== '' && newWidth !== null && newHeight !== '' && newHeight !== null) {
        resolution = {
            width: newWidth,
            height: newHeight
        };
        project.setResolution(resolution);
    }

    console.log(project.getProjectName());
    var res = project.getResolution();
    console.log("Resolution -> " + res.width + " x " + res.height);

    canvas.width = res.width;
    canvas.height = res.height;

    projectForm.setAttribute("class", "hide");

    project.init();

    if (project.webAudioSuported) {
        audio_context = new AudioContext();
    }

    document.getElementById(buttonOpenFileID).setAttribute("class", "");
    document.getElementById("content").setAttribute("class", "show");

    return false;
}

/**
 * Opens the file explorer.
 */
function openFiles() {
    if (document.getElementById(buttonOpenFileID).getAttribute("class") !== "disabled")
        document.getElementById(inputOpenFileID).click();
}

/**
 * List the selected files, creates the audio, video or image container and adds them to the web page.
 * @param {object} filelist - The object containing the files.
 */
function listFiles(filelist) {
    var countVideo = 0,
        countImages = 0,
        countAudio = 0;

    for (var i = 0; i < filelist.files.length; i++) {
        var file = filelist.files.item(i);

        if (file.type.match(/^video\//) && project.formats.match((file.type + '').replace(/\//g, "\\/")) && countVideo < maxVideoFiles && countImages == 0) {
            var url = URL.createObjectURL(file);
            notify("file " + file.name + " added to project", "notification");

            var video_element = document.createElement('video');
            video_element.src = url;
            video_element.controls = true;

            video_container = new VideoContainer(video_element, i, url, false);

            project.timeline.push(video_container);

            if (countAudio < 1) {
                if (project.webAudioSuported) {
                    audio_container = new AudioContainer(video_element, url, i);
                    video_container.muted = true;
                } else {
                    audio_container = {};
                    audio_container.file = file;
                    audio_container.filename = "audio_video_file";
                    audio_container.ext = file.type.split('/')[1];
                }
            } else {
                video_container.muted = true;
            }


            video_container.addToPage();
            countVideo += 1;
        } else if (file.type.match(/^image\//) && countVideo == 0) {
            notify("file " + file.name + " added to project", "notification");
            countImages += 1;
            if (countImages == 1) {
                image_container = new ImageContainer(i);
                project.timeline.push(image_container);
            }
            image_container.addImageFile(file);
        } else if (file.type.match(/^audio\//) && project.formats.match((file.type + '').replace(/\//g, "\\/")) && countAudio < maxAudioFiles) {
            notify("file " + file.name + " added to project", "notification");
            countAudio += 1;
            if (countVideo == 1) {
                video_container.muted = true;
            }
            var audio_element = document.createElement('audio');
            var url = URL.createObjectURL(file);
            audio_element.src = URL.createObjectURL(file);

            if (project.webAudioSuported) {
                audio_container = new AudioContainer(audio_element, url, i);
                project.timeline.push(audio_container);
            } else {
                swal("Warning!", "Since WebAudio API is not supported the audio file will be submited to the server unedited.", "warning");
                audio_container = {};
                audio_container.file = file;
                audio_container.filename = "audio_video_file";
                audio_container.ext = file.type.split('/')[1];
                console.log(audio_container)
            }
        } else {
            swal("Warning!", "The selected file: " + file.name + ", with type: " + file.type + " isn't valid.", "warning");
        }
    }

    if (countImages > 1) {
        image_container.addToPage();
    }
    if (typeof audio_container !== 'undefined' && project.webAudioSuported) {
        audio_container.addToPage();
    }

    console.log(image_container != null ? image_container.image_files : null);
    console.log(project.timeline);
}

/**
 * Combines the audio channels.
 * @param {array} leftChannel - The left audio channel.
 * @param {array} rightChannel - The right audio channel.
 */
function interleave(leftChannel, rightChannel) {
    var length = leftChannel.length + rightChannel.length;
    var result = new Float32Array(length);

    var inputIndex = 0;

    for (var index = 0; index < length;) {
        result[index++] = leftChannel[inputIndex];
        result[index++] = rightChannel[inputIndex];
        inputIndex++;
    }
    return result;
}

/**
 * Merges the audio channel buffer.
 * @param {array} channelBuffer - The audio buffer.
 * @param {Number} recordingLength - The length of the audio recording.
 */
function mergeBuffers(channelBuffer, recordingLength) {
    var result = new Float32Array(recordingLength);
    var offset = 0;
    var lng = channelBuffer.length;
    for (var i = 0; i < lng; i++) {
        var buffer = channelBuffer[i];
        result.set(buffer, offset);
        offset += buffer.length;
    }
    return result;
}

/**
 * Writes the WAV container.
 * @param {DataView} view - A low-level interface for reading data from and writing it to an ArrayBuffer.
 * @param {Number} offset - The offset.
 * @param {string} string -  
 */
function writeUTFBytes(view, offset, string) {
    var lng = string.length;
    for (var i = 0; i < lng; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

/**
 * Gets the wave file blob.
 * @returns {blob} 
 */
function getAudioBlob() {
    // we flat the left and right channels down
    var leftBuffer = mergeBuffers(audio_container.leftchannel, audio_container.recordingLength);
    var rightBuffer = mergeBuffers(audio_container.rightchannel, audio_container.recordingLength);
    // we interleave both channels together
    var interleaved = interleave(leftBuffer, rightBuffer);

    // we create our wav file
    var buffer = new ArrayBuffer(44 + interleaved.length * 2);
    var view = new DataView(buffer);

    // RIFF chunk descriptor
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 44 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, 'WAVE');
    // FMT sub-chunk
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    // stereo (2 channels)
    view.setUint16(22, 2, true);
    view.setUint32(24, audio_container.sampleRate, true);
    view.setUint32(28, audio_container.sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    // data sub-chunk
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, interleaved.length * 2, true);

    // write the PCM samples
    var lng = interleaved.length;
    var index = 44;
    var volume = 1;
    for (var i = 0; i < lng; i++) {
        view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
        index += 2;
    }

    // our final binary blob
    var blob = new Blob([view], {
        type: 'audio/wav'
    });

    return blob;
}

/**
 * Starts playing all the files.
 */
function playAll() {
    document.getElementById("renderButton").setAttribute("class", "");
    if (typeof image_container !== "undefined") {
        image_container.play();
    }
    if (typeof video_container !== "undefined") {
        document.getElementById("" + video_container.fileId).play();
    }
    if (typeof audio_container !== "undefined") {
        audio_container.cleanForRecording();
        audio_container.play(document.getElementById("" + audio_container.fileId));
    }
}

/**
 * Stops playing all the files.
 */
function stopAll() {
    if (typeof image_container !== "undefined") {
        image_container.pause();
    }
    if (typeof video_container !== "undefined") {
        document.getElementById("" + video_container.fileId).pause();
    }
    if (typeof audio_container !== "undefined" && project.webAudioSuported) {
        audio_container.stop(document.getElementById("" + audio_container.fileId));
    }
}

/**
 * Starts the rendering process.
 */
function render() {
    console.log("rendering...");
    document.getElementById("uploadButton").setAttribute("class", "");
    notify("Rendering Process Started... Please Wait...", "information");
    swal("Warning", "This process may take longer depending on the machine processing ability.\nYou will not ear sound during audio rendering.", "info");
    var imagesDuration = 0.0,
        videoDuration = 0.0,
        audioDuration = 0.0,
        totalRenderTime = 0.0;

    var hasImages = false,
        hasVideo = false,
        hasAudio = false;

    if (typeof image_container !== "undefined") {
        hasImages = true;
        imagesDuration += (image_container.duration * image_container.image_files.length * 2); //times 2 for pre-render and render times
        imagesDuration += 2; //wait between render
    }

    if (typeof video_container !== "undefined") {
        hasVideo = true;
        videoDuration += (video_container.duration * 2); //times 2 for pre-render and render times
        videoDuration += 2; //wait between render
    }

    if (typeof audio_container !== "undefined" && project.webAudioSuported) {
        hasAudio = true;
        audioDuration += audio_container.duration;
        audioDuration += 2; //wait between render
    }

    /**
     * Waits a time until all the render process is done and calls for the upload function.
     * @param {Number} timeToWait - The time to wait.
     */
    function waitForRender(timeToWait) {
        console.log("waiting for the render to end in ", timeToWait, "milliseconds");
        setTimeout(function() {
            console.log("check if renders done");
            var doneRenders = false;
            if (hasImages) {
                if (hasAudio) {
                    doneRenders = image_container.renderOver && audio_container.renderOver;
                } else {
                    doneRenders = image_container.renderOver;
                }
            }

            if (hasVideo) {
                if (hasAudio) {
                    doneRenders = video_container.renderOver && audio_container.renderOver;
                } else {
                    doneRenders = video_container.renderOver;
                }
            }

            if (doneRenders) {
                console.log("started to upload");
                notify("Started Upload Process... Please Wait", "information");
                uploadFiles();
            } else {
                console.log("waiting more to upload");
                waitForRender(1000);
            }
        }, timeToWait);
    }

    /**
     * Waits some time for the image rendering process to be done and starts rendering the audio.
     * @param {Number} waitTime - The time to wait.
     */
    function renderAudio(waitTime) {
        console.log("waiting to render audio in ", waitTime, "milliseconds");
        setTimeout(function() {
            console.log("check if can render audio");
            var rendersDone = false;

            if (hasImages) {
                rendersDone = image_container.renderOver;
            }
            if (hasVideo) {
                rendersDone = video_container.renderOver;
            }

            if (rendersDone) {
                console.log("started to render audio");
                notify("Rendering the audio", "information");
                audio_container.playForRender = true;
                audio_container.cleanForRecording();
                audio_container.play(document.getElementById("" + audio_container.fileId));
            } else {
                console.log("waiting more to render audio");
                renderAudio(1000);
            }
        }, waitTime);
    }

    if (hasImages) {
        console.log("started to render images");
        notify("Rendering the images", "information");
        var imageRenderTime = imagesDuration * 1000; //total time to render the images in milliseconds
        pushtoRender = true;
        image_container.pause();
        image_container.play();
        if (hasAudio) {
            console.log("called to render audio for images");
            totalRenderTime = imageRenderTime + (audioDuration * 1000);
            renderAudio(imageRenderTime);
            waitForRender(totalRenderTime);
        } else {
            console.log("called to render final - images");
            totalRenderTime = videoRenderTime;
            waitForRender(totalRenderTime);
        }
    }

    if (hasVideo) {
        console.log("started to render video");
        notify("Rendering the video", "information");
        var videoRenderTime = videoDuration * 1000; //total to render the video in milliseconds
        pushtoRender = true;
        video_container.preRender = true;
        document.getElementById("" + video_container.fileId).play();
        if (hasAudio) {
            console.log("called to render audio for video");
            totalRenderTime = videoRenderTime + (audioDuration * 1000);
            renderAudio(videoRenderTime);
            waitForRender(totalRenderTime);
        } else {
            console.log("called to render final - video");
            totalRenderTime = videoRenderTime;
            waitForRender(totalRenderTime);
        }
    }
}

/**
 * Starts the files upload process. Converting the imageData to blob and sends it via Ajax.
 */
function uploadFiles() {
    var done = false;
    var formData = new FormData();
    formData.append('projectName', project.getProjectName());
    formData.append('projectID', project.getProjectID());
    formData.append('email', project.email);

    var canvasRender = document.getElementById('canvas');
    var res = project.getResolution();

    formData.append('resolution', res.width + 'x' + res.height);
    canvasRender.width = res.width;
    canvasRender.height = res.height;
    var ctx = canvasRender.getContext('2d');
    if (project.renderImages.length > 0) {
        var counter = 0;
        formData.append('totalImages', project.renderImages.length);
        notify("Uploading All Rendered Frames", "information");

        /**
         * Draws the images into a canvas to convert it to a base64 string and then a blob to send to the server
         */
        function drawImages() {
            if (counter < project.renderImages.length) {
                var imageForm = new FormData();
                ctx.clearRect(0, 0, canvasRender.width, canvasRender.height);
                var image = project.renderImages[counter];
                var posX = parseInt((res.width / 2) - (image.originalWidth / 2));
                var posY = parseInt((res.height / 2) - (image.originalHeight / 2));
                ctx.putImageData(image, posX, posY);
                var imgData = canvasRender.toDataURL("image/jpeg", 1.0);
                // convert base64 string to blob
                var blobBin = atob(imgData.split(',')[1]);
                var array = [];
                for (var j = 0; j < blobBin.length; j++) {
                    array.push(blobBin.charCodeAt(j));
                }
                var file = new Blob([new Uint8Array(array)], {
                    type: 'image/jpeg'
                });

                var fieldname = filename = "image" + counter;
                console.log("making", filename);
                imageForm.append('projectID', project.getProjectID());
                imageForm.append('currImageNum', counter + 1);
                imageForm.append(fieldname, file, filename + ".jpg");

                var request = new XMLHttpRequest();
                request.open("POST", "/render");
                request.send(imageForm);
                request.onreadystatechange = function() {
                    if (request.readyState == 4) {
                        if (request.status === 200) {
                            drawImages();
                        } else {
                            swal("Error", "There was a problem with the image upload. Try again", "error");
                        }
                    }
                }
                counter += 1;
            } else {
                done = true;
                formData.append('currImageNum', counter);
            }
        }
        drawImages();
    }

    formData.append("webaudio", project.webAudioSuported);

    if (typeof audio_container.audioFile !== "undefined" && project.webAudioSuported) {
        var file = getAudioBlob();
        var fildname = filename = "audiofile";
        var ext = "wav";
        formData.append('audioExt', ext);
        formData.append(fildname, file, filename + "." + ext);
    }

    if (!project.webAudioSuported) {
        var fildname = "audiofile";
        formData.append('audioExt', audio_container.ext);
        formData.append(fildname, audio_container.file, audio_container.filename + '.' + audio_container.ext);
    }

    /**
     * Waits until all images are upload and the uploads the audio file and the project settings.
     * @param {Number} time - The time to wait.
     */
    function upload(time) {
        console.log("waiting " + time + "(s) before uploading");
        setTimeout(function() {
            if (done) {
                console.log("uploading files");
                notify("Uploading All Information and Audio Files", "information");
                var request = new XMLHttpRequest();
                request.open("POST", "/render");
                request.send(formData);
                request.onreadystatechange = function() {
                    if (request.readyState == 4) {
                        if (request.status === 200) {
                            swal("Done Uploading!", request.responseText, "success")
                        } else {
                            swal("Error", 'There was a problem with the upload.', "error");
                        }
                    }
                }
            } else {
                upload(10);
            }
        }, time * 1000); //wait some time before sending form
    }
    var timeToWait = (project.renderImages.length / 30);
    upload(timeToWait);
}

/**
 * Check if the user want to close the project
 */
function closeWindow() {
    swal({
        title: "Are you sure?",
        text: "Are you sure you want to exit? \nAny unsaved changes will be lost.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes",
        closeOnConfirm: true
    }, function() {
        window.close();
    });
}
/**
 * Sends a notification to the web page.
 * @param {string} text - The text for the notification.
 * @param {string} type - The type of the notification.
 */
function notify(text, type) {
    var n = noty({
        text: text,
        type: type,
        dismissQueue: true,
        layout: 'bottomRight',
        closeWith: ['click'],
        theme: 'relax',
        maxVisible: 10,
        force: true,
        timeout: 5000,
        animation: {
            open: 'animated bounceInUp',
            close: 'animated bounceOutDown',
            easing: 'swing',
            speed: 500
        }
    });
}

/**
 * If the user clicked the render and upload button check if the project was played at least once and warn the user.
 */
function checkIfCanRender() {
    var status = document.getElementById("renderButton").getAttribute("class");
    if (status == "disabled") {
        swal("Warning", 'In order to render you must play the project at least once.', "warning");
    } else {
        render();
    }
}

/**
 * If the user clicked the upload button check if the project was rendered and warn the user.
 */
function checkIfCanUpload() {
    var status = document.getElementById("uploadButton").getAttribute("class");
    if (status == "disabled") {
        swal("Warning", 'In order to upload you must render the project at least once.', "warning");
    } else {
        uploadFiles();
    }
}
