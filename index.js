const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');
var url = require('url');
var router = express.Router();
const app = express();
const port = 80;
const {fullURL} = require('./config.json');
// configure middleware
app.use(function(req, res, next){
  res.locals.message = 'Upload a file to get a token or use a token to remove a file.';
  next();
});
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client

function generate(n) {
  var add = 1,
  max = 12 - add;
  
  if (n > max) {
    return generate(max) + generate(n - max);
  }
  
  max = Math.pow(10, n + add);
  var min = max / 10; // Math.pow(10, n) basically 
  var number = Math.floor(Math.random() * (max - min + 1)) + min;
  
  return ("" + number).substring(add);
}

//upload file api
app.post('/uploadfile',upload_file);
app.get('/', open_index_page);//call for main index page

app.get('/c/:cPath', function(req, res) {
  res.sendFile(req.params.cPath, { root: "./uploads" });
});



app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

function upload_file(req, res, next){
   if(req.method == "POST") {
      var newToken = `${generate(6)}`
      var fileDisc = `${generate(4)}`
      // create an incoming form object
      var form = new formidable.IncomingForm();
      // specify that we want to allow the user to upload multiple files in a single request
      form.multiples = false;
      // store all uploads in the /uploads directory
      form.uploadDir = path.basename(path.dirname('/uploads/json_files/'))
      // every time a file has been uploaded successfully,
      // rename it to it's orignal name
      form.on('file', function(field, file) {
        filename0 = file.name.replace(/ |-/g, '-');
        fs.rename(file.path, path.join(form.uploadDir, filename0), function(err){
            if (err) throw err;
            const file_path = './uploads/'+filename0
            
          fs.rename(`./uploads/${filename0}`, `./uploads/${fileDisc}-${filename0}`, function(err) {
            if ( err ) console.log('ERROR: ' + err);
          });
          const storage = {
            "filename": filename0,
            "token": newToken
          };
          // convert JSON object to string
          const data = JSON.stringify(storage);
          // write JSON string to a file
          fs.writeFile('./registry/'+newToken+'.txt', fileDisc+'-'+filename0, (err) => {
            if (err) {
              throw err;
            }
          });
          });
        form.on('end', function() {
          //res.end('success');
          res.send(`Your file has been uploaded with a token of: <b>${newToken}</b>. Your file is located at: <a href=${fullURL}/c/${fileDisc}-${filename0}><b>${fullURL}/c/${fileDisc}-${filename0}</b></a>`);
        });
      })
      function read(file, callback) {
        fs.readFile(file, 'utf8', function(err, data) {
          if (err) {
            console.log(err);
          }
          callback(data);
        });
    }
      
      function success(req, res, next) {
          next();
      }
      
      app.post('/removetoken', function(req, res) {
        var token = req.body.token;
        fs.readFile('./registry/'+token+'.txt', 'utf8' , (err, data) => {
          if (err) {
            console.error(err)
            return
          }
          var output = read('./registry/'+token+'.txt', function(data) {
            fs.unlink('./uploads/'+data, (err) => {
              console.log(data)
              if (err) {
                console.error(err)
                return
              }})
            return res.send(`File associated with <b>${token}</b> has been deleted!`);
          })
          fs.unlink('./registry/'+token+'.txt', (err) => {
            if (err) {
              console.error(err)
              return
            }
          })
          });
        });
      
/*
      app.post('/removetoken', function(req, res, next){
        if(req.method == "POST") {
      form.on('file', function(field, file) {
        fs.rename(file.path, path.join(form.uploadDir, filename0), function(err){
          if (err) throw err;
          fs.readFile('./registry/'+req.body.token+'.txt', 'utf8' , (err, data) => {
            if (err) {
              throw err;
            }})})})
        }});
*/
      
      // log any errors that occur
      form.on('error', function(err) {
          console.log('An error has occurred: \n' + err);
      });
      // once all the files have been uploaded, send a response to the client

      // parse the incoming request containing the form data
      form.parse(req);
    }
}

function open_index_page(req, res, next){

  if(req.method == "GET"){
    res.render('index', {message: res.locals.message});
   }
}


