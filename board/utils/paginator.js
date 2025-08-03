const lodash = require("lodash");

const PAGE_LIST_SIZE = 10;

module.exports = ({ totalCount, page, perPage = 10 }) => {
	const PER_PAEGE = perPage;
	const totalPage = Math.ceil(totalCount / PER_PAEGE); // 총 페이지 수 계산

	let quotient = parseInt(page / PAGE_LIST_SIZE);
	if (page % PAGE_LIST_SIZE === 0) {
		quotient -= 1;
	}
	const startPage = quotient * PAGE_LIST_SIZE + 1; // 시작페이지 구하기

	const endPage =
		startPage + PAGE_LIST_SIZE - 1 < totalPage
			? startPage + PAGE_LIST_SIZE - 1
			: totalPage; // 종료페이지 구하기

	const isFirstPage = startPage === 1; // 필드페이지인지 확인
	const isLastPage = endPage === totalPage; // 노드페이지인지 확인

	const hasPrev = page > 1;
	const hasNext = page < totalPage;

	const paginator = {
		pageList: lodash.range(startPage, endPage + 1),
		page,
		prevPage: page - 1,
		nextPage: page + 1,
		startPage,
		lastPage: totalPage,
		hasPrev,
		hasNext,
		isFirstPage,
		isLastPage,
	};

	return paginator;
};
