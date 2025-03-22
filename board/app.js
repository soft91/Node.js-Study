const express = require("express");
const handlebars = require("express-handlebars");
const app = express();

// 몽고DB 연결함수
const mongodbConnection = require("./configs/mongodb-connection");

const postService = require("./services/post-service");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine(
	"handlebars",
	handlebars.create({
		helpers: require("./configs/handlebars-helpers"),
	}).engine
); // 템플릿 엔진으로 핸들바 등록

app.set("view engine", "handlebars"); // 웹페이지 로드 시 사용할 템플릿 엔진 설정
app.set("views", "views"); // 뷰 디렉터리를 views로 설정

app.get("/", async (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const search = req.query.search || "";
	try {
		const [post, paginator] = await postService.list(
			collection,
			page,
			search
		);

		res.render("home", { title: "테스트 게시판", search, paginator, post });
	} catch (err) {
		console.error(err);
		res.render("home", { title: "테스트 게시판" });
	}
});

app.get("/write", (req, res) => {
	res.render("write", { title: "테스트 게시판" });
});

app.post("/write", async (req, res) => {
	const post = req.body;
	const result = await postService.writePost(collection, post);
	res.redirect(`/detail/${result.insertedId}`);
});

app.get("/detail/:id", async (req, res) => {
	const result = await postService.getDetailPost(collection, req.params.id);
	res.render("detail", { title: "테스트 게시판", post: result.value });
});

let collection;

app.listen(3000, async () => {
	// 서버 실행
	console.log("서버가 시작되었습니다.");
	const mongoClient = await mongodbConnection();
	collection = mongoClient.db().collection("posts");
	console.log("MongoDB Connected!");
});
