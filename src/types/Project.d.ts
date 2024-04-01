enum RateType {
  Hourly,
}

type Project = {
  id: UUID;
  title: string;
  rate?: number;
  rateType?: RateType;
  createdAt: Date;
  updatedAt?: Date;
};
