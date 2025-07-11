import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Pull-Print Agent</h1>
      <p>Hello Electron + React + TypeScript + Vite!</p>
      <button onClick={() => setCount((c) => c + 1)}>count is {count}</button>
    </div>
  );
}

export default App;
