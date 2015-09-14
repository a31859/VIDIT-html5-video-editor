/*Dependencies.*/
var express = require("express");
var multer = require("multer");
var crypto = require("crypto");
var fs = require("fs-extra");
var cp_execF = require('child_process').execFile,
    cp_exec = require('child_process').exec,
    //readline = require('readline'),
    child,
    child_audio,
    numFiles;
require('./auth.js');
require('./email_auth.js');
var NodeCloudPT = require('./NodeCloudPT.js');
var nodemailer = require('nodemailer');
var colors = require('colors');

// var rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

var app = express();
var port = 3000;
var done = false;
var fileUploaded = false;
var destination = "";

/*Routes*/
app.use(multer({
    dest: './uploads/',
    changeDest: function(dest, req, res) {
        destination = dest.substring(2) + req.body.projectID;
        return dest + req.body.projectID;
    },
    rename: function(fieldname, filename) {
        // var name = filename.split('.')[0];
        // var ext = filename.split('.')[1];
        return filename; //+ "_" + Date.now() + ext;
    },
    onFileUploadStart: function(file) {
        console.log(file.originalname + ' is starting ...');
        fileUploaded = false;
    },
    onFileUploadComplete: function(file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path);
        fileUploaded = true;
        if(file.fieldname == 'audiofile'){
        	done = true;
        }
    }
}));

app.use('/', express.static('./public/'));

app.post('/render', function(req, res) {
    console.log('Request Body'.bold.yellow, req.body);
    var projectName = req.body.projectName;
    var projectID = req.body.projectID;
    var email = req.body.email;
    var resolution = req.body.resolution;
    /*var images = req.body.images;*/
    var webAudioSuported = req.body.webaudio;
    var ext = req.body.audioExt;
    var audiofile = '/audiofile.' + ext;
    var totalImages = req.body.totalImages;
    var currImageNum = req.body.currImageNum;

    function makeVideo() {
        console.log('----- making video -----'.bold.cyan);
        child = cp_execF('ffmpeg', ['-f', 'image2', '-framerate', '30', '-i', destination + '/image%d.jpg', '-i', destination + audiofile, '-strict', '-2', '-shortest', destination + '/render.mp4'],
            function(err, stdout, stderr) {
                /*uncomment all for debug*/
                console.log("making video error:".bold.red + err);
                // console.log("making video stdout:".bold.green + stdout);
                // console.log("making video stderr:".bold.red + stderr);
                console.log('Done making file.');

                var id = crypto.randomBytes(8).toString('hex'); // generate random id

                var cloudpt = new NodeCloudPT({
                    oauth: {
                        consumer_key: key,
                        consumer_secret: secret,
                        token: access_token,
                        token_secret: token_secret
                    }
                });
                var transporter = nodemailer.createTransport({
                    // service: 'Gmail',
                    // auth: {
                    //     user: '',
                    //     pass: ''
                    // }
                    host: 'smtp-mail.outlook.com',
                    port: 587,
                    auth: auth
                });

                fs.exists(destination + '/render.mp4', function(exists) {
                    if (exists == true) {
                        cloudpt.upload({
                            path: "/testFolder/render_" + id + ".mp4",
                            file: destination + '/render.mp4',
                            overwrite: "true"
                        }, function(data) {
                            console.log(data);
                            cloudpt.media({
                                path: "/testFolder/render_" + id + ".mp4",
                                file: destination + '/render.mp4'
                            }, function(data) {
                                data = JSON.parse(data);
                                console.log(data);
                                var url = data.url;
                                var expires = data.expires;

                                // NB! No need to recreate the transporter object. You can use
                                // the same transporter object for all e-mails

                                // setup e-mail data with unicode symbols
                                var mailOptions = {
                                    from: 'VIDIT <theguide@outlook.pt>', // sender address
                                    to: email + '', // list of receivers
                                    subject: 'Render for ' + projectName + ' Finished', // Subject line
                                    //text: 'Hello world!!! ', // plaintext body
                                    html: 'Your render for the project ' + projectName + ' was finished... You can get the <b>final render</b> requested <a href="' + url + '" download>here</a>. <br />The link expires in ' + expires + '.' // html body
                                };

                                // send mail with defined transport object
                                transporter.sendMail(mailOptions, function(error, info) {
                                    if (error) {
                                        console.log("Error ->".red, error);
                                    } else {
                                        console.log('Message sent:'.cyan, info.response);
                                    }
                                });
                            });
                        });
                    } else {
                        // NB! No need to recreate the transporter object. You can use
                        // the same transporter object for all e-mails

                        // setup e-mail data with unicode symbols
                        var mailOptions = {
                            from: 'VIDIT <theguide@outlook.pt>', // sender address
                            to: email + '', // list of receivers
                            subject: 'Problem with your Project ' + projectName, // Subject line
                            //text: 'Hello world!!! ', // plaintext body
                            html: 'Sorry but there was an error with the making of your render.<br /> We apologise for the inconvenience, please try to make the render again.<br /> Or contact us and give the code <strong>' + projectID + '</strong> and we\'ll try see what we can do.' // html body
                        };

                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Message sent: ' + info.response);
                            }
                        });
                    }
                });

            }
        );

        child.stderr.on('data', function(data) {
            if (data.toString().match(/\[Y\/N\]/ig)) {
                child.stdin.write('Y');
                child.stdin.end();
            }
            if (data.toString().match(/frame=/ig)) {
                var lineArray = data.toString().toLowerCase().split(' ').filter(function(value) {
                    if (value !== 'undefined') {
                        return value;
                    }
                });
                var index = lineArray.indexOf('frame=');
                var frameNumber = lineArray[index + 1];

                console.log("progress-> " + Math.round(frameNumber / numFiles * 100) + "%");
            }

        });
    }

    if(fileUploaded && !done){
    	res.send(200);
    }

    if (done && totalImages == currImageNum) {
        /*for (var i = 0; i < images.length; i++) {
            var filedata = images[i].split('####');
            var filepath = destination + "/" + filedata[0] + ".jpg";
            var base64Data = filedata[1].replace(/^data:image\/jpeg;base64,/, "");
            fs.writeFile(filepath, base64Data, 'base64', function(err) {
                console.log(err);
            });
        }*/
        if (webAudioSuported == 'false') {
            console.log("No support for web audio api.");
            console.log('----- making audio -----'.bold.cyan);
            child_audio = cp_execF('ffmpeg', ['-i', destination + '/audio_video_file.' + ext, '-vn', '-strict', '-2', destination + '/audiofile.mp3'],
                function(error, stdout, stderr) {
                    /*uncomment all for debug*/
                    console.log("audio convert error: ".bold.red, error);
                    //console.log("audio convert stdout:".bold.green + stdout);
                    //console.log("audio convert stderr:".bold.red + stderr);

                    audiofile = '/audiofile.mp3';
                    makeVideo();
                }
            );

            child_audio.stderr.on('data', function(data) {
                //console.log("data-> " + data.toString());
                if (data.toString().match(/\[Y\/N\]/ig)) {
                    child_audio.stdin.write('Y');
                    child_audio.stdin.end();
                    //   	rl.question(data.toString(), function(answer) {
                    //   		child_audio.stdin.write('' + answer);
                    //   		child_audio.stdin.end();
                    // 	console.log('input-> ' + answer);	
                    // });
                }
                if (data.toString().match(/size=/ig)) {
                    var line = data.toString();
                    console.log("progress-> " + line);
                }

            });
        } else {
            makeVideo();
        }

        cp_exec('ls -l ' + destination + '/*.jpg | wc -l', function(error, stdout, stderr) {
            /*uncomment all for debug*/
            console.log("cp_exec error:".bold.red, error);
            // console.log("stdout:" + stdout);
            // console.log("stderr:" + stderr);
            numFiles = stdout;
        });

        res.send('All files uploaded successfully...\nAn Email will be send when the render is done');
        done = false;
    }
});

app.get('/getUniqueID', function(req, res) {
    var id = crypto.randomBytes(15).toString('hex');
    console.log('Generated id =', id);
    var path = '/uploads/' + id;

    fs.mkdirs(__dirname + path, function(err) {
        if (err) {
            return console.error(err);
        } else {
            console.log(__dirname + path, "- Created with Success!");
            res.send(id);
        }
    });
});

/*Server*/
app.listen(port, function() {
    console.log('App listening at port: %s', port);
});
