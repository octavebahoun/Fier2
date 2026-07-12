import React from 'react';

/**
 * Filet de sécurité global : capture toute erreur JS d'un composant enfant
 * et affiche un écran de secours au lieu d'un écran blanc total.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log en console (remplaçable par Sentry/LogRocket plus tard)
    console.error('[ErrorBoundary]', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            Oups, une erreur est survenue
          </h1>
          <p style={{ maxWidth: 420, color: '#555', margin: 0 }}>
            La page n'a pas pu s'afficher correctement. Reviens à l'accueil pour continuer.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: '9999px',
              border: 'none',
              background: '#111',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retour à l'accueil
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
