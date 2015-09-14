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

var project = {
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

    setProjectID: function(ID) {
        if (typeof ID === 'string') {
            this.project_id = ID;
        }
    },

    getProjectID: function() {
        return this.project_id;
    },

    setProjectName: function(newName) {
        if (typeof newName === 'string') {
            this.project_name = newName;
        }
    },

    getProjectName: function() {
        return this.project_name;
    },

    setResolution: function(newResolution) {
        if (typeof newResolution === "object") {
            this.resolution = newResolution;
        }
    },

    getResolution: function() {
        return this.resolution;
    },

    addVideoFile: function(video_file) {
        this.video_files.push(video_file);
    },

    addAudioFile: function(audio_file) {
        this.audio_files.push(audio_file);
    },

    getVideoFiles: function() {
        return this.video_files;
    },

    getAudioFiles: function() {
        return this.audio_files;
    },

    /*showFileOptions: function(url, file_type) {
        if (file_type === 'video') {
            var video_element = document.createElement('video');
            video_element.src = url;
        }
        if (file_type === 'audio') {
            var audio_element = document.createElement('audio');
            audio_element.src = url;
        }
        if (file_type === 'image') {
            var image_element = document.creatElement('img');
            image_element.src = url;
        }
    },

    addToTimeline: function(file, type, idx) {
        var newFile = file.cloneNode(true);
        var span = document.createElement('span');
        span.innerHTML = '<button onclick="project.removeFromTimeline(this.parentNode)">Remove</button><br />';

        if (type === 'video') {
            newFile.addEventListener('play', function() {
                framenum = 0;
                w = this.videoWidth;
                h = this.videoHeight;
                playVideo();
            }, false);
            newFile.addEventListener('play', function() {
                console.log('play');
            }, false);
            newFile.addEventListener('pause', function() {
                this.load();
                console.log('pause');
            }, false);
        }
        if (type === 'audio') {
            span.innerHTML += '<button onclick="playAudio(document.getElementById(\'audio' + idx + '\'))">play</button>' +
                '<button onclick="document.getElementById(\'audio' + idx + '\').pause()">pause</button><br />' +
                '<button class="show" id="gainplusButton" name="gainplusButton" onclick="gainPlus()" disabled>gain +</button>' +
                '<button class="show" id="gainminusButton" name="gainminusButton" onclick="gainMinus()" disabled>gain -</button><br />';
            newFile.addEventListener('play', function() {
                document.getElementById('gainplusButton').disabled = false;
                document.getElementById('gainminusButton').disabled = false;
            }, false);
        }

        span.appendChild(newFile);

        document.getElementById('timeline').appendChild(span);
    },

    removeFromTimeline: function(element) {
        source.disconnect(gainNode);
        gainNode.disconnect(recorder);
        recorder.disconnect(audio_context.destination);
        document.getElementById('timeline').removeChild(element);
    },*/

    saveImageData: function(imageData) {
        this.renderImages.push(imageData);
    }

};

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

    this.setStart = function(time) {
        self.startTime = time;
    };

    this.setEnd = function(time) {
        self.endTime = time;
    };

    // this.newAudioContext = function() {
    //     this.audio_context = new AudioContext();
    //     console.log('4 - ' + this.audio_context);
    // };

    this.setStart = function(time, file_element) {
        console.log(time);
        notify("audio file start set to " + time, "information");
        self.startTime = time;
        self.updateTime(file_element);
    };

    this.setEnd = function(time, file_element) {
        console.log(time);
        notify("audio file end set to " + time, "information");
        self.endTime = time;
        self.updateTime(file_element);
    };

    this.updateTime = function(file_element) {
        if (typeof self.endTime == 'undefined' || self.endTime > self.startTime || self.endTime == "") {
            console.log(self.originalurl + '#t=' + self.startTime + ',' + self.endTime);
            file_element.src = self.originalurl + '#t=' + self.startTime + ',' + self.endTime;
        }
    };

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

    this.gainPlus = function() {
        if (self.gainNode.gain.value <= 2) {
            self.gainNode.gain.value += .1;
        }
        console.log(self.gainNode.gain.value);
        notify("audio volume set to " + self.gainNode.gain.value*100 + "%", "information");
    };

    this.gainMinus = function() {
        if (self.gainNode.gain.value >= 0) {
            self.gainNode.gain.value -= .1;
        }
        console.log(self.gainNode.gain.value);
        notify("audio volume set to " + self.gainNode.gain.value*100 + "%", "information");
    };

    this.cleanForRecording = function() {
        self.leftchannel = [];
        self.rightchannel = [];
        self.recordingLength = 0;
        self.leftchannel.length = self.rightchannel.length = 0;
    };

    this.updatePlayTime = function(time) {
        document.getElementById("audioTime" + idx).innerHTML = " <strong>Playing<strong> " + parseInt(time);
        document.getElementById("audioTimeEnd" + idx).innerHTML = parseInt(self.playingFile.duration);
    };

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
        // span.innerHTML = '<button class='btn btn-default' onclick="document.getElementById(\'sound-timeline\').removeChild(this.parentNode)">Remove</button><br />';
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

    this.setDuration = function(duration) {
        self.duration = duration;
        notify("images duration set to " + duration, "information");
    };

    this.addImageFile = function(image_file) {
        var image_element = document.createElement('img');
        image_element.src = URL.createObjectURL(image_file);
        self.image_files.push(image_element);
    };

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

    this.play = function() {
        console.log("play images");
        self.paused = false;
        self.frameTime = [];
        self.imagesFiles = [];
        self.startTime = (new Date()).getTime() / 1000;
        self.renderOver = false;
        self.draw();
    };

    this.pause = function() {
        console.log("stop images");
        self.framenum = 0;
        self.lasttime = 0.0;
        self.paused = true;
    };

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

    this.getAppliedFilters = function() {
        return self.appliedFilters;
    };

    this.applyFilter = function(filter, option) {
        console.log(filter);
        self.appliedFilters.push(filter);
        self.appliedFiltersName.push(option);
        self.updateAppliedFilters();
    };

    this.removeAppliedFilter = function(index) {
        self.appliedFilters.splice(index);
        self.appliedFiltersName.splice(index);
    };

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

    this.setInitTime = function() {
        self.initTime = (new Date()).getTime() / 1000;
    };

    this.resetInitTime = function() {
        self.initTime = 0;
    };

    this.setStart = function(time, file_element) {
        console.log(time);
        notify("video file start set to " + time, "information");
        self.startTime = time;
        self.updateTime(file_element);
    };

    this.setEnd = function(time, file_element) {
        console.log(time);
        notify("video file end set to " + time, "information");
        self.endTime = time;
        self.updateTime(file_element);
    };

    this.updateTime = function(file_element) {
        if (typeof self.endTime == 'undefined' || self.endTime > self.startTime || self.endTime == "") {
            console.log(self.originalurl + '#t=' + self.startTime + ',' + self.endTime);
            self.duration = self.endTime - self.startTime;
            file_element.src = self.originalurl + '#t=' + self.startTime + ',' + self.endTime;
        }
    };

    this.getAppliedFilters = function() {
        return self.appliedFilters;
    };

    this.applyFilter = function(filter, option) {
        console.log(filter);
        self.appliedFilters.push(filter);
        self.appliedFiltersName.push(option);
        self.updateAppliedFilters();
    };

    this.removeAppliedFilter = function(index) {
        self.appliedFilters.splice(index);
        self.appliedFiltersName.splice(index);
    };

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

function setStartTime(idx, element_id) {
    project.timeline[idx].setStart(document.getElementById(element_id + "_startTime").value, document.getElementById(element_id));
}

function setEndTime(idx, element_id) {
    project.timeline[idx].setEnd(document.getElementById(element_id + "_endTime").value, document.getElementById(element_id));
}

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

function setProject(projectForm) {
    //Uncomment to request id
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

function openFiles() {
    if (document.getElementById(buttonOpenFileID).getAttribute("class") !== "disabled")
        document.getElementById(inputOpenFileID).click();
}

function listFiles(filelist) {
    // var preview_filelist = "";
    var countVideo = 0,
        countImages = 0,
        countAudio = 0;

    for (var i = 0; i < filelist.files.length; i++) {
        var file = filelist.files.item(i);

        if (file.type.match(/^video\//) && project.formats.match((file.type + '').replace(/\//g, "\\/")) && countVideo < maxVideoFiles && countImages == 0) {
            var url = URL.createObjectURL(file);
            project.addVideoFile(url);
            // preview_filelist += "<li onclick='alert(\"" + file.name + "\");'>" + file.name + "</li>";
            notify("file " + file.name + " added to project", "notification");

            var video_element = document.createElement('video');
            video_element.src = url; //+ "#t=20,28";
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
            // video_element.loop = true;
            // var video_index = project.getVideoFiles().length;

            // var canvas = document.createElement('canvas');
            // var context = canvas.getContext("2d");

            // video_element.addEventListener('play', function() {
            //     // var w = this.videoWidth;
            //     // var h = this.videoHeight;
            //     // canvas.width = w;
            //     // canvas.height = h;
            //     // draw(this, context, w, h, canvas);
            //     // console.log('video was painted to canvas.');
            //     console.log('play');
            // }, false);

            // video_element.addEventListener('pause', function() {
            //     // this.play();
            //     this.load();
            //     console.log('pause');
            // }, false);

            // project.addVideoFile(video_element);
            // preview_filelist += "<li onclick='project.addToTimeline(project.getVideoFiles()[" + video_index + "], \"video\", \"" + video_index + "\")'>" + file.name + "</li>";
            // /*video_element.controls = true;
            // document.getElementById(previewID).appendChild(video_element);*/
        } else if (file.type.match(/^image\//) && countVideo == 0) {
            //project.addImageFile(URL.createObjectURL(file));
            // preview_filelist += "<li onclick='alert(\"" + file.name + "\");'>" + file.name + "</li>";
            notify("file " + file.name + " added to project", "notification");
            countImages += 1;
            if (countImages == 1) {
                image_container = new ImageContainer(i);
                project.timeline.push(image_container);
            }
            image_container.addImageFile(file);
            // var image_element = document.createElement('img');
            // image_element.src = URL.createObjectURL(file);
            // var image_index = project.getImageFiles().length;
            // project.addImageFile(image_element);
            // preview_filelist += "<li onclick='project.addToTimeline(project.getImageFiles()[" + image_index + "], \"image\", \"" + image_index + "\")'>" + file.name + "</li>";
            // /*document.getElementById(previewID).appendChild(image_element);*/
        } else if (file.type.match(/^audio\//) && project.formats.match((file.type + '').replace(/\//g, "\\/")) && countAudio < maxAudioFiles) {
            project.addAudioFile(URL.createObjectURL(file));
            // preview_filelist += "<li onclick='alert(\"" + file.name + "\");'>" + file.name + "</li>";
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
            // var audio_index = project.getAudioFiles().length;
            // audio_element.id = "audio" + audio_index;
            // audio_element.controls = true;
            // project.addAudioFile(audio_element);
            // // var audioT = new AudioContainer(audio_element, url);
            // // audioT.newAudioContext();
            // // audioT.createAudioContext();
            // preview_filelist += "<li onclick='project.addToTimeline(project.getAudioFiles()[" + audio_index + "], \"audio\", \"" + audio_index + "\")'>" + file.name + "</li>";
            // /*audio_element.controls = true;
            // document.getElementById(previewID).appendChild(audio_element);*/
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

    // document.getElementById(previewID).innerHTML += preview_filelist;

    console.log(project.getVideoFiles());
    console.log(image_container != null ? image_container.image_files : null);
    console.log(project.getAudioFiles());
    console.log(project.timeline);
}

/*function draw(video_frame, canvas_ctx, width, height, canvas) {
    //TODO meter a passar o video frame a frame
    if (video_frame.paused || video_frame.ended) {
        //console.log(project.imagesFiles);
        console.log("done");
        framenum = 0;
        w = width;
        h = height;
        playVideo();
        return false;
    }
    canvas_ctx.drawImage(video_frame, 0, 0, width, height);
    project.saveImageData(canvas_ctx.getImageData(0, 0, width, height));
    console.log('Duration:', video_frame.duration, ' Current:', video_frame.currentTime, ' Frame:', project.imagesFiles.length);
    setTimeout(draw, 1000 / 60., video_frame, canvas_ctx, width, height, canvas);
}*/

// function playVideo() {
//     if (framenum < project.imagesFiles.length) {
//         var canvas = document.getElementById('canvas');
//         canvas.width = w;
//         canvas.height = h;
//         var ctx = canvas.getContext('2d');
//         ctx.putImageData(project.imagesFiles[framenum], 0, 0);
//         framenum += 1;
//         // setTimeout(playVideo, 1000/60., framenum, w, h); //este metodo nao funciona muito lag
//         setTimeout(function() {
//             window.requestAnimationFrame(playVideo);
//         }, 1000 / 60); // não se encontra sincronizado com o video
//     }
// }

/*function createAudioContext(file) {
    recordingLength = 0;
    leftchannel.length = rightchannel.length = 0;

    source = audio_context.createMediaElementSource(file);

    sampleRate = audio_context.sampleRate;


    gainNode = audio_context.createGain();
    source.connect(gainNode);
    // gainNode.connect(audio_context.destination);

    // analyser = audio_context.createAnalyser();
    // analyser.fftSize = 2048;
    // var bufferLength = analyser.frequencyBinCount;
    // var dataArray = new Uint8Array(bufferLength);
    // analyser.getByteTimeDomainData(dataArray);

    var bufferSize = 2048;
    recorder = audio_context.createScriptProcessor(bufferSize, 2, 2);

    recorder.onaudioprocess = function(e) {
        if (!document.getElementById('audio0').paused) {
            console.log('recording');
            var left = e.inputBuffer.getChannelData(0);
            var right = e.inputBuffer.getChannelData(1);
            // we clone the samples
            leftchannel.push(new Float32Array(left));
            rightchannel.push(new Float32Array(right));
            recordingLength += bufferSize;
            //inputToOutput(e);
        } else {
            //inputToOutput(e);
        }
    }

    console.log(file, source, sampleRate, gainNode, analyser, recorder);

    // gainNode.connect(recorder);
    //analyser.connect(recorder);

    gainNode.gain.value = 0;
    gainNode.connect(audio_context.destination);
}*/

function inputToOutput(e, noSound) {
    if (!noSound) {
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
}

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

function writeUTFBytes(view, offset, string) {
    var lng = string.length;
    for (var i = 0; i < lng; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

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

function uploadFiles() {
    var done = false;
    var formData = new FormData();
    formData.append('projectName', project.getProjectName());
    formData.append('projectID', project.getProjectID());
    formData.append('email', project.email);

    var canvasRender = document.getElementById('canvas');
    var res = project.getResolution();

    // console.log(' position', posX, posY);

    formData.append('resolution', res.width + 'x' + res.height);
    canvasRender.width = res.width;
    canvasRender.height = res.height;
    var ctx = canvasRender.getContext('2d');
    if (project.renderImages.length > 0) {
        var counter = 0;
        formData.append('totalImages', project.renderImages.length);
        notify("Uploading All Rendered Frames", "information");
        //for (var i = 0; i < project.renderImages.length; i++) {
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

    if (typeof audio_container.audioFile !== "undefined" && project.webAudioSuported) { //project.getAudioFiles().length > 0) {
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
/*function gainPlus() {
    var step = 1 / (60);
    console.log(gainNode.gain.value);
    gainNode.gain.cancelScheduledValues(audio_context.currentTime);
    gainNode.gain.setTargetAtTime(1.0, audio_context.currentTime, 1);
    // gainNode.gain.exponentialRampToValueAtTime(1.0, audio_context.currentTime+5);
    console.log(gainNode.gain.value, audio_context.currentTime + 5);

    // var timeout = setInterval( function() {
    //     if(gainNode.gain.value < 1.0) {
    //         step += step;
    //         gainNode.gain.value = Math.pow(step, 2) > 1 ? 1 : Math.pow(step, 2);
    //     } else {
    //         clearInterval(timeout);
    //     }
    //     console.log(gainNode.gain.value, step); 
    // }, 5000/60);
}

function gainMinus() {
    var step = 1 / (60);
    console.log(gainNode.gain.value);
    gainNode.gain.cancelScheduledValues(audio_context.currentTime);
    gainNode.gain.setTargetAtTime(0.0, audio_context.currentTime, 0.8);
    // gainNode.gain.exponentialRampToValueAtTime(0.01, audio_context.currentTime+5);
    console.log(gainNode.gain.value, audio_context.currentTime + 5);

    // var timeout = setInterval( function() {
    //     if(gainNode.gain.value > 0.0) {
    //         step += step;
    //         gainNode.gain.value -= Math.pow(step, 2) < 0 ? 0 : Math.pow(step, 2);
    //     } else {
    //         clearInterval(timeout);
    //     }
    //     console.log(gainNode.gain.value, step);
    // }, 5000/60);
}*/

function hasContext(id) {
    function checkContext(value) {
        return value === id;
    }
    return audio_ids.filter(checkContext).length === 1 ? true : false;
}

function playAudio(element) {
    if (element.paused) {
        if (!hasContext(element.id)) {
            createAudioContext(element);
            audio_ids.push(element.id);
            console.log('entrou')
        }
        gainNode.gain.cancelScheduledValues(audio_context.currentTime);
        gainPlus();
        element.play();;
    }
}

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

function checkIfCanRender() {
    var status = document.getElementById("renderButton").getAttribute("class");
    if (status == "disabled") {
        swal("Warning", 'In order to render you must play the project at least once.', "warning");
    } else {
        render();
    }
}

function checkIfCanUpload() {
    var status = document.getElementById("uploadButton").getAttribute("class");
    if (status == "disabled") {
        swal("Warning", 'In order to upload you must render the project at least once.', "warning");
    } else {
        uploadFiles();
    }
}
