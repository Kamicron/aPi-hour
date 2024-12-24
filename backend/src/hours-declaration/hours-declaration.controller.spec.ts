import { Test, TestingModule } from '@nestjs/testing';
import { HoursDeclarationController } from './hours-declaration.controller';
import { HoursDeclarationService } from './hours-declaration.service';

describe('HoursDeclarationController', () => {
  let controller: HoursDeclarationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HoursDeclarationController],
      providers: [HoursDeclarationService],
    }).compile();

    controller = module.get<HoursDeclarationController>(HoursDeclarationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
