type TimeEntry = {
	id: UUID;
	title: string;
	startTime: Date;
	endTime?: Date;
	createdAt: Date;
	updatedAt?: Date;
	projectId?: UUID;
};
