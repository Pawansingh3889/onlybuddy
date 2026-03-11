import { useTheme } from '../contexts/ThemeContext';

const LAST_UPDATED = '11 March 2026';
const COMPANY = 'OnlyBuddy Ltd';
const COMPANY_NUMBER = '[YOUR COMPANIES HOUSE NUMBER]';
const EMAIL = 'privacy@onlybuddy.co.uk';
const ICO_NUMBER = '[YOUR ICO REGISTRATION NUMBER]'; // register at ico.org.uk — £40/yr

export default function PrivacyPage() {
  const { theme, isDark } = useTheme();

  const heroGrad = isDark
    ? 'linear-gradient(135deg, #0D0720, #1A0F2E)'
    : `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})`;

  const h2 = { fontSize:'clamp(17px,3vw,22px)', fontWeight:800, fontFamily:"'Outfit',sans-serif", color:theme.text, marginTop:40, marginBottom:12, paddingTop:24, borderTop:`1px solid ${theme.border}` };
  const h3 = { fontSize:15, fontWeight:700, color:theme.text, marginTop:18, marginBottom:6, fontFamily:"'Outfit',sans-serif" };
  const p  = { fontSize:14, color:theme.muted, lineHeight:1.85, marginBottom:12 };
  const li = { fontSize:14, color:theme.muted, lineHeight:1.85, marginBottom:6, paddingLeft:8 };

  return (
    <div style={{ background:theme.bg, overflowX:'hidden' }}>
      <div style={{ background:heroGrad, padding:'clamp(40px,8vw,72px) 20px', textAlign:'center' }}>
        <h1 style={{ fontSize:'clamp(26px,5vw,44px)', fontWeight:800, color:'#fff', fontFamily:"'Outfit',sans-serif", marginBottom:10 }}>Privacy Policy</h1>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)' }}>Last updated: {LAST_UPDATED} · ICO Registration: {ICO_NUMBER}</p>
      </div>

      <div style={{ maxWidth:800, margin:'0 auto', padding:'clamp(40px,6vw,64px) 20px 80px' }}>
        <div style={{ background:theme.greenBg, border:`1px solid ${theme.green}33`, borderRadius:14, padding:'16px 20px', marginBottom:32, fontSize:14, color:theme.green, lineHeight:1.7 }}>
          🔒 <strong>Your privacy matters.</strong> We collect only what we need, store it securely, and never sell your data to third parties. This policy explains exactly what we collect and why.
        </div>

        <h2 style={h2}>1. Who We Are</h2>
        <p style={p}><strong style={{ color:theme.text }}>{COMPANY}</strong> (company number {COMPANY_NUMBER}) is the data controller for personal data collected through the OnlyBuddy platform. We are registered with the Information Commissioner's Office (ICO) under registration number {ICO_NUMBER}.</p>
        <p style={p}>Contact our Data Protection contact: <strong style={{ color:theme.primary }}>{EMAIL}</strong></p>

        <h2 style={h2}>2. What Data We Collect</h2>

        <h3 style={h3}>2.1 Customers</h3>
        <ul style={{ paddingLeft:16 }}>
          {['Name and email address (registration)','Phone number','Delivery addresses','Order history','Payment method details (processed securely by Stripe/PayPal — we never store card numbers)','Device type and IP address (analytics)','Communications with Buddies via in-app chat'].map(item => <li key={item} style={li}>{item}</li>)}
        </ul>

        <h3 style={h3}>2.2 Buddies (additional data)</h3>
        <ul style={{ paddingLeft:16 }}>
          {['Full name, date of birth, home address','National Insurance number (required for self-employment tax purposes)','Photo ID (passport or driving licence)','Selfie photograph','Vehicle type','DBS certificate reference number','Bank account details (for weekly payments)','GPS location data during active errands','Ratings and order history'].map(item => <li key={item} style={li}>{item}</li>)}
        </ul>

        <div style={{ background:theme.redBg, border:`1px solid ${theme.red}33`, borderRadius:12, padding:'14px 18px', margin:'16px 0 24px' }}>
          <div style={{ fontSize:13, fontWeight:700, color:theme.red, marginBottom:6 }}>Special Category Data Notice</div>
          <div style={{ fontSize:13, color:theme.muted, lineHeight:1.7 }}>National Insurance numbers and government-issued ID documents are considered sensitive personal data under UK GDPR. This data is encrypted at rest using AES-256 encryption, accessible only to authorised OnlyBuddy staff, and used solely for identity verification and HMRC compliance purposes.</div>
        </div>

        <h2 style={h2}>3. Legal Basis for Processing</h2>
        <p style={p}>Under UK GDPR, we process your data on the following legal bases:</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10, margin:'12px 0 20px' }}>
          {[
            ['Contract Performance (Art. 6(1)(b))', 'Processing your orders, payments, and delivery addresses'],
            ['Legal Obligation (Art. 6(1)(c))', 'NI numbers, DBS checks, financial records for HMRC compliance'],
            ['Legitimate Interests (Art. 6(1)(f))', 'Fraud prevention, platform security, improving our service'],
            ['Consent (Art. 6(1)(a))', 'Marketing emails — you can withdraw consent at any time'],
          ].map(([basis, use]) => (
            <div key={basis} style={{ background:theme.card2, border:`1px solid ${theme.border}`, borderRadius:10, padding:'12px 16px' }}>
              <div style={{ fontSize:13, fontWeight:700, color:theme.text, marginBottom:3 }}>{basis}</div>
              <div style={{ fontSize:13, color:theme.muted }}>{use}</div>
            </div>
          ))}
        </div>

        <h2 style={h2}>4. How We Use Your Data</h2>
        <ul style={{ paddingLeft:16 }}>
          {['Matching Customers with available Buddies','Processing payments and issuing receipts','Verifying Buddy identity and eligibility to work','Calculating and paying Buddy earnings','Providing live order tracking','Sending order confirmations and updates by email/SMS','Improving the Platform through aggregated analytics','Complying with legal obligations (HMRC, ICO, police requests where legally required)','Resolving disputes and investigating fraud'].map(item => <li key={item} style={li}>{item}</li>)}
        </ul>

        <h2 style={h2}>5. Who We Share Your Data With</h2>
        <p style={p}>We <strong style={{ color:theme.text }}>never sell your data</strong>. We share limited data only with:</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8, margin:'12px 0 20px' }}>
          {[
            ['Stripe / PayPal', 'Payment processing. Subject to their own privacy policies.'],
            ['Firebase (Google)', 'Secure data storage and authentication. Data stored in EU region.'],
            ['EmailJS', 'Transactional email delivery (order confirmations).'],
            ['HMRC', 'Where legally required for tax compliance.'],
            ['Police / Authorities', 'Only when required by a valid legal request or court order.'],
          ].map(([name, purpose]) => (
            <div key={name} style={{ display:'flex', gap:12, background:theme.card2, border:`1px solid ${theme.border}`, borderRadius:10, padding:'12px 16px' }}>
              <div style={{ fontSize:13, fontWeight:700, color:theme.text2, minWidth:100, flexShrink:0 }}>{name}</div>
              <div style={{ fontSize:13, color:theme.muted }}>{purpose}</div>
            </div>
          ))}
        </div>

        <h2 style={h2}>6. Data Retention</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:8, margin:'12px 0 20px' }}>
          {[
            ['Customer order history', '3 years (Consumer Rights Act)'],
            ['Payment records', '7 years (HMRC requirement)'],
            ['Buddy NI & financial records', '7 years (HMRC requirement)'],
            ['ID documents (Buddy)', '2 years after account closure'],
            ['Chat messages', '12 months'],
            ['GPS location data', '30 days'],
            ['Unsuccessful applications', '6 months then deleted'],
          ].map(([type, period]) => (
            <div key={type} style={{ display:'flex', justifyContent:'space-between', gap:12, padding:'10px 0', borderBottom:`1px solid ${theme.border}`, fontSize:14 }}>
              <span style={{ color:theme.muted }}>{type}</span>
              <span style={{ color:theme.text, fontWeight:600 }}>{period}</span>
            </div>
          ))}
        </div>

        <h2 style={h2}>7. Your Rights Under UK GDPR</h2>
        <p style={p}>You have the following rights, which you can exercise by contacting {EMAIL}:</p>
        <ul style={{ paddingLeft:16 }}>
          {[
            ['Right of Access', 'Request a copy of all personal data we hold about you (Subject Access Request)'],
            ['Right to Rectification', 'Correct inaccurate or incomplete data'],
            ['Right to Erasure', 'Request deletion of your data ("right to be forgotten") — subject to legal retention obligations'],
            ['Right to Restriction', 'Ask us to limit how we process your data'],
            ['Right to Portability', 'Receive your data in a machine-readable format'],
            ['Right to Object', 'Object to processing based on legitimate interests or for direct marketing'],
            ['Right to Withdraw Consent', 'Withdraw marketing consent at any time via the unsubscribe link in any email'],
          ].map(([right, desc]) => (
            <li key={right} style={{ ...li, marginBottom:10 }}><strong style={{ color:theme.text2 }}>{right}:</strong> {desc}</li>
          ))}
        </ul>
        <p style={p}>We will respond to all rights requests within <strong style={{ color:theme.text }}>30 days</strong>. You also have the right to lodge a complaint with the ICO at ico.org.uk or by calling 0303 123 1113.</p>

        <h2 style={h2}>8. Cookies</h2>
        <p style={p}>We use the following cookies on the OnlyBuddy platform:</p>
        <ul style={{ paddingLeft:16 }}>
          <li style={li}><strong style={{ color:theme.text2 }}>Essential cookies:</strong> Authentication, session management — cannot be disabled</li>
          <li style={li}><strong style={{ color:theme.text2 }}>Analytics cookies:</strong> Anonymous usage data to improve the platform — can be disabled</li>
          <li style={li}><strong style={{ color:theme.text2 }}>Marketing pixels:</strong> Meta (Facebook/Instagram), TikTok, and Snapchat pixels on our /join recruitment page — only active if you visit that page. Can be blocked via your browser settings.</li>
        </ul>

        <h2 style={h2}>9. Security</h2>
        <p style={p}>We implement appropriate technical and organisational measures including:</p>
        <ul style={{ paddingLeft:16 }}>
          {['AES-256 encryption for sensitive documents at rest','HTTPS/TLS encryption for all data in transit','Firebase Security Rules limiting data access by user role','Staff access controls — only authorised personnel can access Buddy documents','Regular security reviews'].map(item => <li key={item} style={li}>{item}</li>)}
        </ul>

        <h2 style={h2}>10. Changes to This Policy</h2>
        <p style={p}>We will notify you of material changes by email with at least <strong style={{ color:theme.text }}>14 days notice</strong>. The latest version is always available at onlybuddy.co.uk/privacy.</p>

        <h2 style={h2}>11. Contact</h2>
        <p style={p}>{COMPANY} · Company No. {COMPANY_NUMBER}<br />Data Protection contact: <strong style={{ color:theme.primary }}>{EMAIL}</strong><br />ICO Registration: {ICO_NUMBER}</p>

        <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:14, padding:'20px 24px', marginTop:32, display:'flex', gap:16, alignItems:'flex-start' }}>
          <div style={{ fontSize:28 }}>🏛️</div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:theme.text, marginBottom:4 }}>ICO — Information Commissioner's Office</div>
            <div style={{ fontSize:13, color:theme.muted, lineHeight:1.7 }}>If you're unhappy with how we've handled your data and we haven't resolved your concern, you can complain to the ICO at <strong style={{ color:theme.primary }}>ico.org.uk</strong> or call <strong style={{ color:theme.text2 }}>0303 123 1113</strong>.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
