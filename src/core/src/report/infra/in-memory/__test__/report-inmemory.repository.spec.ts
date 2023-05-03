import { CoreError, InMemoryRepository } from '../../../../shared';
import {
  Report,
  ReportModel,
  ReportRepositoryInterface,
  RandomReportFactory,
} from '../../../domain';
import { ReportInMemoryRepository } from '../';

describe('Report In Memory Repository Tests', () => {
  let repository: InMemoryRepository<
    ReportModel,
    Report,
    ReportRepositoryInterface.ReportFields
  >;
  beforeEach(() => (repository = new ReportInMemoryRepository()));
  it('should inserts a new entity', async () => {
    const entity = RandomReportFactory.createOne();
    await repository.insert(entity);
    expect(entity.toJSON()).toStrictEqual(repository.items[0].toJSON());
  });

  it('should throws error when entity not found', async () => {
    await expect(repository.findById('fake id')).rejects.toThrow(
      new CoreError({
        message: 'item not found',
      }),
    );

    await expect(
      repository.findById('9366b7dc-2d71-4799-b91c-c64adb205104'),
    ).rejects.toThrow(
      new CoreError({
        message: 'item not found',
      }),
    );
  });

  it('should finds a entity by id', async () => {
    const entity = RandomReportFactory.createOne();
    await repository.insert(entity);

    let entityFound = await repository.findById(entity.id);
    expect(entity.toJSON()).toStrictEqual(entityFound.toJSON());

    entityFound = await repository.findById(entity.id);
    expect(entity.toJSON()).toStrictEqual(entityFound.toJSON());
  });

  it('should returns all entities', async () => {
    const entity = RandomReportFactory.createOne();
    await repository.insert(entity);

    const entities = await repository.findAll();

    expect(entities).toStrictEqual([entity]);
  });

  it('should throws error on update when entity not found', () => {
    const entity = RandomReportFactory.createOne();
    expect(repository.update(entity)).rejects.toThrow(
      new CoreError({
        message: 'item not found',
      }),
    );
  });

  it('should updates an entity', async () => {
    const entity = RandomReportFactory.createOne();
    await repository.insert(entity);

    const entityUpdated = RandomReportFactory.createOne({
      id: entity.id,
    });
    await repository.update(entityUpdated);
    expect(entityUpdated.toJSON()).toStrictEqual(repository.items[0].toJSON());
  });

  it('should throws error on delete when entity not found', () => {
    expect(repository.delete('fake id')).rejects.toThrow(
      new CoreError({
        message: 'item not found',
      }),
    );

    expect(
      repository.delete('9366b7dc-2d71-4799-b91c-c64adb205104'),
    ).rejects.toThrow(
      new CoreError({
        message: 'item not found',
      }),
    );
  });

  it('should deletes an entity', async () => {
    const entity = RandomReportFactory.createOne();
    await repository.insert(entity);

    await repository.delete(entity.id);
    expect(repository.items).toHaveLength(0);

    await repository.insert(entity);

    await repository.delete(entity.id);
    expect(repository.items).toHaveLength(0);
  });
});