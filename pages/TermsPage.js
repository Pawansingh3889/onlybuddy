import { useTheme } from '../contexts/ThemeContext';

const LAST_UPDATED = '11 March 2026';
const COMPANY = 'OnlyBuddy Ltd';
const COMPANY_NUMBER = '[YOUR COMPANIES HOUSE NUMBER]';
const REGISTERED_ADDRESS = '[YOUR REGISTERED ADDRESS], Hull, England';
const EMAIL = 'legal@onlybuddy.co.uk';

export default function TermsPage() {
  const { theme, isDark } = useTheme();

  const heroGrad = isDark
    ? 'linear-gradient(135deg, #0D0720, #1A0F2E)'
    : `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})`;

  const h2 = { fontSize:'clamp(18px,3vw,24px)', fontWeight:800, fontFamily:"'Outfit',sans-serif", color:theme.text, marginTop:40, marginBottom:14, paddingTop:24, borderTop:`1px solid ${theme.border}` };
  const h3 = { fontSize:16, fontWeight:700, color:theme.text, marginTop:20, marginBottom:8, fontFamily:"'Outfit',sans-serif" };
  const p  = { fontSize:14, color:theme.muted, lineHeight:1.85, marginBottom:12 };
  const li = { fontSize:14, color:theme.muted, lineHeight:1.85, marginBottom:6, paddingLeft:8 };

  return (
    <div style={{ background:theme.bg, overflowX:'hidden' }}>
      <div style={{ background:heroGrad, padding:'clamp(40px,8vw,72px) 20px', textAlign:'center' }}>
        <h1 style={{ fontSize:'clamp(26px,5vw,44px)', fontWeight:800, color:'#fff', fontFamily:"'Outfit',sans-serif", marginBottom:10 }}>Terms of Service</h1>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)' }}>Last updated: {LAST_UPDATED} · {COMPANY}</p>
      </div>

      <div style={{ maxWidth:800, margin:'0 auto', padding:'clamp(40px,6vw,64px) 20px 80px' }}>
        <div style={{ background:theme.primaryBg, border:`1px solid ${theme.primary}33`, borderRadius:14, padding:'16px 20px', marginBottom:32, fontSize:14, color:theme.primary, lineHeight:1.7 }}>
          ⚠️ <strong>Important:</strong> Please read these Terms carefully before using OnlyBuddy. By creating an account or placing an order, you agree to be bound by these Terms. If you do not agree, do not use the platform.
        </div>

        <div style={p}><strong style={{ color:theme.text }}>{COMPANY}</strong> (company number {COMPANY_NUMBER}), registered at {REGISTERED_ADDRESS}, operates the OnlyBuddy platform accessible at onlybuddy.co.uk and via our mobile applications.</div>

        <h2 style={h2}>1. Definitions</h2>
        <ul style={{ paddingLeft:16 }}>
          {[
            ['"Platform"', 'The OnlyBuddy website, mobile app, and all related services'],
            ['"Customer"', 'A person who registers to request and pay for errands'],
            ['"Buddy"', 'A self-employed independent contractor registered to complete errands'],
            ['"Errand"', 'A task requested by a Customer and accepted by a Buddy'],
            ['"Service Fee"', 'The fee charged by OnlyBuddy to the Customer for facilitating the Errand'],
            ['"We/Us/Our"', `${COMPANY}`],
          ].map(([term, def]) => (
            <li key={term} style={li}><strong style={{ color:theme.text2 }}>{term}</strong> — {def}</li>
          ))}
        </ul>

        <h2 style={h2}>2. Nature of the Platform</h2>
        <p style={p}>OnlyBuddy is a <strong style={{ color:theme.text }}>technology platform</strong> that connects Customers with independent Buddy contractors. We do not ourselves provide errand, delivery, or concierge services. Buddies are <strong style={{ color:theme.text }}>self-employed independent contractors</strong>, not employees, workers, or agents of OnlyBuddy.</p>
        <p style={p}>OnlyBuddy acts as a commercial agent on behalf of Buddies for the purposes of collecting payment. The contract for the errand service is between the Customer and the Buddy directly.</p>

        <h2 style={h2}>3. Eligibility</h2>
        <p style={p}>You must be at least 18 years old to use the Platform. By registering, you confirm that you are 18 or over and are legally capable of entering into binding contracts under the laws of England and Wales.</p>

        <h2 style={h2}>4. Customer Terms</h2>
        <h3 style={h3}>4.1 Booking an Errand</h3>
        <p style={p}>When you submit a booking, you are making an offer to engage a Buddy for the described errand at the displayed price. The contract is formed when a Buddy accepts your booking.</p>
        <h3 style={h3}>4.2 Payment</h3>
        <p style={p}>Payment is taken <strong style={{ color:theme.text }}>only after</strong> your errand is completed. We accept payment via Stripe (debit/credit card) and PayPal. All prices shown include VAT where applicable.</p>
        <h3 style={h3}>4.3 Cancellations and Refunds</h3>
        <ul style={{ paddingLeft:16 }}>
          <li style={li}>You may cancel an errand <strong style={{ color:theme.text2 }}>free of charge</strong> at any time before a Buddy accepts it.</li>
          <li style={li}>If you cancel after a Buddy has accepted but before they have started, a <strong style={{ color:theme.text2 }}>£2.00 cancellation fee</strong> applies to compensate the Buddy for their time.</li>
          <li style={li}>If you cancel after the Buddy has started the errand, you will be charged for reasonable costs incurred (e.g. items already purchased on your behalf).</li>
          <li style={li}>If OnlyBuddy or a Buddy cannot fulfil your errand, you will receive a <strong style={{ color:theme.text2 }}>full refund</strong> within 5 business days.</li>
        </ul>
        <h3 style={h3}>4.4 Your Responsibilities</h3>
        <ul style={{ paddingLeft:16 }}>
          <li style={li}>Provide accurate delivery addresses and contact information</li>
          <li style={li}>Be available to receive your errand or authorise a safe location for items to be left</li>
          <li style={li}>Not request errands that involve illegal items, controlled substances, or anything that would put a Buddy at risk</li>
          <li style={li}>Treat Buddies with respect — abusive behaviour will result in account suspension</li>
        </ul>

        <h2 style={h2}>5. Buddy Terms</h2>
        <h3 style={h3}>5.1 Independent Contractor Status</h3>
        <p style={p}>Buddies are <strong style={{ color:theme.text }}>self-employed independent contractors</strong>. Nothing in these Terms creates an employment relationship, worker relationship, or agency relationship between OnlyBuddy and any Buddy. Buddies are responsible for their own tax obligations, National Insurance contributions, and compliance with HMRC self-employment rules.</p>
        <h3 style={h3}>5.2 Buddy Eligibility</h3>
        <ul style={{ paddingLeft:16 }}>
          <li style={li}>Must be 18 years or older</li>
          <li style={li}>Must have the right to work in the United Kingdom</li>
          <li style={li}>Must complete identity verification and provide a valid DBS Basic certificate before going live</li>
          <li style={li}>Must have appropriate insurance for their activities (public liability recommended minimum £1M)</li>
        </ul>
        <h3 style={h3}>5.3 Buddy Conduct</h3>
        <p style={p}>Buddies must complete accepted errands promptly and to a reasonable standard. Repeated cancellations, poor ratings (below 3.5★), or misconduct will result in suspension or removal from the Platform.</p>
        <h3 style={h3}>5.4 Earnings and Payment</h3>
        <p style={p}>Buddies receive their earnings weekly via bank transfer. OnlyBuddy retains a platform commission from each transaction. The current commission rates are published in the Buddy onboarding documentation and may be updated with 30 days notice.</p>

        <h2 style={h2}>6. Pricing and Service Fees</h2>
        <p style={p}>Our current pricing is detailed on the Pricing page at onlybuddy.co.uk/pricing. We reserve the right to change prices with <strong style={{ color:theme.text }}>7 days notice</strong> published on the website. Changes will not affect orders already confirmed.</p>

        <h2 style={h2}>7. Liability</h2>
        <h3 style={h3}>7.1 Our Liability</h3>
        <p style={p}>To the maximum extent permitted by UK law, OnlyBuddy's total liability to you in connection with the Platform shall not exceed the greater of: (a) the total Service Fees paid by you in the 3 months prior to the claim, or (b) £100.</p>
        <h3 style={h3}>7.2 We Are Not Liable For</h3>
        <ul style={{ paddingLeft:16 }}>
          <li style={li}>Acts or omissions of Buddies (though we maintain a complaints and dispute process)</li>
          <li style={li}>Items lost, damaged, or stolen during an errand (Buddies carry their own insurance)</li>
          <li style={li}>Indirect, consequential, or economic losses</li>
          <li style={li}>Delays caused by circumstances outside our reasonable control</li>
        </ul>
        <h3 style={h3}>7.3 Consumer Rights</h3>
        <p style={p}>Nothing in these Terms affects your statutory rights as a consumer under the Consumer Rights Act 2015 or any other applicable UK consumer protection legislation.</p>

        <h2 style={h2}>8. Intellectual Property</h2>
        <p style={p}>All content on the Platform including logos, copy, code, and design is the property of {COMPANY} and may not be reproduced without written permission.</p>

        <h2 style={h2}>9. Termination</h2>
        <p style={p}>We may suspend or terminate your account if you breach these Terms, engage in fraudulent activity, or behave abusively toward Buddies or OnlyBuddy staff. You may close your account at any time by contacting {EMAIL}.</p>

        <h2 style={h2}>10. Governing Law and Disputes</h2>
        <p style={p}>These Terms are governed by the laws of <strong style={{ color:theme.text }}>England and Wales</strong>. Any disputes shall be subject to the exclusive jurisdiction of the English courts.</p>
        <p style={p}>We aim to resolve all complaints informally first. Contact us at {EMAIL} and we will respond within 5 business days. If we cannot resolve your complaint, you may refer it to a certified ADR provider.</p>

        <h2 style={h2}>11. Changes to These Terms</h2>
        <p style={p}>We may update these Terms from time to time. We will notify registered users by email at least <strong style={{ color:theme.text }}>14 days before</strong> any material changes take effect. Continued use of the Platform after that date constitutes acceptance.</p>

        <h2 style={h2}>12. Contact</h2>
        <p style={p}>{COMPANY}<br />Registered in England & Wales · Company No. {COMPANY_NUMBER}<br />{REGISTERED_ADDRESS}<br />Email: {EMAIL}</p>
      </div>
    </div>
  );
}
