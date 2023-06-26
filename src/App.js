import { StrictMode } from 'react';
import Thingy from '@ZenTwipped/webpack-esm-component-dependant';

console.log({ Thingy });

const App = () => (
  <StrictMode>
    {typeof Thingy === 'function' ? 'It worked!' : 'It failed, Thingy is a ' + typeof Thingy}
    <Thingy />
  </StrictMode>
);

export default App;
