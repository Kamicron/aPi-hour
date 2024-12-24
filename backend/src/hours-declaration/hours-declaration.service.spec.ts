import { Test, TestingModule } from '@nestjs/testing';
import { HoursDeclarationService } from './hours-declaration.service';

describe('HoursDeclarationService', () => {
  let service: HoursDeclarationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HoursDeclarationService],
    }).compile();

    service = module.get<HoursDeclarationService>(HoursDeclarationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
