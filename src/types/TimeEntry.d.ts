type TimeEntry = IStorable & {
  title: string;
  startTime: Date;
  endTime?: Date;
  projectId?: UUID;
};
type TimeEntryUpdate = {
  id: UUID;
  startTime?: Date;
  endTime?: Date;
  title?: string;
  projectId?: UUID;
};
type NewTimeEntry = Omit<TimeEntryUpdate, 'id'>;

