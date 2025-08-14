import { useEffect, useState } from 'react'
import './App.css'

function TestApp() {
  const [counter, setCounter] = useState(0)
  
  useEffect(() => {
    console.log("TestApp rendered")
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '20px'
    }}>
      <h1>Test App</h1>
      <p>Counter: {counter}</p>
      <button 
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          background: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
        onClick={() => setCounter(prev => prev + 1)}
      >
        Click Me
      </button>
    </div>
  )
}

export default TestApp
