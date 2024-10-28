import { Teaching } from './teaching.entity';

export type TeachingByIdResponse = {
  data: Teaching;
  links: {
    prev: number | null;
    next: number | null;
  };
};
