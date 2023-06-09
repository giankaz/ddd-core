import { XxxxeclixxxxMongoRepository } from '..';
import {
  CommonStatus,
  FilterOperators,
  FilterParams,
  RepositoryInterface,
  SearchParams,
} from '../../../../shared';
import {
  Xxxxeclixxxx,
  XxxxeclixxxxValidator,
  XxxxeclixxxxRepositoryInterface,
  RandomXxxxeclixxxxFactory,
} from '../../../domain';

describe('mongoose repository tests', () => {
  let repository: RepositoryInterface<
    XxxxeclixxxxValidator,
    Xxxxeclixxxx,
    XxxxeclixxxxRepositoryInterface.XxxxeclixxxxFields
  >;
  let randomEntity: Xxxxeclixxxx;

  beforeEach(() => {
    repository = new XxxxeclixxxxMongoRepository();
    randomEntity = RandomXxxxeclixxxxFactory.createOne();
  });

  it('should create with the insert method and find with findById', async () => {
    await repository.insert(randomEntity);

    const result = await repository.findById(randomEntity.id);

    expect(result.toJSON()).toStrictEqual(randomEntity.toJSON());
  });

  it('should find by field', async () => {
    await repository.insert(randomEntity);

    const result = await repository.findByField('id', randomEntity.id);

    expect(result.toJSON()).toStrictEqual(randomEntity.toJSON());
  });

  it('should deactivate, activate and softDelete', async () => {
    await repository.insert(randomEntity);

    let result = await repository.findById(randomEntity.id);

    await repository.deactivate(randomEntity.id);

    result = await repository.findById(randomEntity.id);

    expect(result.status).toStrictEqual(CommonStatus.INACTIVE);

    await repository.activate(randomEntity.id);

    result = await repository.findById(randomEntity.id);

    expect(result.status).toStrictEqual(CommonStatus.ACTIVE);

    await repository.softDelete(randomEntity.id);

    result = await repository.findById(randomEntity.id);

    expect(result.status).toStrictEqual(CommonStatus.DELETED);
  });

  it('should run the method search using filters', async () => {
    const entities = RandomXxxxeclixxxxFactory.createMultiple(10);

    const entityToWorkWith1 = entities[0];
    const entityToWorkWith2 = entities[1];

    await repository.insertMany(entities);

    const filter: FilterParams<XxxxeclixxxxRepositoryInterface.XxxxeclixxxxFields>[] =
      [
        {
          column: 'id',
          operator: FilterOperators.CONTAINS,
          type: 'string',
          value: entityToWorkWith1.id,
        },
      ];

    const params = new SearchParams({
      page: 1,
      per_page: 2,
      sort: 'created_at',
      sort_dir: 'asc',
      filter: filter,
    });

    const result = await repository.search(params);

    expect(entityToWorkWith1.toJSON()).toStrictEqual(result.items[0].toJSON());

    const filter2: FilterParams<XxxxeclixxxxRepositoryInterface.XxxxeclixxxxFields>[] =
      [
        {
          column: 'id',
          operator: FilterOperators.CONTAINS,
          type: 'string',
          value: entityToWorkWith2.id,
        },
      ];

    const params2 = new SearchParams({
      page: 1,
      per_page: 2,
      sort: 'created_at',
      sort_dir: 'asc',
      filter: filter2,
    });

    const result2 = await repository.search(params2);

    expect(entityToWorkWith2.toJSON()).toStrictEqual(result2.items[0].toJSON());

    const filter3: FilterParams<XxxxeclixxxxRepositoryInterface.XxxxeclixxxxFields>[] =
      [
        {
          column: 'id',
          operator: FilterOperators.EQUAL,
          type: 'string',
          value: entityToWorkWith1.id,
        },
        {
          column: 'id',
          operator: FilterOperators.EQUAL,
          type: 'string',
          value: entityToWorkWith2.id,
        },
      ];

    const params3 = new SearchParams({
      page: 1,
      per_page: 2,
      sort: 'created_at',
      sort_dir: 'asc',
      filter: filter3,
    });

    const result3 = await repository.search(params3);

    expect(result3.items.length).toStrictEqual(2);

    result3.items.forEach((item) => {
      expect(
        [entityToWorkWith1.id, entityToWorkWith2.id].includes(item.id),
      ).toStrictEqual(true);
    });
  });

  it(`should run the method search with multiple
  filters with same columns for more then one item, and multiple
  search for different columns`, async () => {
    const entities = RandomXxxxeclixxxxFactory.createMultiple(10);

    await repository.insertMany(entities);

    const entityToWorkWith1 = entities[0];
    const entityToWorkWith2 = entities[1];

    const filter: FilterParams<XxxxeclixxxxRepositoryInterface.XxxxeclixxxxFields>[] =
      [
        {
          column: 'id',
          operator: FilterOperators.EQUAL,
          type: 'string',
          value: entityToWorkWith1.id,
        },
        {
          column: 'id',
          operator: FilterOperators.EQUAL,
          type: 'string',
          value: entityToWorkWith2.id,
        },
      ];

    const params = new SearchParams({
      page: 1,
      per_page: 2,
      sort: 'created_at',
      sort_dir: 'asc',
      filter: filter,
    });

    const result = await repository.search(params);

    expect(result.items.length).toStrictEqual(2);

    result.items.forEach((item) => {
      expect(
        [entityToWorkWith1.id, entityToWorkWith2.id].includes(item.id),
      ).toStrictEqual(true);
    });
  });
  it('should run the method search using default search', async () => {
    const entities = RandomXxxxeclixxxxFactory.createMultiple(10);

    await repository.insertMany(entities);

    const entityToWorkWith1 = entities[0];

    const params =
      new SearchParams<XxxxeclixxxxRepositoryInterface.XxxxeclixxxxFields>({
        page: 1,
        per_page: 2,
        sort: 'created_at',
        sort_dir: 'asc',
        defaultSearch: { _id: entityToWorkWith1.id },
      });

    const result = await repository.search(params);

    expect(result.items[0].toJSON()).toStrictEqual(entityToWorkWith1.toJSON());
  });
  it('should run the method update', async () => {
    await repository.insert(randomEntity);

    const entity = await repository.findById(randomEntity.id);

    await repository.update(entity);

    const foundAfterUpdate = await repository.findById(entity.id);

    expect(foundAfterUpdate.toJSON()).toStrictEqual(entity.toJSON());
  });

  it('should delete', async () => {
    await repository.insert(randomEntity);

    await repository.delete(randomEntity.id);

    const result = await repository.findById(randomEntity.id);

    expect(result).toBeUndefined();
  });
});
