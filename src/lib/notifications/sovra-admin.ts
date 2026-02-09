import { redis } from '@/lib/redis/client';
import { keys } from '@/lib/redis/keys';
import { generateId } from '@/lib/redis/operations/helpers';
import type { Deal, User, DealStatus } from '@/types';

export interface SovraNotification {
  id: string;
  type: 'deal_status_change';
  dealId: string;
  dealName: string;
  partnerId: string;
  partnerName: string;
  fromStatus: DealStatus;
  toStatus: DealStatus;
  changedBy: { userId: string; userName: string };
  notes?: string;
  createdAt: string;
  read: boolean;
}

export async function notifySovraAdmin(
  deal: Deal,
  fromStatus: DealStatus,
  toStatus: DealStatus,
  user: User,
  notes?: string
): Promise<void> {
  const partner = await redis.hgetall(`partner:${deal.partnerId}`);

  const notification: SovraNotification = {
    id: generateId(),
    type: 'deal_status_change',
    dealId: deal.id,
    dealName: deal.clientName,
    partnerId: deal.partnerId,
    partnerName: partner?.companyName as string,
    fromStatus,
    toStatus,
    changedBy: { userId: user.id, userName: user.name },
    notes,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const pipeline = redis.pipeline();

  pipeline.hset(keys.sovraNotification(notification.id), {
    ...notification,
    changedBy: JSON.stringify(notification.changedBy),
  });

  pipeline.zadd(keys.sovraNotifications(), {
    score: new Date().getTime(),
    member: notification.id,
  });

  await pipeline.exec();
}

export async function getSovraNotifications(
  limit = 50
): Promise<SovraNotification[]> {
  const ids = await redis.zrange<string[]>(
    keys.sovraNotifications(),
    0,
    limit - 1,
    { rev: true }
  );

  const notifications = await Promise.all(
    ids.map(async (id) => {
      const notif = await redis.hgetall(keys.sovraNotification(id));
      if (!notif || !notif.id) return null;

      if (notif.changedBy && typeof notif.changedBy === 'string') {
        notif.changedBy = JSON.parse(notif.changedBy);
      }

      // Convert read to boolean if stored as string
      if (typeof notif.read === 'string') {
        notif.read = notif.read === 'true';
      }

      return notif as unknown as SovraNotification;
    })
  );

  return notifications.filter((n): n is SovraNotification => n !== null);
}
