var express = require('express'),
    http = require('http'),
    fs = require('fs'),
    path    = require('path'),
    dust = require("dustjs-linkedin"),
    dust_helpers = require("dustjs-helpers"),
    cons = require('consolidate'),
    events = require('events'),
    emitter = new events.EventEmitter(),
    Q = require('q'),
    mysql      = require('mysql'),
    authCredential = require('./auth-token'),
    Imap = require('imap');

var done = false;

var connection = mysql.createConnection({
  host     : authCredential['connection']['host'],
  user     : authCredential['connection']['user'],
  password : authCredential['connection']['password'],
  database : authCredential['connection']['database'],
  port : authCredential['connection']['port']
});
   

var app = express();
app.use(express.bodyParser({
    keepExtensions: true
}));
app.use(express.cookieParser('pdpcookie'));
app.use(express.session());

//app.use(express.statics(ckStaticsPath));

app.engine('dust', cons.dust);
app.set('view engine', 'dust');
app.set('views', __dirname + '/templates');

// For logging requests
// app.use(express.logger('dev'));

// this should always be above the wildcard route
app.get('/login', function (req, res) {
    var isError = req.query.error;
    res.render('MasterPageTemplate', {
        "Pages": [{
            'pagetype': 'login'
        }]
    });
});

function auth(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

// dashboard
app.get('/', auth, function (req, res) {

    //console.log(accountsJSON, talentpoolJSON, openpositionsJSON);
    res.render('MasterPageTemplate', {
        "Pages": [{
            'pagetype': 'dashboard',
            'username' : req.session.username
        }]
    });

    
});

// Create Questions page
app.get('/createquest', auth, function (req, res) {

    //console.log(accountsJSON, talentpoolJSON, openpositionsJSON);
    res.render('MasterPageTemplate', {
        "Pages": [{
            'pagetype': 'createquestion',
            'username' : req.session.username
        }]
    });

    
});

app.post('/login', function (req, res) {
    var email = req.body.email,
        password = req.body.password;


    /*var imap = new Imap ({
        user: email,
        password: password,
        host: '192.168.1.2',
    });
    imap.connect();
    
    imap.once('ready', function() {
        console.log(imap);

    });

    imap.once('error', function(err) {
      console.log(err);
    });
     
    imap.once('end', function() {
      console.log('Connection ended');
    });
    */
     
    
        
    if(authCredential['login'][email] && authCredential['login'][email] == password){
        req.session.regenerate(function () {
            req.session.isAuthenticated = true;
            req.session.token = email+(new Date()).getTime();
            req.session.email = email;
            req.session.username = email.split('@')[0];
            res.redirect('/');
        });
    } else {
        res.redirect('/login?error');
    }
});

//Logout User session
app.get('/logout', function (req, res) {

    req.session.destroy();
    res.redirect('/login');
    
});

/*
*** Route Service to Provide Subjects from Database
*/
app.get('/qba/subjects', function (req, res) {
    
    connection.query('SELECT SubjectId , SubjectName from Subjects', function(err, rows, fields) {
        
        //connection.end();
        if (!err){
            //console.log('The Subjects are: ', rows);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(rows));
        }  else {
            console.log('Error while performing Query.',err);
        }
        
      });

    
});

/*
*** Route Service to Provide SubTopics from Database for Selected Subject
*/
app.post('/qba/subtopics', function (req, res) {
    var selectedSubject = req.body.subjectid;
    connection.query('SELECT SubTopicId , Title from SubTopics where SubjectId = "'+selectedSubject+'"', function(err, rows, fields) {

        if (!err){
            //console.log('The subTopics are: ', rows);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(rows));
        }  else {
            console.log('Error while performing Query.',err);
        }
        
      });
    
});

/*
*** Route Service to Provide Answer Types from Database
*/
app.get('/qba/answertypes', function (req, res) {
    
    connection.query('SELECT AnswerTypeId , State from AnswerType', function(err, rows, fields) {

        if (!err){
//            console.log('The Answertypes are: ', rows);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(rows));
        }  else {
            console.log('Error while performing Query.',err);
        }
        
      });
    
});

/*
*** Route Service to Provide Question Levels from Database
*/
app.get('/qba/questionlevels', function (req, res) {
    
    connection.query('SELECT TypeId , State from Types', function(err, rows, fields) {

        if (!err){
//            console.log('The Answertypes are: ', rows);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(rows));
        }  else {
            console.log('Error while performing Query.',err);
        }
        
      });
    
});

app.post('/api/photos', function (req, res) {
    //console.log(req.files);

    var files = req.files,
        buckets = req.body.buckets ? req.body.buckets.split(',') : [],
        insObj = [],
        newArr = [],
        key = 0;    
    files = (files.constructor == Array) ? files : [files];
    for (var file in files[0]) {       
        newArr.push(files[0][file]);
    }
    //console.log( newArr);
    newArr.forEach(function(icon) {
        icon = (icon.constructor == Array) ? icon[0] : icon;        
        var fileType = icon.originalFilename.split('.').pop(),
            fileName = icon.originalFilename.split('.')[0];

        console.log(fileName, fileType,icon.path, __dirname + "\\uploads\\"+icon.originalFilename);
        
        
        fs.readFile(icon.path, function (err, data) {
          // ...
          var newPath = __dirname + "\\uploads\\" +icon.originalFilename;
          console.log(newPath,data);

          fs.writeFile(newPath, data, function (err) {
            res.redirect("back");
          });
        });
    
        
    });
     
    
});




/*
*** Route Service to Create Question in Questions Table in DB
*/
app.post('/createquestion', function (req, res) {
    console.log(req.body, req.files);
    var parameters = req.body;
    var obj = {};
    console.log(parameters);

   /* console.log(JSON.stringify(obj));
    connection.query('INSERT INTO Questions SET ?', obj, function(error){
        if(error){

          console.log(error.message);
        }else{
          console.log('succes');
          res.end("Successfully created");

        }
      });*/
    
});

connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... \n\n");  
} else {
    console.log("Error connecting database :", err);  
}
});



app.use("/",express.static(__dirname + "/static"));

app.listen(3000);