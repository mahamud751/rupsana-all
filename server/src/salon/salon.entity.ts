import { AppointmentStatus } from '../generated/prisma/enums.js';

export class ServiceEntity {
  id: string;
  name: string;
  durationLabel: string;
  price: number;
  sortOrder: number;
  isActive: boolean;
}

export class SlotEntity {
  /** e.g. "10:00 AM" */
  slot: string;
  available: boolean;
  /** Spots left in this slot */
  remaining: number;
}

export class AvailabilityEntity {
  date: string;
  slots: SlotEntity[];
}

export class AppointmentEntity {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  /** Calendar date (time part is always 00:00 UTC) */
  date: Date;
  slot: string;
  name: string;
  phone: string;
  note: string | null;
  status: AppointmentStatus;
  createdAt: Date;
}

export class AdminAppointmentEntity extends AppointmentEntity {
  user: { id: string; name: string; phone: string };
}

export class PaginatedAppointmentsEntity {
  items: AdminAppointmentEntity[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
