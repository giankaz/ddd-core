import {
  CompanyRepositoryInterface,
  RandomCompanyFactory,
} from '../../../../domain';
import { FindByIdCompanyUseCase } from '../find-by-id-company.use-case';
import { CompanyInMemoryRepository } from '../../../../infra';

describe('Find By Id Company UseCase Test', () => {
  let useCase: FindByIdCompanyUseCase.UseCase;
  let repository: CompanyRepositoryInterface.Repository;

  beforeEach(() => {
    repository = new CompanyInMemoryRepository();
    useCase = new FindByIdCompanyUseCase.UseCase(repository);
  });
  it('should execute the findById use-case', async () => {
    const spyFindById = jest.spyOn(repository, 'findById');

    const company = RandomCompanyFactory.createOne();

    await repository.insert(company);

    const foundCompany = await useCase.execute({
      id: company.id,
    });

    expect(spyFindById).toHaveBeenCalledTimes(1);
    expect(foundCompany).toStrictEqual(company.toJSON());
  });
});