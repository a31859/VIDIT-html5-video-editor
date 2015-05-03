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

    setProjectName: function(newName){
        if(typeof newName === 'string') {
            this.project_name = newName;
        }
    },

    getProjectName: function(){
        return this.project_name;
    },

    setResolution: function(newResolution) {
        if(typeof newResolution === "object") {
            this.resolution = newResolution;
        }
    },

    getResolution: function(){
        return this.resolution;
    },

    addVideoFile: function(video_file){
        this.video_files.push(video_file);
    }, 

    addImageFile: function(image_file){
        this.image_files.push(image_file);
    },

    addAudioFile: function(audio_file){
        this.audio_files.push(audio_file);
    },

    getVideoFiles: function(){
        return this.video_files;
    }, 

    getImageFiles: function(){
        return this.image_files;
    },

    getAudioFiles: function(){
        return this.audio_files;
    }

};


function setProject(projectForm){
    var newName = projectForm.pname.value, 
        newWidth = projectForm.pwidth.value, 
        newHeight = projectForm.pheight.value;

    if(newName !== '' && newName !== null) {
        project.setProjectName(newName);
    }
    

    if (newWidth !== '' && newWidth !== null && newHeight !== '' && newHeight !== null) {
        resolution = {width:newWidth, height:newHeight};
        project.setResolution(resolution); 
    }

    console.log(project.getProjectName());
    var res = project.getResolution();
    console.log("Resolution -> " + res.width + " x " + res.height);

    projectForm.setAttribute("class","hide");

    document.getElementById('openfilesButton').setAttribute("class","show");

    return false;
}

function openFiles(){
    document.getElementById('openfiles').click();
}

function listFiles(filelist) {
    for(var i = 0; i < filelist.files.length; i++){
        var file = filelist.files.item(i);
        if(file.type.match(/^video\//)) {
            var video_element = document.createElement('video');
            video_element.src = URL.createObjectURL(file);
            project.addVideoFile(video_element);
            video_element.controls = true;
            document.getElementById("content").appendChild(video_element);
        }
        if(file.type.match(/^image\//)) {
            var image_element = document.createElement('img');
            image_element.src = URL.createObjectURL(file);
            project.addImageFile(image_element);
            document.getElementById("content").appendChild(image_element);
        }
        if(file.type.match(/^audio\//)) {
            var audio_element = document.createElement('audio');
            audio_element.src = URL.createObjectURL(file);
            project.addAudioFile(audio_element);
            audio_element.controls = true;
            document.getElementById("content").appendChild(audio_element);
        }
    }
    console.log(project.getVideoFiles());
    console.log(project.getImageFiles());
    console.log(project.getAudioFiles());
}