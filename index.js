var fs = require('fs');
var express = require('express');
var hash = require('pbkdf2-password')()
var path = require('path');
var session = require('express-session');

var app = module.exports = express();

const {token} = require('./config.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
};


app.use(express.urlencoded({ extended: false }))
app.use(session({
  resave: false, 
  saveUninitialized: false,
  secret: 'a very secret secret'
}));

app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});

var users = {
  admin: { name: 'admin' }
};

hash({ password: `${password}` }, function (err, pass, salt, hash) {
  if (err) throw err;
  users.admin.salt = salt;
  users.admin.hash = hash;
});

function authenticate(name, pass, fn) {
  if (!module.parent) console.log('authenticating %s:%s', name, pass);
  var user = users[name];

  if (!user) return fn(new Error('cannot find user'));

  hash({ password: pass, salt: user.salt }, function (err, pass, salt, hash) {
    if (err) return fn(err);
    if (hash === user.hash) return fn(null, user)
    fn(new Error('invalid password'));
  });
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

app.get('/', function(req, res){
  res.redirect('/login');
});

app.get('/panel', restrict, function(req, res){
  res.render('panel', { fs: fs });
});

app.get('/logout', function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.get('/login', function(req, res){
  res.render('login');
});

app.post('/login', function(req, res){
  authenticate("admin", req.body.token, function(err, user){
    if (user) {
      req.session.regenerate(function(){
        req.session.user = user;
        req.session.success = `Success! File ID's have shifted!`
        res.redirect('/login');
        console.log(`${generate(8)}`);
        
        fs.readdir('content/PNG', (err, files) => {
          files.forEach(file => {
            fs.rename('content/PNG/'+file, 'content/PNG/'+`${generate(8)}`+'.png', function(err) {
              if ( err ) console.log('ERROR: ' + err);
            });
          });
        });
        fs.readdir('content/MP4', (err, files) => {
          files.forEach(file => {
            fs.rename('content/MP4/'+file, 'content/MP4/'+`${generate(8)}`+'.mp4', function(err) {
              if ( err ) console.log('ERROR: ' + err);
            });
          });
        });
        fs.readdir('content/GIF', (err, files) => {
          files.forEach(file => {
            fs.rename('content/GIF/'+file, 'content/GIF/'+`${generate(8)}`+'.gif', function(err) {
              if ( err ) console.log('ERROR: ' + err);
            });
          });
        });
        
      });
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' token was entered correctly!'
      res.redirect('/login');
    }
  });
});

if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}