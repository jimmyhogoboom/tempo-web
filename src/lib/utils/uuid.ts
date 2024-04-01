import Maybe, { just, nothing } from 'true-myth/maybe';

export const asUUID = (s?: string): Maybe<UUID> => (s?.split('-').length === 5 ? just(s as UUID) : nothing());
