var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');

var indexRouter = require('./server/routes/index');
var usersRouter = require('./server/routes/users');
var comments = require('./server/controllers/comments');

//mongoose
var mongoose = require('mongoose');
// session save module
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// import passport and flash Message module
var passport = require('passport');
var flash = require('connect-flash');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'server/views/pages'));
app.set('view engine', 'ejs');

// database setting
var config = require('./server/config/config.js');
// connect to database
mongoose.connect(config.url);
// check for mongoDB connecting
mongoose.connection.on('error', function(){
  console.error('MongoDB Connection Error');
});
// passport setting
require('./server/config/passport')(passport);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

//passport session password
app.use(session({
  secret : 'sometextgohere',
  saveUninitialized : true,
  resave : true,
  // use for mongoDB Session express-session and connect-mongo
  store : new MongoStore({
    url : config.url,
    collection : 'sessions'
  })
}));

// init passport
app.use(passport.initialize());
// login session
app.use(passport.session());
// flash message
app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/comments', comments.hasAuthorization, comments.list);
app.post('/comments', comments.hasAuthorization, comments.create);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function(){
  console.log(`Express server listening on port ${server.address().port}`);
})
