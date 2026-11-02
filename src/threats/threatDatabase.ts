/**
 * Threat Explanation Encyclopedia
 * Educational, defensive reference explaining detected threats in plain language.
 */

import { ThreatConcept } from '../types/index.ts';

export const THREAT_CONCEPTS: ThreatConcept[] = [
  {
    id: 'threat-domain-impersonation',
    name: 'Domain Impersonation & Typosquatting',
    category: 'url_manipulation',
    severity: 'CRITICAL',
    shortDescription: 'Registering deceptively similar domain names to impersonate trusted brands.',
    whatItMeans: 'Domain impersonation occurs when attackers register a web address designed to fool the human eye into believing it is a reputable website (e.g., paypa1.com, micros0ft.com, or netflix-security.com).',
    whyItMatters: 'Users trust visual familiarity. If an address looks approximately right at a glance, users are far more likely to type their corporate credentials, credit cards, or personal identities.',
    howAttackersUseIt: 'Attackers create an exact visual clone of the target company\'s login page and host it on the lookalike domain. Once the victim lands on the page, any credentials entered are transmitted straight to the attacker\'s database.',
    realisticExample: 'An SMS arrives saying: "Chase Bank Alert: Unusual activity detected. Verify your card at chase-security-card.com". The official site is chase.com; the impersonated domain belongs to an offshore attacker.',
    howToProtect: [
      'Read URLs from right to left, focusing on the root domain and top-level domain.',
      'Bookmark critical banking and email portals rather than following links from emails or text messages.',
      'Check browser address bars for character oddities (such as substituting the numeral "1" for the lowercase letter "l").'
    ]
  },
  {
    id: 'threat-credential-harvesting',
    name: 'Credential Harvesting',
    category: 'credential_theft',
    severity: 'CRITICAL',
    shortDescription: 'Deceptive interfaces specifically engineered to capture usernames, passwords, and 2FA tokens.',
    whatItMeans: 'Credential harvesting is the automated or manual theft of login credentials through mock login screens, fake password-reset portals, or deceptive authentication prompts.',
    whyItMatters: 'Stolen credentials grant attackers persistent, authorized access to email accounts, bank accounts, cloud storage, and enterprise networks without needing to break encryption or exploit software vulnerabilities.',
    howAttackersUseIt: 'Phishers deploy exact replicas of Microsoft 365, Google Workspace, or banking sign-in dialogs. When the user submits the form, a reverse proxy captures the session token or credentials in real-time.',
    realisticExample: 'An email disguised as a HR portal asks employees to "Log in with your corporate SSO to review the updated 2026 benefits policy".',
    howToProtect: [
      'Use a reputable password manager; password managers automatically refuse to autofill credentials if the domain does not match exactly.',
      'Enforce hardware FIDO2 / WebAuthn security keys which are mathematically immune to credential harvesting proxies.',
      'Never enter credentials after clicking an unsolicited link.'
    ]
  },
  {
    id: 'threat-authority-spoofing',
    name: 'URL Authority Spoofing (@ Symbol Trick)',
    category: 'url_manipulation',
    severity: 'CRITICAL',
    shortDescription: 'Using the RFC "@" credential delimiter in URLs to hide the real destination host.',
    whatItMeans: 'Under internet standard RFC 3986, any text preceding an "@" character in the host part of a URL is interpreted as authentication info (username:password) and ignored by modern browsers, navigating directly to the host that follows the "@".',
    whyItMatters: 'Users scanning a link see "google.com" or "bank.com" at the beginning and mistakenly assume the destination is safe, whereas the browser navigates to the malicious host placed after the "@".',
    howAttackersUseIt: 'An attacker shares a link formatted as "https://paypal.com@evil-phishing-host.com/login". Casual viewers focus on "paypal.com", but the browser actually connects to "evil-phishing-host.com".',
    realisticExample: 'Link text reads: "https://apple.com@secure-id-resolution.net/auth". When clicked, the user is transported to secure-id-resolution.net.',
    howToProtect: [
      'Never click links that contain the "@" character in the hostname portion.',
      'Look at the text immediately preceding the first single slash ("/") after "https://" to identify the true destination server.'
    ]
  },
  {
    id: 'threat-social-engineering',
    name: 'Psychological Urgency & Fear Exploitation',
    category: 'social_engineering',
    severity: 'HIGH',
    shortDescription: 'Manipulating cognitive biases like fear, authority, and urgency to suppress rational scrutiny.',
    whatItMeans: 'Social engineering targets human psychology rather than software code. Attackers manufacture artificial pressure, threatening immediate loss, legal consequences, or missed opportunities if the victim doesn\'t act in minutes.',
    whyItMatters: 'High stress suppresses critical thinking and situational awareness. When people believe their account will be permanently deleted within 1 hour, they rush to click without inspecting links.',
    howAttackersUseIt: 'Crafting subject lines like "URGENT: Your account will be closed in 24 hours" or "Final Notice: Legal action filed against you".',
    realisticExample: 'An email claiming to be from the company CEO: "I am in an executive meeting and need you to urgently buy 5 Apple Gift Cards for clients and send me the codes before 2 PM."',
    howToProtect: [
      'Establish a personal policy: whenever an email demands immediate urgency, pause for 5 minutes.',
      'Verify the request out-of-band using an alternate, verified communication channel (phone call or in-person).',
      'Remember that legitimate organizations do not terminate accounts or demand gift card payments under 2-hour deadlines.'
    ]
  },
  {
    id: 'threat-otp-theft',
    name: 'Real-Time OTP / 2FA Interception',
    category: 'credential_theft',
    severity: 'CRITICAL',
    shortDescription: 'Man-in-the-middle phishing kits stealing one-time SMS or authenticator passcodes as they are generated.',
    whatItMeans: 'Two-Factor Authentication (2FA) codes sent via SMS or authenticator apps are temporary 6-digit tokens. Reverse-proxy phishing kits (like Evilginx) relay the user\'s real OTP directly to the legitimate server to obtain an active session cookie.',
    whyItMatters: 'Having 2FA enabled is crucial, but OTP codes typed into phishing pages allow attackers to bypass standard SMS or TOTP protections.',
    howAttackersUseIt: 'The phishing page first prompts for username and password. While the victim waits, the automated backend submits the credentials to the real service, triggering an OTP SMS. The phishing page immediately prompts: "Enter the 6-digit code sent to your phone".',
    realisticExample: 'A fraudster calls posing as your bank\'s fraud division: "We blocked a fraud attempt. We just sent a verification code to your phone to confirm your identity—please read that code back to me now."',
    howToProtect: [
      'Never read or type an OTP code into any form unless you initiated the action directly on the authentic site.',
      'Bank reps will NEVER ask you to tell them an incoming one-time passcode over the phone.',
      'Upgrade to FIDO2 / Passkeys / hardware security keys, which are mathematically bound to the domain and cannot be stolen by phishing proxies.'
    ]
  },
  {
    id: 'threat-url-shorteners',
    name: 'URL Shortener Cloaking & Redirect Chains',
    category: 'url_manipulation',
    severity: 'MEDIUM',
    shortDescription: 'Using link shortening services (bit.ly, tinyurl) to obscure malicious destinations.',
    whatItMeans: 'Link shorteners convert long web addresses into compact aliases. While convenient for social media, attackers use them as cloaking layers so users and email scanners cannot see the destination domain before clicking.',
    whyItMatters: 'Security scanners and human eyes cannot evaluate the safety of the true landing page until the redirect chain is expanded.',
    howAttackersUseIt: 'Phishers route victim clicks through multiple sequential redirects (Shortener -> Free hosting redirector -> Phishing page) to evade automated domain blacklists.',
    realisticExample: 'An email reads: "Your shipment is delayed. Track package: bit.ly/3x8AbCd". The short link redirects to a credential harvester hosted on an unmanaged server.',
    howToProtect: [
      'Use URL expansion utilities to preview the destination behind short links before opening them.',
      'Most link shorteners allow adding a "+" to the end of the URL (e.g., bit.ly/example+) to view the preview analytics page without navigating to the destination.'
    ]
  },
  {
    id: 'threat-punycode-homoglyph',
    name: 'Homoglyph & Punycode (IDN) Spoofing',
    category: 'url_manipulation',
    severity: 'HIGH',
    shortDescription: 'Using visually identical foreign alphabet characters (Cyrillic, Greek) to clone domain names.',
    whatItMeans: 'The Internationalized Domain Name (IDN) standard allows non-Latin scripts. Attackers register domains containing characters from the Cyrillic or Greek alphabets that look 100% indistinguishable from Latin characters (e.g., Cyrillic "а" U+0430 vs Latin "a" U+0061).',
    whyItMatters: 'To the naked eye on high-resolution screens, the domain looks identical to the real brand name, completely evading visual inspection.',
    howAttackersUseIt: 'The domain "apple.com" registered with a Cyrillic "а" resolves to the Punycode string "xn--pple-43d.com". Modern browsers attempt to display Punycode, but some interfaces may still render the deceptive glyph.',
    realisticExample: 'A link displayed as "google.com" actually resolves to "xn--gogle-1qa.com", an attacker-hosted credential harvester.',
    howToProtect: [
      'Inspect the URL bar to see if the browser exposes the "xn--" Punycode prefix.',
      'Rely on password managers that match domains using canonical Punycode strings rather than visual character shapes.'
    ]
  },
  {
    id: 'threat-insecure-protocols',
    name: 'Insecure HTTP vs Deceptive HTTPS',
    category: 'infrastructure',
    severity: 'MEDIUM',
    shortDescription: 'Understanding the limits of SSL/TLS padlock icons and the dangers of unencrypted HTTP.',
    whatItMeans: 'HTTP sends web data in clear plaintext over public Wi-Fi networks. HTTPS encrypts traffic between your browser and the server. However, an HTTPS padlock ONLY confirms an encrypted pipe—it does NOT mean the server owner is trustworthy.',
    whyItMatters: 'Ordinary users have been trained for years to "look for the padlock". Over 80% of active phishing sites now acquire free Let\'s Encrypt SSL certificates to show the reassuring padlock icon.',
    howAttackersUseIt: 'Phishers generate automatic SSL certificates for malicious domains (e.g., https://paypal-account-verify.xyz) so the browser shows a secure padlock, lulling the user into false confidence.',
    realisticExample: 'A phishing site with a valid padlock prompts the user to enter their social security number, falsely asserting "Your information is safe because this page is HTTPS encrypted".',
    howToProtect: [
      'Treat HTTPS as the bare minimum prerequisite for privacy, never as proof of an organization\'s identity.',
      'Never input sensitive data on plain HTTP websites.',
      'Verify the domain name spelling, not merely the presence of the padlock icon.'
    ]
  }
];
