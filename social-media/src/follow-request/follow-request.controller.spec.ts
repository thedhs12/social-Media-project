import { Test, TestingModule } from '@nestjs/testing';
import { FollowRequestController } from './follow-request.controller';

describe('FollowRequestController', () => {
  let controller: FollowRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowRequestController],
    }).compile();

    controller = module.get<FollowRequestController>(FollowRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
