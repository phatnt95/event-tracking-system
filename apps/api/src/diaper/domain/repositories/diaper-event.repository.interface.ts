import { DiaperEvent } from '../entities/diaper-event.entity';

export interface IDiaperEventRepository {
  create(diaperEvent: Partial<DiaperEvent>, eventData: any): Promise<DiaperEvent>;
  findById(id: string): Promise<DiaperEvent | null>;
  findByEventId(eventId: string): Promise<DiaperEvent | null>;
  findAllByBabyId(babyId: string): Promise<DiaperEvent[]>;
  update(id: string, diaperEvent: Partial<DiaperEvent>, eventData?: any): Promise<DiaperEvent>;
  delete(id: string): Promise<void>;
}
