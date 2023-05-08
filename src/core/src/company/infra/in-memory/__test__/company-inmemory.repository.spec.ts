import { InMemoryRepository } from '../../../../shared';
import {
  Company,
  CompanyValidator,
  CompanyRepositoryInterface,
  RandomCompanyFactory,
} from '../../../domain';
import { CompanyInMemoryRepository } from '../';

describe('Company In Memory Repository Tests', () => {
  let repository: InMemoryRepository<
    CompanyValidator,
    Company,
    CompanyRepositoryInterface.CompanyFields
  >;
  beforeEach(() => (repository = new CompanyInMemoryRepository()));
  it('should inserts a new entity', async () => {
    const entity = RandomCompanyFactory.createOne();
    await repository.insert(entity);
    expect(entity.toJSON()).toStrictEqual(repository.items[0].toJSON());
  });

  it('should returns undefined entity not found', async () => {
    const result = await repository.findById('fake id');
    expect(result).toBeUndefined();
  });

  it('should finds a entity by id', async () => {
    const entity = RandomCompanyFactory.createOne();
    await repository.insert(entity);

    let entityFound = await repository.findById(entity.id);
    expect(entity.toJSON()).toStrictEqual(entityFound.toJSON());

    entityFound = await repository.findById(entity.id);
    expect(entity.toJSON()).toStrictEqual(entityFound.toJSON());
  });

  it('should returns all entities', async () => {
    const entity = RandomCompanyFactory.createOne();
    await repository.insert(entity);

    const entities = await repository.findAll();

    expect(entities).toStrictEqual([entity]);
  });

  it('should return undefined on update when entity not found', async () => {
    const entity = RandomCompanyFactory.createOne();

    const result = await repository.update(entity);
    expect(result).toBeUndefined();
  });

  it('should updates an entity', async () => {
    const entity = RandomCompanyFactory.createOne();
    await repository.insert(entity);

    const entityUpdated = RandomCompanyFactory.createOne({
      id: entity.id,
    });
    await repository.update(entityUpdated);
    expect(entityUpdated.toJSON()).toStrictEqual(repository.items[0].toJSON());
  });

  it('should return undefined entity not found', async () => {
    const result = await repository.delete('fake id');
    expect(result).toBeUndefined();
  });

  it('should deletes an entity', async () => {
    const entity = RandomCompanyFactory.createOne();
    await repository.insert(entity);

    await repository.delete(entity.id);
    expect(repository.items).toHaveLength(0);

    await repository.insert(entity);

    await repository.delete(entity.id);
    expect(repository.items).toHaveLength(0);
  });
});
