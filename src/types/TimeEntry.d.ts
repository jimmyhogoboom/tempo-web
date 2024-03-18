type TimeEntry = {
	id: string;
	startTime: Date;
	endTime?: Date;
	title: string;
};

type TimeEntryUpdate = {
	id: string;
	startTime?: Date;
	endTime?: Date;
	title?: string;
};
