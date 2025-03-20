const express = require("express");
const handlebars = require("express-handlebars");
const app = express();

// 몽고DB 연결함수
const mongodbConnection = require("./configs/mongodb-connection");

app.engine(
	"handlebars",
	handlebars.create({
		helpers: require("./configs/handlebars-helpers"),
	}).engine
); // 템플릿 엔진으로 핸들바 등록
app.set("view engine", "handlebars"); // 웹페이지 로드 시 사용할 템플릿 엔진 설정
app.set("views", "views"); // 뷰 디렉터리를 views로 설정

app.get("/", (req, res) => {
	res.render("home", { title: "안녕하세요", message: "환영합니다!" });
});

app.get("/write", (req, res) => {
	res.render("write", { title: "테스트 게시판" });
});

app.get("/detail/:id", (req, res) => {
	res.render("detail", { title: "테스트 게시판" });
});

let collection;

app.listen(3000, async () => {
	// 서버 실행
	console.log("서버가 시작되었습니다.");
	const mongoClient = await mongodbConnection();
	collection = mongoClient.db().collection("posts");
	console.log("MongoDB Connected!");
});
