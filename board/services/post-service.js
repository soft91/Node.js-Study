const paginator = require("../utils/paginator");
const { ObjectId } = require("mongodb");

const projectionOption = {
	projection: {
		password: 0,
		"comments.password": 0,
	},
};

async function writePost(collection, post) {
	post.hits = 0;
	post.createdDt = new Date().toISOString();
	return await collection.insertOne(post); // 몽고디비에 post를 저장 후 결과 반환
}

async function list(collection, page, search) {
	const perPage = 10;
	const query = { title: new RegExp(search, "i") };

	const cursor = collection
		.find(query, { limit: perPage, skip: (page - 1) * perPage })
		.sort({ createdDt: -1 });

	// 검색어에 걸리는 게시물의 총합
	const totalCount = await collection.count(query);
	const posts = await cursor.toArray();

	// 페이지네이션 생성
	const paginatorObj = paginator({ totalCount, page, perPage: perPage });
	return [posts, paginatorObj];
}

async function getDetailPost(collection, id) {
	return await collection.findOneAndUpdate(
		{ _id: ObjectId(id) },
		{ $inc: { hits: 1 } },
		projectionOption
	);
}

module.exports = { writePost, list, getDetailPost };
