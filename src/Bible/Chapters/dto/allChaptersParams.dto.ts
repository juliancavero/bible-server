import { RequestParamsDTO } from './requestParams.dto';

export type AllChaptersParamsDTO = RequestParamsDTO & {
  book?: string;
  version?: string;
};
