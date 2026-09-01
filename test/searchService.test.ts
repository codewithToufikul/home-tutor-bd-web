import test from 'node:test';
import assert from 'node:assert/strict';
import { SearchService } from '@/src/services/searchService';

test('SearchService.paginate correctly splits array into pages', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const page1 = SearchService.paginate(items, 1, 3);
  assert.equal(page1.items.length, 3);
  assert.deepEqual(page1.items, [1, 2, 3]);
  assert.equal(page1.totalPages, 4);
  assert.equal(page1.totalItems, 10);

  const page4 = SearchService.paginate(items, 4, 3);
  assert.equal(page4.items.length, 1);
  assert.deepEqual(page4.items, [10]);
});

test('SearchService.highlightText returns tokenized array', () => {
  const result = SearchService.highlightText('Dhaka Tutor', 'Dhaka');
  assert.equal(result.length, 1);
  assert.equal(result[0].text, 'Dhaka Tutor');
});
