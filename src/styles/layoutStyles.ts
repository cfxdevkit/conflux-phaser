// Layout styles for the application

export const styles = {
  appContainer: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#333',
    overflow: 'hidden'
  },
  navbar: {
    padding: '1rem',
    background: '#222',
    color: 'white',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 100
  },
  gameWrapper: {
    padding: '20px 0 0 0',
    display: 'flex',
    justifyContent: 'center',
    width: '100%'
  },
  gameContainer: {
    width: '100%',
    maxWidth: '1280px',
    height: 'auto',
    aspectRatio: '4/3', // Matches the 1280x960 ratio
    position: 'relative' as const,
    overflow: 'hidden'
  },
  canvas: {
    maxWidth: '100%',
    maxHeight: 'calc(100vh - 120px)', // Adjust based on navbar height + spacing
    margin: '0 auto',
    display: 'block'
  }
};
