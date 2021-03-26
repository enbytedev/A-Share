const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const formidable = require('formidable');
const fs = require('fs');
var session = require('express-session');
var mysql = require('mysql');
var mysql = require('mysql');
const app = express();
const port = 3040;
// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
// set the app to listen on the port

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

let token = `${generate(6)}`

//upload file api
app.post('/uploadfile',upload_file);
app.get('/', open_index_page);//call for main index page

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

function upload_file(req, res, next){
   if(req.method == "POST") {
      // create an incoming form object
      var form = new formidable.IncomingForm();
      // specify that we want to allow the user to upload multiple files in a single request
      form.multiples = true;
      // store all uploads in the /uploads directory
      form.uploadDir = path.basename(path.dirname('/uploads/json_files/'))
      // every time a file has been uploaded successfully,
      // rename it to it's orignal name
      form.on('file', function(field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name), function(err){
            if (err) throw err;
            //console.log('renamed complete: '+file.name);
            const file_path = './uploads/'+file.name
          // create a JSON object
          const storage = {
            "filename": file.name,
            "token": token
          };
          // convert JSON object to string
          const data = JSON.stringify(storage);
          // write JSON string to a file
          fs.writeFile('./registry/'+token+'.txt', file.name, (err) => {
            if (err) {
              throw err;
            }
            console.log("Item's data is saved.");
          });
          });
          });
      
      function read(file, callback) {
        fs.readFile(file, 'utf8', function(err, data) {
          if (err) {
            console.log(err);
          }
          callback(data);
        });
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
          })
          fs.unlink('./registry/'+token+'.txt', (err) => {
            if (err) {
              console.error(err)
              return
            }
            console.log(`${token} has been deleted!`);
          })
          });
        res.redirect('back');

      });
      
/*
      app.post('/removetoken', function(req, res, next){
        if(req.method == "POST") {
      form.on('file', function(field, file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name), function(err){
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
      form.on('end', function() {
           //res.end('success');
           res.statusMessage = "Uploaded";
           res.statusCode = 200;
           res.redirect('/')
           res.end()
      });
      // parse the incoming request containing the form data
      form.parse(req);
    }
}

function open_index_page(req, res, next){

  if(req.method == "GET"){
       res.render('index.ejs');
   }
}

