const { MongoClient } = require("mongodb");

const uri =
	"mongodb+srv://soft4750:1jC0ERUDws11TIIe@cluster0.s5r0m.mongodb.net/board";

module.exports = function (callback) {
	return MongoClient.connect(uri, callback);
};
