var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
// user 스키마 정의
var userSchema = mongoose.Schema({
    local : {
        name: String,
        email: String,
        password : String
    }
});

//패스워드 암호화
userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// 패스워드가 유효한지 확인
userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.local.password);
};

// user 모델을 생성하고 앱에 공개(expose)
module.exports = mongoose.model('User', userSchema);