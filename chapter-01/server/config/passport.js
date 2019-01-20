var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/users');

module.exports = function(passport) {
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });
    // local strategy 사용
    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function (req, email, password, done){
        if(email)
            email = email.toLowerCase();
        process.nextTick(function(){
            // 에러 체크 후 메세지 가져오기
            User.findOne({ 'local.email ' : email}, function(err, user){
                if(err)
                    return done(err);
                if(!user)
                    return done(null, false, req.flash('loginMessage', 'No user found'));
                if(!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Wrong password'));
                else
                    return done(null, user);
            });
        });
    }));

    // local strategy 등록
    passport.use('local-signup', new LocalStrategy({
        // 사용자명과 패스워드의 기본값을 'email'과 'password'로 변경
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
        if(email)
            email = email.toLowerCase();
        process.nextTick(function(){
            // user가 아직 로그인 하지 않았다면
            if(!req.user){
                User.findOne({'local.email' : email}, function(err, user){
                    //에러 발생시
                    if(err)
                        return done(err);
                    if(user){
                        return done(null, false, req.flash('signupMessage', 'email is already taken'));
                    }else{
                        var newUser = new User();
                        newUser.local.name = req.body.name;
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        //데이터 저장
                        newUser.save(function(err){
                            if(err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            }else{
                return done(null, req.user);
            }
        });
    }));
};