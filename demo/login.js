
// Please check README before running this
// Logs in to Meocloud and obtains your access token and token secret
// You'll need those to use the examples

require('./auth.js');

var OAuth = require('oauth').OAuth;
var Step = require('step');
var colors = require('colors');

var REQUEST_TOKEN_URL = 'https://meocloud.pt/oauth/request_token';
var ACCESS_TOKEN_URL = 'https://meocloud.pt/oauth/access_token';
var OAUTH_VERSION = '1.0';
var HASH_VERSION = 'HMAC-SHA1';


function getAccessToken(oa, oauth_token, oauth_token_secret, pin) {
  oa.getOAuthAccessToken(oauth_token, oauth_token_secret, pin,
    function(error, oauth_access_token, oauth_access_token_secret, results2) {
      if (error) {
        if (parseInt(error.statusCode) == 401) {
          throw new Error('The pin number you have entered is incorrect'.bold.red);
        }
      }
      console.log('Your OAuth Access Token: '.green + (oauth_access_token).bold.cyan);
      console.log('Your OAuth Token Secret: '.green + (oauth_access_token_secret).bold.cyan);
      console.log('Now, edit auth.js and fill in these two values. Have fun with Meocloud api, Check out https://meocloud.pt/documentation.'.bold.yellow);
      process.exit(1);
    });
}

function getRequestToken(oa) {
  
  oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
    if(error) {
      throw new Error(([error.statusCode, error.data].join(': ')).bold.red);
    } else {
      console.log('In your browser, log in to your Meocloud account. Then visit:'.bold.green)
      console.log(('https://meocloud.pt/oauth/authorize?oauth_token=' + oauth_token).underline.green)
      console.log('After logged in, you will be prompted with a pin number'.bold.green)
      console.log('Enter the pin number here:'.bold.yellow);
      var stdin = process.openStdin();
      stdin.on('data', function(chunk) {
        pin = chunk.toString().trim();
        getAccessToken(oa, oauth_token, oauth_token_secret, pin);
      });
    }
  });
}
    

var oa = new OAuth(REQUEST_TOKEN_URL, ACCESS_TOKEN_URL, key, secret, OAUTH_VERSION , "oob", HASH_VERSION);
getRequestToken(oa);
