import './App.css'
import WalletConnect from './components/WalletConnect'
import Game from './components/Game'
import { styles } from './styles/layoutStyles'
import { WalletProvider } from './contexts/WalletContext'

function App() {
  return (
    <WalletProvider>
      <div style={styles.appContainer}>
        {/* Navbar */}
        <div style={styles.navbar}>
          <WalletConnect />
        </div>
        
        {/* Game container directly below navbar */}
        <div style={styles.gameWrapper}>
          <Game />
        </div>
      </div>
    </WalletProvider>
  )
}

export default App
