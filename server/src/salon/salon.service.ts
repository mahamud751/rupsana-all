import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StoreService } from '../store/store.service.js';
import { AppointmentStatus } from '../generated/prisma/enums.js';
import { Prisma } from '../generated/prisma/client.js';
import { paginate } from '../common/dto/pagination.dto.js';
import {
  normalizePhone,
  parseDateOnly,
  todayDateOnly,
} from '../common/utils.js';
import {
  AdminAppointmentQueryDto,
  CreateAppointmentDto,
  CreateServiceDto,
  UpdateServiceDto,
} from './salon.dto.js';

const MAX_DAYS_AHEAD = 60;
const DAY = 24 * 60 * 60 * 1000;
const ACTIVE = [AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED];

const STATUS_MESSAGE: Record<AppointmentStatus, string> = {
  REQUESTED: 'has been requested. Our team will call you to confirm.',
  CONFIRMED: 'is confirmed. We look forward to seeing you!',
  COMPLETED: 'is complete. Thank you for visiting Rupsuhana!',
  CANCELLED: 'has been cancelled.',
};

@Injectable()
export class SalonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly store: StoreService,
  ) {}

  // ---------- Services ----------

  services(includeInactive = false) {
    return this.prisma.service.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  createService(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: dto });
  }

  updateService(id: string, dto: UpdateServiceDto) {
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  // ---------- Availability ----------

  private checkDate(value: string) {
    const date = parseDateOnly(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date');
    }
    const today = todayDateOnly().getTime();
    if (date.getTime() <= today) {
      throw new BadRequestException(
        'Please choose a date from tomorrow onwards.',
      );
    }
    if (date.getTime() > today + MAX_DAYS_AHEAD * DAY) {
      throw new BadRequestException(
        `Bookings open up to ${MAX_DAYS_AHEAD} days ahead.`,
      );
    }
    return date;
  }

  async availability(
    value: string,
    db: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const date = this.checkDate(value);
    const { timeSlots, slotCapacity } = await this.store.settings();
    const booked = await db.appointment.groupBy({
      by: ['slot'],
      where: { date, status: { in: ACTIVE } },
      _count: { _all: true },
    });
    return {
      date: value,
      slots: timeSlots.map((slot) => {
        const used = booked.find((b) => b.slot === slot)?._count._all ?? 0;
        const remaining = Math.max(0, slotCapacity - used);
        return { slot, available: remaining > 0, remaining };
      }),
    };
  }

  // ---------- Customer appointments ----------

  async book(userId: string, dto: CreateAppointmentDto) {
    const service = await this.prisma.service.findFirst({
      where: { id: dto.serviceId, isActive: true },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return this.prisma.$transaction(
      async (tx) => {
        const { slots } = await this.availability(dto.date, tx);
        const slot = slots.find((s) => s.slot === dto.slot);
        if (!slot) {
          throw new BadRequestException('This time slot does not exist.');
        }
        if (!slot.available) {
          throw new ConflictException(
            'Sorry, this time slot was just booked. Please pick another time.',
          );
        }
        const appointment = await tx.appointment.create({
          data: {
            userId,
            serviceId: service.id,
            serviceName: service.name,
            price: service.price,
            date: parseDateOnly(dto.date),
            slot: dto.slot,
            name: dto.name.trim(),
            phone: normalizePhone(dto.phone),
            note: dto.note?.trim() || null,
          },
        });
        await tx.notification.create({
          data: {
            userId,
            title: 'Appointment requested',
            body: `${service.name} on ${dto.date} at ${dto.slot} ${STATUS_MESSAGE.REQUESTED}`,
          },
        });
        return appointment;
      },
      // Serializable so two people cannot take the last spot in a slot.
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  mine(userId: string) {
    return this.prisma.appointment.findMany({
      where: { userId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async cancelMine(userId: string, id: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, userId },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (!ACTIVE.includes(appointment.status as (typeof ACTIVE)[number])) {
      throw new BadRequestException(
        'This appointment can no longer be cancelled.',
      );
    }
    return this.setStatus(id, AppointmentStatus.CANCELLED);
  }

  // ---------- Admin ----------

  async adminList(query: AdminAppointmentQueryDto) {
    const { page = 1, limit = 20, status, date } = query;
    const where: Prisma.AppointmentWhereInput = {
      ...(status ? { status } : {}),
      ...(date ? { date: parseDateOnly(date) } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        include: { user: { select: { id: true, name: true, phone: true } } },
        orderBy: [{ date: 'asc' }, { slot: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);
    return paginate(items, total, page, limit);
  }

  setStatus(id: string, status: AppointmentStatus) {
    return this.prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.update({
        where: { id },
        data: { status },
      });
      const day = appointment.date.toISOString().slice(0, 10);
      await tx.notification.create({
        data: {
          userId: appointment.userId,
          title: `Appointment ${status.toLowerCase()}`,
          body: `${appointment.serviceName} on ${day} at ${appointment.slot} ${STATUS_MESSAGE[status]}`,
        },
      });
      return appointment;
    });
  }
}
