import { StrictMode } from 'react';
import Thingy from 'package2';

console.log(Thingy);

const App = () => (
  <StrictMode>
    {typeof Thingy === 'function' ? 'It worked!' : 'It failed, Thingy is a ' + typeof Thingy}
  </StrictMode>
);

export default App;
