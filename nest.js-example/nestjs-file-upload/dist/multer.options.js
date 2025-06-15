"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerOption = void 0;
const crypto_1 = require("crypto");
const multer_1 = require("multer");
const path_1 = require("path");
exports.multerOption = {
    storage: (0, multer_1.diskStorage)({
        destination: (0, path_1.join)(__dirname, '..', 'uploads'),
        filename: (req, file, cb) => {
            cb(null, (0, crypto_1.randomUUID)() + (0, path_1.extname)(file.originalname));
        },
    }),
};
//# sourceMappingURL=multer.options.js.map