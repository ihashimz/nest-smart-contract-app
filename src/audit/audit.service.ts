import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditResource } from './entities/audit-log.entity';

export interface AuditLogData {
  userId?: string;
  userEmail?: string;
  bankId?: string;
  bankName?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  description?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(auditData: AuditLogData): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(auditData);
    return this.auditLogRepository.save(auditLog);
  }

  async getLogs(
    filters: {
      userId?: string;
      bankId?: string;
      action?: AuditAction;
      resource?: AuditResource;
      startDate?: Date;
      endDate?: Date;
    },
    page: number = 1,
    limit: number = 50,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (filters.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters.bankId) {
      query.andWhere('audit.bankId = :bankId', { bankId: filters.bankId });
    }

    if (filters.action) {
      query.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters.resource) {
      query.andWhere('audit.resource = :resource', { resource: filters.resource });
    }

    if (filters.startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate: filters.endDate });
    }

    query.orderBy('audit.createdAt', 'DESC');

    const [logs, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { logs, total };
  }

  async getLogsByResource(resource: AuditResource, resourceId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { resource, resourceId },
      order: { createdAt: 'DESC' },
    });
  }

  async getLogsByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getLogsByBank(bankId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { bankId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
} 