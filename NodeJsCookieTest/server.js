const http = require('http');
const fs   = require('fs');
const url  = require('url');
const qs   = require('querystring');

// Cookie 생성
const parseCookies = (cookie = '') =>
    cookie
        .split(';')
        .map(v => v.split('='))
        .map(([k, ...vs]) => [k, vs.join('=')])
        .reduce((acc, [k, v]) => {
            acc[k.trim()] = decodeURIComponent(v);
            return acc;
        }, {});

http.createServer((req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    
    //url에 따른 로그인 처리
    if(req.url.startsWith('/login')){
        const { query } = url.parse(req.url);
        const { name }  = qs.parse(query);
        const expires = new Date();
        
        //쿠키 만료값 설정
        expires.setMinutes(expires.getMinutes() + 5);
        // 헤더에 쿠키값 세팅
        res.writeHead(302, {
            Location : '/',
            'Set-Cookie' : `name=${encodeURIComponent(name)}; Expires=${expires.toGMTString()}; HttpOnly; Path=/`,
        });
        res.end();
    } else if (cookies.name) {
        // 쿠키 로그인 완료
        res.writeHead(200, {'Content-Type' : 'text/html; charset=utf-8'});
        res.end(`${cookies.name}님 안녕하세요`);
    } else {
        // 페이지 출력
        fs.readFile('./Cookie.html', (err, data) => {
            if(err) {
                throw err;
            }
            res.end(data);
        });
    }
}).listen(8082, () => {
    console.log('8082번 포트에서 서버 대기중');
});