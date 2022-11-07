import Dvv from "../src/lib/Dvv";
import Clock from "../src/lib/Clock";

const dvv = new Dvv();

test('creating instance of Dvv', (): void => {
	expect(new Dvv()).toBeInstanceOf(Dvv);
});

describe('test_join', (): void => {
	const A = dvv.new_dvv('v1');
	const A1 = dvv.create(A, 'a');

	const B = dvv.new_with_history(dvv.join(A1), 'v2');
	const B1 = dvv.update(B, A1, 'b');

	test('A', (): void => {
		const result = dvv.join(A);
		expect(result).toEqual([]);
	});

	test('A1', (): void => {
		const result = dvv.join(A1);
		expect(result).toEqual([["a", 1]])
	});

	test('B1', (): void => {
		const result = dvv.join(B1);
		expect(result).toEqual([["a", 1], ["b", 1]]);
	});
});

describe('test_update', (): void => {
	const A0 = dvv.create(dvv.new_dvv('v1'), 'a');
	const A1 = dvv.update(dvv.new_list_with_history(dvv.join(A0), ['v2']), A0, 'a');
	const A2 = dvv.update(dvv.new_list_with_history(dvv.join(A1), ['v3']), A1, 'b');
	const A3 = dvv.update(dvv.new_list_with_history(dvv.join(A0), ['v4']), A1, 'b');
	const A4 = dvv.update(dvv.new_list_with_history(dvv.join(A0), ['v5']), A1, 'a');

	test('A0', (): void => expect(A0.getList).toEqual([[['a', 1, ['v1']]], []]));
	test('A1', (): void => expect(A1.getList).toEqual([[['a', 2, ['v2']]], []]));
	test('A2', (): void => expect(A2.getList).toEqual([[['a', 2, []], ['b', 1, ['v3']]], []]));
	test('A3', (): void => expect(A3.getList).toEqual([[['a', 2, ['v2']], ['b', 1, ['v4']]], []]));
	test('A4', (): void => expect(A4.getList).toEqual([[['a', 3, ['v5', 'v2']]], []]));
});

describe('test_sync', (): void => {
	const X = new Clock([['x' , 1, []]], []);
	const A = dvv.create(dvv.new_dvv('v1'), 'a');
	const Y = dvv.create(dvv.new_list(['v2']), 'b');
	const A1 = dvv.create(dvv.new_list_with_history(dvv.join(A), ['v2']), 'a');
	const A3 = dvv.create(dvv.new_list_with_history(dvv.join(A1), ['v3']), 'b');
	const A4 = dvv.create(dvv.new_list_with_history(dvv.join(A1), ['v3']), 'c');

	const W = new Clock([['a', 1, []]], []);
	const Z = new Clock([['a', 2, ['v2', 'v1']]], []);

	test('W Z', (): void => {
		const result = dvv.sync([W, Z]).getList;
		expect(result).toEqual([[['a', 2, ['v2']]], []]);
	});

	test('Z W', (): void => {
		const result = dvv.sync([Z, W]).getList;
		expect(result).toEqual([[['a', 2, ['v2']]], []]);
	});

	test('W Z && Z W', (): void => {
		const result = dvv.sync([W, Z]).getList;
		const result2 = dvv.sync([Z, W]).getList;
		expect(result).toEqual(result2);
	});

	test('A A1', (): void => {
		const result = dvv.sync([A, A1]).getList;
		expect(result).toEqual([[['a', 2, ['v2']]], []]);
	});

	test('A1 A', (): void => {
		const result = dvv.sync([A1, A]).getList;
		expect(result).toEqual([[['a', 2, ['v2']]], []]);
	});

	test('A A1 && A1 A', (): void => {
		const result = dvv.sync([A, A1]).getList;
		const result2 = dvv.sync([A1, A]).getList;
		expect(result).toEqual(result2);
	});

	test('A3 A4', (): void => {
		const result = dvv.sync([A3, A4]).getList;
		expect(result).toEqual([[['a', 2, []], ['b', 1, ['v3']], ['c', 1, ['v3' ] ] ], []]);
	});

	test('A4 A3', (): void => {
		const result = dvv.sync([A4, A3]).getList;
		expect(result).toEqual([[['a', 2, []], ['b', 1, ['v3']], ['c', 1, ['v3' ] ] ], []]);
	});

	test('A3 A4 && A4 A3', (): void => {
		const result = dvv.sync([A3, A4]).getList;
		const result2 = dvv.sync([A4, A3]).getList;
		expect(result).toEqual(result2);
	});

	test('A X', (): void => {
		const result = dvv.sync([A, X]).getList;
		expect(result).toEqual([[['a', 1, ['v1']], ['x', 1, []]], []]);
	});

	test('X A', (): void => {
		const result = dvv.sync([X, A]).getList;
		expect(result).toEqual([[['a', 1, ['v1']], ['x', 1, []]], []]);
	});

	test('A X && X A', (): void => {
		const result = dvv.sync([A, X]).getList;
		const result2 = dvv.sync([X, A]).getList;
		expect(result).toEqual(result2);
	});

	test('A Y', (): void => {
		const result = dvv.sync([A, Y]).getList;
		expect(result).toEqual([[['a', 1, ['v1']], ['b', 1, ['v2']]], []]);
	});

	test('Y A', (): void => {
		const result = dvv.sync([Y, A]).getList;
		expect(result).toEqual([[['a', 1, ['v1']], ['b', 1, ['v2']]], []]);
	});

	test('A Y && Y A', (): void => {
		const result = dvv.sync([A, Y]).getList;
		const result2 = dvv.sync([Y, A]).getList;
		expect(result).toEqual(result2);
	});
});

describe('test_sync_update', (): void => {
	// Mary writes v1 w/o VV
	const A0 = dvv.create(dvv.new_list(['v1']), 'a');
	// Peter reads v1 with version vector (VV)
	const VV1 = dvv.join(A0);
	// Mary writes v2 w/o VV
	const A1 = dvv.update(dvv.new_list(['v2']), A0, 'a');
	// Peter writes v3 with VV from v1
	const A2 = dvv.update(dvv.new_list_with_history(VV1, ['v3']), A1, 'a');

	test('VV1', (): void => expect(VV1).toEqual([['a', 1]]));
	test('A0', (): void => expect(A0.getList).toEqual([[['a', 1, ['v1']]], []]));
	test('A1', (): void => expect(A1.getList).toEqual([[['a', 2, ['v2', 'v1']]], []]));
	// now A2 should only have v2 and v3, since v3 was causally newer than v1
	test('A2', (): void => expect(A2.getList).toEqual([[['a', 3, ['v3', 'v2']]], []]));
});

describe('test_event', (): void => {
	const A = dvv.create(dvv.new_dvv('v1'), 'a');
	const entries = A.getEntries;

	test('1', (): void => {
		const result = dvv.event(entries, 'a', 'v2');
		expect(result).toEqual([['a', 2, ['v2', 'v1']]]);
	});

	test('2', (): void => {
		const result = dvv.event(entries, 'b', 'v2');
		expect(result).toEqual([['a', 1, ['v1']], ['b', 1, ['v2']]]);
	});
});

describe('test_less', (): void => {
	const A  = dvv.create(dvv.new_list('v1'), 'a'); // ['a']
	const B  = dvv.create(dvv.new_list_with_history(dvv.join(A), ['v2']), 'a');
	const B2 = dvv.create(dvv.new_list_with_history(dvv.join(A), ['v2']), 'b');
	const B3 = dvv.create(dvv.new_list_with_history(dvv.join(A), ['v2']), 'z');

	const C = dvv.update(dvv.new_list_with_history(dvv.join(B), ['v3']), A, 'c');
	const D = dvv.update(dvv.new_list_with_history(dvv.join(C), ['v4']), B2, 'd');

	test('A < B', (): void => expect(dvv.less(A, B)).toBeTruthy());
	test('A < C', (): void => expect(dvv.less(A, C)).toBeTruthy());
	test('B < C', (): void => expect(dvv.less(B, C)).toBeTruthy());
	test('B < D', (): void => expect(dvv.less(B, D)).toBeTruthy());
	test('B2 < D', (): void => expect(dvv.less(B2, D)).toBeTruthy());
	test('A < D', (): void => expect(dvv.less(A, D)).toBeTruthy());

	test('B2 < C', (): void => expect(dvv.less(B2, C)).toBeFalsy());
	test('B < B2', (): void => expect(dvv.less(B, B2)).toBeFalsy());
	test('B2 < B', (): void => expect(dvv.less(B2, B)).toBeFalsy());
	test('A < A', (): void => expect(dvv.less(A, A)).toBeFalsy());
	test('C < C', (): void => expect(dvv.less(C, C)).toBeFalsy());
	test('D < B2', (): void => expect(dvv.less(D, B2)).toBeFalsy());
	test('B3 < D', (): void => expect(dvv.less(B3, D)).toBeFalsy());
});

describe('test_equal', (): void => {
	const A = new Clock([['a', 4, ['v5', 'v0']], ['b',0,[]], ['c', 1, ['v3']]], ['v0']);
	const B = new Clock([['a', 4, ['v555', 'v0']], ['b',0,[]], ['c', 1, ['v3']]], []);
	const C = new Clock([['a', 4, ['v5', 'v0']], ['b',0,[]]], ['v6', 'v1']);
	//  compare only the causal history
	test('A === B', (): void => expect(dvv.equal(A, B)).toBeTruthy());
	test('B === A', (): void => expect(dvv.equal(B, A)).toBeTruthy());
	test('A === C', (): void => expect(dvv.equal(A, C)).toBeFalsy());
	test('B === C', (): void => expect(dvv.equal(B, C)).toBeFalsy());
});

describe('test_size', (): void => {
	const clock = new Clock([['a', 4, ['v5', 'v0']], ['b', 0, []], ['c', 1, ['v3']]], ['v4', 'v1']);

	test('1', (): void => expect(dvv.size(dvv.new_list(["v1"]))).toBe(1));
	test('2', (): void => expect(dvv.size(clock)).toBe(5));
});

describe('test_values', (): void => {
	const A = new Clock([['a', 4, ['v0', 'v5']], ['b', 0, []], ['c', 1, ['v3']]], ['v1']);
	const B = new Clock([['a', 4, ['v0', 'v555']], ['b', 0, []], ['c', 1, ['v3']]], []);
	const C = new Clock([['a', 4, []], ['b', 0, []]], ['v1', 'v6']);

	test('A', (): void => expect(dvv.values(A).sort()).toEqual(['v0', 'v1', 'v3', 'v5']));
	test('B', (): void => expect(dvv.values(B).sort()).toEqual(['v0', 'v3', 'v555']));
	test('C', (): void => expect(dvv.values(C)).toEqual(['v1', 'v6']));
});

describe('test_ids', (): void => {
	const A = new Clock([['a', 4, ['v0', 'v5']], ['b', 0, []], ['c', 1, ['v3']]], ['v1']);
	const B = new Clock([['a', 4, ['v0', 'v555']], ['b', 0, []], ['c', 1, ['v3']]], []);
	const C = new Clock([['a', 4, []], ['b', 0, []]], ['v1', 'v6']);

	test('A', (): void => expect(dvv.ids(A)).toEqual(['a', 'b', 'c']));
	test('B', (): void => expect(dvv.ids(B)).toEqual(['a', 'b', 'c']));
	test('C', (): void => expect(dvv.ids(C)).toEqual(['a', 'b']));
});