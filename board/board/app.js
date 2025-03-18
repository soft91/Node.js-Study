const express = require("express");
const handlebars = require("express-handlebars");
const app = express();

app.engine("handlebars", handlebars.engine()); // 템플릿 엔진으로 핸들바 등록
app.set("view engine", "handlebars"); // 웹페이지 로드 시 사용할 템플릿 엔진 설정
app.set("views", __dirname + "views"); // 뷰 디렉터리를 views로 설정

app.get("/", (req, res) => {
	res.render("home", { title: "안녕하세요", message: "환영합니다!" });
});

app.listen(3000, () => {
	// 서버 실행
	console.log("서버가 시작되었습니다.");
});
