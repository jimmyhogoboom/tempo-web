type TimeEntry = IStorable & {
  title: string;
  startTime: Date;
  endTime?: Date;
  projectId?: UUID;
};
