import { useState, useEffect } from 'react';
import { accountApi } from '../../../../shared/api/modules/account';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import './security.scss';

export default function SecurityPage() {
  const [secret, setSecret] = useState<string>('');
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const generateQRCode = async () => {
    try {
      const response = await accountApi.generate2FA();
      
      console.log('2FA generate response:', response);
      
      // Check if the response indicates 2FA is already set
      if (!response.success && response.message) {
        const errorMessage = response.message.toLowerCase();
        if (errorMessage.includes('2fa has already been set') ||
            errorMessage.includes('already') ||
            errorMessage.includes('set') ||
            errorMessage.includes('enabled') ||
            errorMessage.includes('active')) {
          setIs2FAEnabled(true);
          console.log('2FA is already enabled, setting is2FAEnabled to true');
          return;
        } else {
          console.log('2FA generation failed:', response);
          toast.error('Failed to generate QR code');
          return;
        }
      }
      
      // If successful, show QR code
      if (response.success && response.data?.secret) {
        setSecret(response.data.secret);
        setQrCodeVisible(true);
        if (!response.message.includes('set')) {
          toast.success(response.message);
        }
      }
    } catch (error: any) {
      console.error('Unexpected error in generateQRCode:', error);
      toast.error('Failed to generate QR code');
    }
  };

  useEffect(() => {
    generateQRCode();
  }, []);

  // Debug log to see the current state
  console.log('SecurityPage state:', { is2FAEnabled, qrCodeVisible, secret: !!secret });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      toast.success('Secret copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const verifyAndSet2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await accountApi.set2FA({ twoFaToken: verificationCode });
      
      // Check if 2FA was successfully set
      if (response.success) {
        toast.success('2FA has been successfully enabled!');
        setVerificationCode('');
        setQrCodeVisible(false);
        setSecret('');
        setIs2FAEnabled(true); // Show the 2FA enabled status screen
      } else {
        toast.error('Failed to verify code. Please try again.');
      }
    } catch (error) {
      console.error('Failed to set 2FA:', error);
      toast.error('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section className="security">
      <h1 className="section-title">Security</h1>
      
      <div className="security__content">
        <div className="security__section">
          <h2 className="security__section-title">What is 2FA?</h2>
          <p className="security__description">
            Two-Factor Authentication (2FA) adds an extra security step. To log in, you need your password + a one-time code from an authenticator app. Even if someone knows your password, they cannot access your account without the code.
          </p>
        </div>


        {!is2FAEnabled && (
          <div className="security__section">
            <h2 className="security__section-title">2FA Setup</h2>
            
            <div className="security__steps">
              <div className="security__step">
                <div className="security__step-number">1</div>
                <div className="security__step-content">
                  <h3 className="security__step-title">Install Authenticator App</h3>
                  <p className="security__step-description">
                    Example: Google Authenticator, Microsoft Authenticator, Authy.
                  </p>
                </div>
              </div>

              <div className="security__step">
                <div className="security__step-number">2</div>
                <div className="security__step-content">
                  <h3 className="security__step-title">Scan QR Code</h3>
                  <p className="security__step-description">
                    In the app → Add account → Scan QR code.<br />
                    (If scanning fails, enter the key manually.)
                  </p>
                </div>
              </div>

              <div className="security__step">
                <div className="security__step-number">3</div>
                <div className="security__step-content">
                  <h3 className="security__step-title">Enter Code</h3>
                  <p className="security__step-description">
                    Type the 6-digit code from the app and click Verify.
                  </p>
                </div>
              </div>

              <div className="security__step">
                <div className="security__step-number">4</div>
                <div className="security__step-content">
                  <h3 className="security__step-title">Save Backup Codes</h3>
                  <p className="security__step-description">
                    Keep them safe. Use if you lose your phone.
                  </p>
                </div>
              </div>
            </div>

            {/* {isGenerating && (
              <div className="security__loading">
                <p>Generating QR code...</p>
              </div>
            )} */}

            {qrCodeVisible && secret && (
              <div className="security__qr-section">
                <div className="security__qr-container">
                  <div className="security__qr-code">
                    <QRCodeSVG
                      value={`otpauth://totp/RStaking?secret=${secret}&issuer=RStaking`}
                      size={200}
                      includeMargin
                    />
                  </div>
                  
                  <div className="security__secret">
                    <label className="security__secret-label">Secret Key:</label>
                    <div className="security__secret-input-group">
                      <input 
                        type="text" 
                        value={secret} 
                        readOnly 
                        className="security__secret-input"
                      />
                      <button 
                        className="btn btn--secondary security__copy-btn"
                        onClick={copyToClipboard}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                <div className="security__verification">
                  <label className="security__verification-label">
                    Enter 6-digit code from your authenticator app:
                  </label>
                  <div className="security__verification-group">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setVerificationCode(value);
                      }}
                      placeholder="000000"
                      className="security__verification-input"
                      maxLength={6}
                    />
                    <button 
                      className="btn btn--primary security__verify-btn"
                      onClick={verifyAndSet2FA}
                      disabled={isVerifying || verificationCode.length !== 6}
                    >
                      {isVerifying ? 'Verifying...' : 'Verify & Enable 2FA'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {is2FAEnabled && (
          <div className="security__section">
            <h2 className="security__section-title">✅2FA Status: Active</h2>
            <div className="security__status">
              <div className="security__status-content">
                <p className="security__status-message">
                  Two-Factor Authentication is currently enabled and protecting your account.
                </p>
                <div className="security__status-details">
                  <p className="security__status-detail">
                    • Your account is secured with an additional authentication layer
                  </p>
                  <p className="security__status-detail">
                    • You'll need your authenticator app to log in from new devices
                  </p>
                  <p className="security__status-detail">
                    • Keep your backup codes safe in case you lose access to your authenticator
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}