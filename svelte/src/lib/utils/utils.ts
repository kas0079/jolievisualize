export const countEntries = (list: number[]) => {
	const result: number[] = [];
	list.forEach((i) => {
		if (isNaN(result[i])) result[i] = -1;
		result[i]++;
	});
	return result;
};
