import { redis } from '../client';
import { keys } from '../keys';
import type { TrainingModule, TrainingProgress } from '@/types';
import { toRedisHash } from './helpers';

export async function getTrainingModule(id: string): Promise<TrainingModule | null> {
  const module = await redis.hgetall(keys.trainingModule(id)) as TrainingModule | null;
  if (!module || !module.id) return null;
  // Parse JSON fields
  if (typeof module.title === 'string') module.title = JSON.parse(module.title);
  if (typeof module.description === 'string') module.description = JSON.parse(module.description);
  if (typeof module.content === 'string') module.content = JSON.parse(module.content);
  if (typeof module.quiz === 'string') module.quiz = JSON.parse(module.quiz);
  return module;
}

export async function getAllTrainingModules(): Promise<TrainingModule[]> {
  const moduleIds = await redis.smembers<string[]>(keys.trainingModules());
  if (!moduleIds.length) return [];
  const modules = await Promise.all(moduleIds.map((id) => getTrainingModule(id)));
  return modules.filter((m): m is TrainingModule => m !== null).sort((a, b) => a.order - b.order);
}

export async function createTrainingModule(module: TrainingModule): Promise<void> {
  const moduleData = {
    ...module,
    title: JSON.stringify(module.title),
    description: JSON.stringify(module.description),
    content: JSON.stringify(module.content),
    quiz: JSON.stringify(module.quiz),
  };

  const pipeline = redis.pipeline();
  pipeline.hset(keys.trainingModule(module.id), toRedisHash(moduleData));
  pipeline.sadd(keys.trainingModules(), module.id);
  await pipeline.exec();
}

export async function getUserTrainingProgress(userId: string): Promise<Record<string, TrainingProgress>> {
  const progress = await redis.hgetall(keys.userTrainingProgress(userId)) as Record<string, string> | null;
  if (!progress) return {};

  const parsed: Record<string, TrainingProgress> = {};
  for (const [moduleId, data] of Object.entries(progress)) {
    parsed[moduleId] = typeof data === 'string' ? JSON.parse(data) : data;
  }
  return parsed;
}

export async function updateTrainingProgress(userId: string, progress: TrainingProgress): Promise<void> {
  await redis.hset(keys.userTrainingProgress(userId), {
    [progress.moduleId]: JSON.stringify(progress),
  });
}
