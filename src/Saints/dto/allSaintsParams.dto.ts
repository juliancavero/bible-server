import { RequestParamsDTO } from './requestParams.dto';

export type AllSaintsParamsDTO = RequestParamsDTO & {
  day?: string;
  month?: string;
  withoutImage?: boolean;
};
