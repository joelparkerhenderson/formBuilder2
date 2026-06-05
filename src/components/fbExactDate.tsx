import * as React from 'react';
import { fbPartialDate as FbPartialDate } from './fbPartialDate';

type ExactDateProps = React.ComponentProps<typeof FbPartialDate>;

export const fbExactDate: React.FC<Omit<ExactDateProps, 'exactOnly'>> = (props) => (
  <FbPartialDate {...props} exactOnly={true} />
);
