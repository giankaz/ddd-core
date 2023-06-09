import {
  FilterParams,
  FilterOperators,
  ParseSearchParams,
  SearchParams,
} from '../../../../domain';
import { MongooseParseSearchParams } from '../mongoose-parse-search-params';

type Fields = 'name' | 'created_at';

describe('Test mongoose Parse search params', () => {
  it('should be successful if the operator is CONTAINS', () => {
    const filter = [
      {
        type: 'string',
        column: 'name',
        operator: FilterOperators.CONTAINS,
        value: 'test',
      } as FilterParams<Fields>,
    ];
    const parseParams = {
      params: new SearchParams({
        page: 1,
        per_page: 2,
        sort: 'created_at',
        sort_dir: 'asc',
        filter: filter,
        search: 'test',
      }),
      defaultSearch: [],
      defaultSearchOrExpressions: [],
      filterableFields: [],
      searchableFields: [],
      sortableFields: [],
    } as ParseSearchParams<Fields>;

    const parseFilter = new MongooseParseSearchParams();
    expect(parseFilter.parse(parseParams)).toBeDefined();
  });

  it('should be successful if the type is Boolean', () => {
    const filter = [
      {
        type: 'boolean',
        column: 'name',
        operator: FilterOperators.CONTAINS,
        value: 'test',
      } as FilterParams<Fields>,
    ];
    const parseParams = {
      params: new SearchParams({
        page: 1,
        per_page: 2,
        sort: 'created_at',
        sort_dir: 'asc',
        filter: filter,
      }),
      defaultSearch: [],
      defaultSearchOrExpressions: [],
      filterableFields: [],
      searchableFields: [],
      sortableFields: [],
    } as ParseSearchParams<Fields>;

    const parseFilter = new MongooseParseSearchParams();
    expect(parseFilter.parse(parseParams)).toBeDefined();
  });

  it('should be successful if the type is Date', () => {
    const filter = [
      {
        type: 'string',
        column: 'name',
        operator: FilterOperators.CONTAINS,
        value: 'test',
      } as FilterParams<Fields>,
    ];
    const parseParams = {
      params: new SearchParams({
        page: 1,
        per_page: 2,
        sort: 'created_at',
        filter: filter,
        search: 'test',
      }),
      defaultSearch: [],
      defaultSearchOrExpressions: [{ name: 'teste' }, { test: 'teste' }],
      filterableFields: ['name'],
      searchableFields: [],
      sortableFields: ['created_at'],
    } as ParseSearchParams<Fields>;

    const parseFilter = new MongooseParseSearchParams();
    expect(parseFilter.parse(parseParams)).toBeDefined();
  });
});
