type TimeEntry = {
	id: UUID;
	startTime: Date;
	endTime?: Date;
	title: string;
};

type TimeEntryUpdate = {
	id: UUID;
	startTime?: Date;
	endTime?: Date;
	title?: string;
};
