import { useNavigate } from 'react-router-dom';
import './how-to-start.scss';

export default function HowToStartPage() {
  const navigate = useNavigate();

  return (
    <section className="how-to-start">
      <h1 className="section-title">How to Start</h1>
      
      <div className="how-to-start__content">
        {/* Step 1 */}
        <div className="how-to-start__step">
          <div className="how-to-start__step-number">1</div>
          <div className="how-to-start__step-content">
            <h3 className="how-to-start__step-title">Create Your Account</h3>
            <p className="how-to-start__step-description">Quick registration in just a few minutes.</p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="how-to-start__step">
          <div className="how-to-start__step-number">2</div>
          <div className="how-to-start__step-content">
            <h3 className="how-to-start__step-title">Deposit XRP Only</h3>
            <p className="how-to-start__step-description">Deposits are accepted only in XRP.</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="how-to-start__step">
          <div className="how-to-start__step-number">3</div>
          <div className="how-to-start__step-content">
            <h3 className="how-to-start__step-title">Choose Your Staking Pool</h3>
            
            <div className="how-to-start__pools">
              {/* Flexible Staking */}
              <div className="how-to-start__pool how-to-start__pool--flexible">
                <h4 className="how-to-start__pool-title">Flexible Staking</h4>
                <div className="how-to-start__pool-details">
                  <div className="how-to-start__pool-item">
                    <span className="how-to-start__pool-value">9% </span>
                  </div>
                  <div className="how-to-start__pool-item">
                    <span className="how-to-start__pool-label">✓ Withdraw anytime</span>
                  </div>
                </div>
              </div>

              {/* Monthly Lock */}
              <div className="how-to-start__pool how-to-start__pool--monthly">
                <h4 className="how-to-start__pool-title">Monthly Lock</h4>
                <div className="how-to-start__pool-details">
                  <div className="how-to-start__pool-item">
                    <span className="how-to-start__pool-value">20% </span>
                  </div>
                  <div className="how-to-start__pool-item">
                    <span className="how-to-start__pool-label">⚠ Locked for 30 days</span>
                  </div>
                </div>
              </div>

              {/* Annual Lock */}
              <div className="how-to-start__pool how-to-start__pool--annual">
                <h4 className="how-to-start__pool-title">Annual Lock</h4>
                <div className="how-to-start__pool-details">
                  <div className="how-to-start__pool-item">
                    <span className="how-to-start__pool-value">30% </span>
                  </div>
                  <div className="how-to-start__pool-item">
                    <span className="how-to-start__pool-label">⚠ Locked for 365 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="how-to-start__step">
          <div className="how-to-start__step-number">4</div>
          <div className="how-to-start__step-content">
            <h3 className="how-to-start__step-title">Start Earning</h3>
            <p className="how-to-start__step-description">Receive your rewards every day!</p>
            
            {/* CTA Button inside step 4 */}
            <div className="how-to-start__cta">
              <button 
                className="btn btn--primary how-to-start__stake-btn"
                onClick={() => navigate('/')}
              >
                Stake Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
