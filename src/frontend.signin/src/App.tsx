import React from 'react';
import { MainPage } from '~/common/components/MainPage'
import CookieConsent from "react-cookie-consent"
// See also: https://www.npmjs.com/package/react-cookie-consent // , { Cookies }
import { useMainContext } from '~/common/hooks'

const btnStyle = {
  borderRadius: '4px',
  // lineHeight: '38px',
  color: '#FFF',
  lineHeight: 1.5,
  letterSpacing: '0.00938em',
  fontSize: '1rem',
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
}

function App() {
  const { onAcceptCookie, onDeclineCookie, isCookieAccepted } = useMainContext()
  return (
    <>
      <MainPage />
      {
        !isCookieAccepted && (
          <div style={{
            background: 'rgba(0,0,0,0.85)',
            width: '100%',
            left: '0px',
            position: 'fixed',
            zIndex: 999,
            top: '0px',
          }}>
            <CookieConsent
              location='top'
              buttonText='Accept'
              declineButtonText='Decline'
              
              cookieName='is-cookie-confirmed'
              cookieValue='1'
              style={{
                background: 'transparent',
                position: 'unset',
              }}
              buttonStyle={{ ...btnStyle, backgroundColor: 'rgb(255, 144, 0)' }}
              declineButtonStyle={{ ...btnStyle, backgroundColor: 'rgb(255, 0, 0)' }}
              enableDeclineButton
              buttonWrapperClasses='cookie-disclaimer_btns-wrapper'
              containerClasses='cookie-disclaimer_container'
              expires={1}
              onDecline={() => {
                onDeclineCookie()
              }}
              onAccept={() => {
                onAcceptCookie()
              }}
            >
              This website uses cookies to enhance the user experience.{" "}
              <span style={{ fontSize: '10px' }}>This bit of text is smaller :O</span>
            </CookieConsent>
          </div>
        )
      }
    </>
  );
}

export default App;
