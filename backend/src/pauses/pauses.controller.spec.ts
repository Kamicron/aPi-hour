import { Test, TestingModule } from '@nestjs/testing';
import { PausesController } from './pauses.controller';
import { PausesService } from './pauses.service';

describe('PausesController', () => {
  let controller: PausesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PausesController],
      providers: [PausesService],
    }).compile();

    controller = module.get<PausesController>(PausesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
