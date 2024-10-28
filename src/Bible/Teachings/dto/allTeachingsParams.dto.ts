import { RequestParamsDTO } from '@/common/requestParams.dto';

export type AllTeachingsParams = RequestParamsDTO & {
  book?: string;
};
