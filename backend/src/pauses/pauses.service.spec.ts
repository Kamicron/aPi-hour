import { Test, TestingModule } from '@nestjs/testing';
import { PausesService } from './pauses.service';

describe('PausesService', () => {
  let service: PausesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PausesService],
    }).compile();

    service = module.get<PausesService>(PausesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
