var inputOpenFileID = 'openfiles',
    buttonOpenFileID = 'openfilesButton',
    contentDivID = 'content',
    previewID = "preview";

var project = {
    project_name: 'Untitled',

    resolution: {
        width: 1920,
        height: 1080
    },

    video_files: [],
    image_files: [],
    audio_files: [],

    video_frames: {},

    supportedVideoFormat: {
        ogg: false,
        h264: false,
        webm: false
    },

    supportedAudioFormat: {
        ogg: false,
        mp3: false,
        m4a: false
    },

    formats: 'image/*,',

    setSupportedFormats: function() {
        if (Modernizr.video['ogg']) {
            this.supportedVideoFormat.ogg = true;
            this.formats += 'video/ogg,';
        }

        if (Modernizr.video['h264']) {
            this.supportedVideoFormat.h264 = true;
            this.formats += 'video/h264,';
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

        document.getElementById(inputOpenFileID).setAttribute('accept', this.formats);

        console.log("This browser has video support for: " +
            "\nogg:" + this.supportedVideoFormat.ogg +
            "\nh264:" + this.supportedVideoFormat.h264 +
            "\nwebm:" + this.supportedVideoFormat.webm +
            "\nThis browser has audio support for: " +
            "\nogg:" + this.supportedAudioFormat.ogg +
            "\nmp3:" + this.supportedAudioFormat.mp3 +
            "\nm4a:" + this.supportedAudioFormat.m4a);
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

    addImageFile: function(image_file) {
        this.image_files.push(image_file);
    },

    addAudioFile: function(audio_file) {
        this.audio_files.push(audio_file);
    },

    getVideoFiles: function() {
        return this.video_files;
    },

    getImageFiles: function() {
        return this.image_files;
    },

    getAudioFiles: function() {
        return this.audio_files;
    }, 

    addToTimeline: function(file) {
        document.getElementById('timeline').appendChild(file);
    }

};

function setProject(projectForm) {
    var newName = projectForm.pname.value,
        newWidth = projectForm.pwidth.value,
        newHeight = projectForm.pheight.value;

    if (newName !== '' && newName !== null) {
        project.setProjectName(newName);
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

    projectForm.setAttribute("class", "hide");

    project.setSupportedFormats();

    document.getElementById(buttonOpenFileID).setAttribute("class", "show");

    return false;
}

function openFiles() {
    document.getElementById(inputOpenFileID).click();
}

function listFiles(filelist) {
    var preview_filelist = "";
    for (var i = 0; i < filelist.files.length; i++) {
        var file = filelist.files.item(i);

        if (file.type.match(/^video\//) && project.formats.match((file.type + '').replace(/\//g, "\\/"))) {
            var video_element = document.createElement('video');
            video_element.src = URL.createObjectURL(file);
            var video_index = project.getVideoFiles().length;
            project.addVideoFile(video_element);
            preview_filelist += "<li onclick='project.addToTimeline(project.getVideoFiles()[" + video_index + "])'>" + file.name + "</li>";
            /*video_element.controls = true;
            document.getElementById(previewID).appendChild(video_element);*/
        } else if (file.type.match(/^image\//)) {
            var image_element = document.createElement('img');
            image_element.src = URL.createObjectURL(file);
            var image_index = project.getImageFiles().length;
            project.addImageFile(image_element);
            preview_filelist += "<li onclick='project.addToTimeline(project.getImageFiles()[" + image_index + "])'>" + file.name + "</li>";
            /*document.getElementById(previewID).appendChild(image_element);*/
        } else if (file.type.match(/^audio\//) && project.formats.match((file.type + '').replace(/\//g, "\\/"))) {
            var audio_element = document.createElement('audio');
            audio_element.src = URL.createObjectURL(file);
            var audio_index = project.getAudioFiles().length;
            project.addAudioFile(audio_element);
            preview_filelist += "<li onclick='project.addToTimeline(project.getAudioFiles()[" + audio_index + "])'>" + file.name + "</li>";
            /*audio_element.controls = true;
            document.getElementById(previewID).appendChild(audio_element);*/
        } else {
            alert("The selected file: " + file.name + ", with type: " + file.type + " isn't valid.");
        }
    }

    document.getElementById(previewID).innerHTML += preview_filelist;

    console.log(project.getVideoFiles());
    console.log(project.getImageFiles());
    console.log(project.getAudioFiles());
}