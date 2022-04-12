import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TaskStatus } from './task-status.enum';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

const mockTasksRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
  updateTaskStatus: jest.fn(),
  save: jest.fn(),
});

const mockUser = {
  username: 'user',
  id: '1',
  password: 'test',
  tasks: [],
};

const mockTasks = {
  title: 'Test task',
  description: 'Test description',
  id: '1',
  status: TaskStatus.OPEN,
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useFactory: mockTasksRepository },
      ],
    }).compile();

    tasksService = module.get(TasksService);
    tasksRepository = module.get(TasksRepository);
  });

  describe('getTasks', () => {
    it('calls TasksRepository.getTasks and returns the result', async () => {
      tasksRepository.getTasks.mockResolvedValue('someValue');

      const result = await tasksService.getTasks(null, mockUser);

      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls TasksRepository.findOne and returns the result', async () => {
      tasksRepository.findOne.mockResolvedValue(mockTasks);

      const result = await tasksService.getTaskById('1', mockUser);

      expect(result).toEqual(mockTasks);
    });

    it('calls TasksRepository.findOne and handles an error', () => {
      tasksRepository.findOne.mockResolvedValue(null);

      expect(tasksService.getTaskById('1', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('calls TasksRepository.createTask and returns the result', async () => {
      tasksRepository.createTask.mockResolvedValue(mockTasks);

      const result = await tasksService.createTask(mockTasks, mockUser);

      expect(result).toEqual(mockTasks);
    });
  });

  describe('deleteTask', () => {
    it('calls TasksRepository.deleteTask and returns the result', async () => {
      tasksRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await tasksService.deleteTask('1', mockUser);

      expect(result).toEqual(undefined);
    });

    it('calls TasksRepository.deleteTask and handles an error', () => {
      tasksRepository.delete.mockResolvedValue({ affected: 0 });

      expect(tasksService.deleteTask('1', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('calls TasksRepository.updateTaskStatus and returns the result', async () => {
      tasksRepository.updateTaskStatus.mockResolvedValue(mockTasks);
      tasksRepository.findOne.mockResolvedValue(mockTasks);

      const result = await tasksService.updateTaskStatus(
        '1',
        TaskStatus.DONE,
        mockUser,
      );

      expect(result).toEqual({ ...mockTasks, status: TaskStatus.DONE });
    });

    it('calls TasksRepository.updateTaskStatus and handles an error', () => {
      tasksRepository.findOne.mockResolvedValue(null);

      expect(
        tasksService.updateTaskStatus('1', TaskStatus.IN_PROGRESS, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
