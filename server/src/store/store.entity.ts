export class SettingsEntity {
  storeName: string;
  phone: string;
  whatsapp: string;
  email: string;
  bkashNumber: string;
  salonAddress: string;
  salonHours: string;
  deliveryInside: number;
  deliveryOutside: number;
  timeSlots: string[];
  slotCapacity: number;
}

export class FaqEntity {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}
