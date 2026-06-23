import * as React from 'react';
import { fbDatePartial as FbPartialDate } from './fbDatePartial';

type ExactDateProps = React.ComponentProps<typeof FbPartialDate>;

export const fbDateExact: React.FC<Omit<ExactDateProps, 'exactOnly'>> = (props) => (
  <FbPartialDate {...props} exactOnly={true} />
);
