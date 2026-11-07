/**
 * Security Awareness Center Curriculum
 * Comprehensive educational guides on cybersecurity, phishing prevention, and defensive hygiene.
 * Explicitly free of any quizzes or test questions.
 */

import type { AwarenessArticle } from '../types/index.ts';

export const AWARENESS_ARTICLES: AwarenessArticle[] = [
  {
    id: 'guide-anatomy-phishing',
    title: 'Anatomy of a Modern Phishing Campaign: From Lure to Breach',
    category: 'Phishing Mechanics',
    readTimeMinutes: 6,
    summary: 'A step-by-step breakdown of how cybercriminals construct phishing campaigns, from reconnaissance and domain spoofing to credential theft and session hijacking.',
    content: [
      'Phishing remains the initial access vector in over 80% of reported enterprise security breaches and identity theft cases worldwide. While early phishing consisted of misspelled mass emails from supposed overseas royals, modern phishing has evolved into an industrialized, automated discipline referred to as Phishing-as-a-Service (PaaS).',
      'Phase 1: Target Reconnaissance. Threat actors gather intelligence on organizational hierarchies, software vendors, and brand affiliations using public LinkedIn profiles, company directories, and corporate news releases.',
      'Phase 2: Infrastructure Weaponization. Attackers register lookalike domains using typosquatting techniques, configure valid MX records and DKIM signatures to evade spam filters, and provision free TLS/SSL certificates so the destination renders a reassuring browser padlock.',
      'Phase 3: Crafting the Psychological Lure. Attackers deploy pre-tested social engineering templates tailored to specific contexts—such as fake HR benefit updates, DHL shipping delays, or Microsoft 365 storage quota warnings.',
      'Phase 4: Reverse-Proxy Interception. Rather than merely saving submitted passwords to a static text file, modern phishing kits (like Evilginx3) act as real-time transparent reverse proxies. They sit between the victim and the legitimate service, relaying prompts and capturing session cookies and 2FA tokens directly.'
    ],
    keyTakeaways: [
      'Modern phishing kits look identical to legitimate portals and can bypass basic SMS two-factor authentication.',
      'Free SSL certificates mean the padlock icon indicates encrypted transit, not legitimate ownership.',
      'Spear phishing targets specific individuals with high-context, personalized details.'
    ],
    actionChecklist: [
      'Never rely on visual similarity alone to verify a portal.',
      'Verify unexpected communications through a separate, known channel before interacting.',
      'Utilize hardware security keys (FIDO2/WebAuthn) whenever possible to neutralize reverse-proxy attacks.'
    ]
  },
  {
    id: 'guide-spot-fake-websites',
    title: 'How to Spot a Fake Website: Domain Architecture and Visual Clones',
    category: 'Web Security',
    readTimeMinutes: 5,
    summary: 'Master the technical discipline of reading domain names from right to left, recognizing subdomain trickery, and identifying homoglyph deceptions.',
    content: [
      'Cloning the visual design of a legitimate website takes an attacker less than two minutes. With modern browser developer tools, any cybercriminal can download complete HTML, CSS, logos, and fonts from your bank or cloud provider.',
      'Because visual design cannot be trusted, the internet address bar is your primary defensive anchor. However, many users misread domain names due to subdomain confusion.',
      'The Right-to-Left Domain Rule: In internet naming architecture, the primary registered domain is the part immediately preceding the first single slash ("/") in the path, counting from right to left across dots until the Top-Level Domain (TLD) and Second-Level Domain (SLD).',
      'For example, in "https://login.microsoft.com.account-update.xyz/auth", casual readers see "microsoft.com" at the front. But reading from right to left reveals the real domain is "account-update.xyz". The attacker merely named their subdomain "login.microsoft.com".',
      'Watch for Non-Standard TLDs: While legitimate companies sometimes use newer TLDs, mass phishing operations heavily favor disposable extensions such as .tk, .ml, .xyz, and .top due to bulk pricing and lenient abuse enforcement.'
    ],
    keyTakeaways: [
      'Visual layout, corporate logos, and color schemes are trivially forged by attackers.',
      'Always read the hostname right to left from the first single forward slash.',
      'Pay close attention to character substitutions (e.g., lowercase "L" vs uppercase "I" or numeral "1").'
    ],
    actionChecklist: [
      'Bookmark critical portals and navigate exclusively via saved bookmarks.',
      'Do not click login links received in emails, text messages, or chat platforms.',
      'Inspect the browser address bar on mobile devices by tapping to expand the full URL.'
    ]
  },
  {
    id: 'guide-email-security-playbook',
    title: 'Email Security Playbook: Spotting Red Flags Before You Click',
    category: 'Email Defense',
    readTimeMinutes: 7,
    summary: 'A practical, field-tested checklist for triaging suspicious emails in your personal and work inboxes.',
    content: [
      'Email is inherently an unauthenticated protocol by original design. While modern standards like SPF (Sender Policy Framework), DKIM (DomainKeys Identified Mail), and DMARC (Domain-based Message Authentication) have reduced basic header spoofing, attackers constantly bypass these protections using lookalike domains or compromised legitimate accounts.',
      'Flag 1: Artificial Urgency & Ultimatums. Messages demanding immediate response under threat of account suspension, legal summons, or monetary penalty are designed to rush your judgment.',
      'Flag 2: Discrepancies Between Display Name and Actual Address. An email may say "PayPal Support" as the display name, but tapping the address header reveals the real sender is "support@service-update8291.biz".',
      'Flag 3: Suspicious Attachments and Archive Containers. Attackers often enclose malware within ZIP, RAR, ISO, or 7z files to bypass corporate gateway anti-malware scanners. An invoice or receipt should almost never require an executable or macro-enabled file.',
      'Flag 4: Generic or Misplaced Greetings. Mass campaigns rarely possess your real customer record name, often addressing recipients as "Dear Valued Customer" or "Dear Member".'
    ],
    keyTakeaways: [
      'Check the actual sender domain behind the friendly display name.',
      'Never open unexpected archive attachments (.zip, .iso) or macro-enabled documents.',
      'Urgent ultimatums are almost always social engineering levers.'
    ],
    actionChecklist: [
      'Hover over hyperlinks to verify the actual destination URL matches the anchor text.',
      'If an email claims an urgent billing error, log into the official service directly through your browser.',
      'Use the PhishShield Email Analyzer to inspect suspicious message patterns before acting.'
    ]
  },
  {
    id: 'guide-defensive-passwords',
    title: 'The Defensive Password Strategy: Passphrases, Salt, and Password Managers',
    category: 'Identity & Access',
    readTimeMinutes: 5,
    summary: 'Why complex 8-character passwords fail against modern GPU hash cracking, and how long passphrases coupled with password managers provide mathematical security.',
    content: [
      'For decades, standard security guidelines recommended 8-character passwords with a mix of capital letters, numbers, and symbols (e.g., "P@ssw0rd!"). With modern hash-cracking hardware (such as clusters of RTX 4090 GPUs), an 8-character password of mixed complexity can be brute-forced in hours to days.',
      'The Entropy Advantage of Passphrases: Length exponentially outweighs complexity in cryptographic entropy. A passphrase composed of four or five randomly chosen words (e.g., "correct-horse-battery-staple" or "sunset-orchard-cobalt-harbor") possesses over 60 bits of entropy and requires millennia to crack, while remaining easy to remember.',
      'The Cardinal Sin: Credential Reuse. The single most dangerous habit among internet users is reusing the same password across multiple websites. When a minor forum or e-commerce store experiences a data breach, cybercriminals use automated tools ("credential stuffing") to test those exact login pairs across thousands of banking, email, and social media sites.',
      'Why Password Managers Are Anti-Phishing Tools: Password managers do not just store random passwords; they link each credential to a specific domain name. If you land on a phishing page like "paypa1.com", your password manager will refuse to autofill your credentials because the domain does not match "paypal.com".'
    ],
    keyTakeaways: [
      'Password length is far more secure than arbitrary symbol substitutions.',
      'Never reuse passwords across different online services.',
      'Password managers serve as an automated defense against credential-harvesting phishing sites.'
    ],
    actionChecklist: [
      'Adopt a reputable password manager with end-to-end zero-knowledge encryption.',
      'Generate unique, high-entropy 16+ character passwords for every single service.',
      'Protect your master password manager vault with a strong passphrase and hardware 2FA.'
    ]
  },
  {
    id: 'guide-two-factor-authentication',
    title: 'Two-Factor Authentication: Authenticator Apps vs SMS vs Hardware FIDO Keys',
    category: 'Identity & Access',
    readTimeMinutes: 6,
    summary: 'Understand the hierarchy of multi-factor authentication methods and why phishing-resistant FIDO2 keys are the gold standard.',
    content: [
      'Multi-Factor Authentication (MFA) requires you to present two or more independent credentials before gaining access: something you know (password), something you have (phone/token), or something you are (biometrics). However, not all 2FA methods offer equal defense against phishing.',
      'Tier 1: SMS-Based 2FA (Weakest). SMS text codes are vulnerable to SIM-swapping attacks, where an attacker bribes or tricks a telecom representative into routing your cell phone number to a new SIM card. SMS codes can also be readily typed into reverse-proxy phishing pages.',
      'Tier 2: Time-Based One-Time Passwords / TOTP (Moderate). Authenticator apps (Google Authenticator, Microsoft Authenticator) generate 6-digit codes that rotate every 30 seconds. They are immune to SIM swapping, but can still be captured by real-time phishing kits if the user types the code into a fraudulent page.',
      'Tier 3: FIDO2 / WebAuthn Hardware Keys & Passkeys (Phishing-Resistant Gold Standard). Physical security keys (such as YubiKeys) and cryptographic Passkeys use public-key cryptography. The browser cryptographically signs the challenge with the specific origin URL. If you are on "fake-bank.com", the hardware key refuses to sign the authentication challenge for "real-bank.com".'
    ],
    keyTakeaways: [
      'Any 2FA is significantly better than no 2FA at all.',
      'SMS 2FA is susceptible to SIM-swapping and cellular interception.',
      'FIDO2 / WebAuthn Passkeys provide mathematical immunity against credential phishing.'
    ],
    actionChecklist: [
      'Upgrade accounts from SMS 2FA to an Authenticator App (TOTP) wherever supported.',
      'Enable Passkeys or FIDO2 hardware security keys for critical identity accounts (email, cloud, banking).',
      'Keep backup emergency recovery codes stored offline in a secure, fireproof location.'
    ]
  },
  {
    id: 'guide-otp-stealing-epidemic',
    title: 'The OTP Stealing Epidemic: How Attackers Bypass Multi-Factor Verification',
    category: 'Threat Analysis',
    readTimeMinutes: 5,
    summary: 'A breakdown of modern OTP-stealing techniques, automated voice bots (vishing), and man-in-the-middle reverse proxies.',
    content: [
      'One of the most rapidly growing cybercrime vectors involves the theft of One-Time Passcodes (OTPs). Many internet users mistakenly believe that enabling 2FA makes their accounts untouchable. Cybercriminals have developed systematic workflows to harvest these tokens.',
      'Method 1: Automated Vishing Bots (Voice Phishing). An attacker who already has your email and password triggers a legitimate password-reset request on your bank account. Simultaneously, an automated voice bot calls your phone spoofing your bank\'s caller ID: "Security Alert: An unauthorized transaction of $520 was blocked. To reject this transaction, please enter the 6-digit code sent to your mobile device now." The bot captures your keypad input and feeds it into the bank\'s reset prompt in real time.',
      'Method 2: Reverse Proxy Phishing Kits. Deployed on lookalike domains, these proxies pass HTTP requests back and forth between the victim and the genuine login service. When the genuine server sends an OTP challenge, the proxy displays it to the victim, waits for them to type the code, and immediately logs into the genuine session, stealing the authenticated session cookie.',
      'The Universal Rule of OTPs: An OTP is a one-time secret key. No legitimate customer service representative or automated fraud system will ever require you to tell or give an incoming verification code back to them.'
    ],
    keyTakeaways: [
      'Never read or enter an OTP code on an inbound phone call, regardless of caller ID.',
      'OTP codes are meant solely for self-initiated logins on the official website or mobile app.',
      'Session cookies stolen via reverse proxies allow attackers to bypass 2FA entirely.'
    ],
    actionChecklist: [
      'If you receive an unexpected OTP SMS, treat it as evidence that your password may be known to an attacker.',
      'Immediately log in through the official app and change your account password.',
      'Hang up immediately on any phone call asking for a verification or security code.'
    ]
  },
  {
    id: 'guide-social-engineering-psychology',
    title: 'Psychology of Social Engineering: Urgency, Fear, and Authority Exploits',
    category: 'Psychological Defense',
    readTimeMinutes: 6,
    summary: 'Explore the cognitive vulnerabilities that social engineers exploit and how to build mental firewalls against manipulative communications.',
    content: [
      'Cybersecurity is fundamentally a human discipline. You can deploy billion-dollar firewalls, but if a trusted employee or user is manipulated into clicking a malicious link, the perimeter is breached.',
      'The Brain\'s System 1 vs. System 2: Human cognition operates on two modes. System 1 is fast, instinctive, and emotional; System 2 is slow, deliberate, and logical. Social engineering attacks are explicitly engineered to trigger System 1 emotional spikes—panic, greed, curiosity, or deference to authority—preventing the slower analytical System 2 from evaluating the scenario.',
      'The Authority Vector: Posing as a company CEO, managing director, legal officer, or government regulator (e.g., IRS, FBI, Police) creates a psychological reluctance to question or disobey the request.',
      'The Scarcity & Opportunity Vector: Promising limited-time crypto yields, lottery distributions, or exclusive bonuses urges the victim to act quickly before thinking through the logistics.',
      'The Helpful Impersonator: Attackers pose as IT Helpdesk personnel offering to "assist" you with a system migration or error. Because humans naturally appreciate helpful behavior, victims willingly surrender access credentials.'
    ],
    keyTakeaways: [
      'Social engineers target cognitive biases rather than technical vulnerabilities.',
      'High emotional arousal (panic, fear, greed) is the primary hallmark of a social engineering lure.',
      'Authority figures in high-risk scenarios should always be verified out-of-band.'
    ],
    actionChecklist: [
      'Introduce a mandatory pause: when an urgent message arrives, wait 3 minutes before taking any digital action.',
      'Confirm sensitive financial or credential requests via a known phone number or in-person check.',
      'Normalize constructive skepticism in your workplace and personal communication.'
    ]
  },
  {
    id: 'guide-incident-response-individual',
    title: 'Incident Response for Individuals: What To Do in the First 10 Minutes After Clicking a Suspicious Link',
    category: 'Incident Response',
    readTimeMinutes: 7,
    summary: 'A triage guide detailing immediate steps to contain damage, secure accounts, and revoke unauthorized access after an accidental click.',
    content: [
      'Even seasoned cybersecurity professionals occasionally click a well-crafted phishing link. The differentiator between an inconvenience and a catastrophic breach is the speed and discipline of your response in the first 10 minutes.',
      'Minute 0–2: Disconnect and Assess. If you downloaded a file or suspect malware execution, immediately disconnect your device from the internet (unplug ethernet, turn off Wi-Fi). This halts active command-and-control communication and data exfiltration.',
      'Minute 2–5: Password Containment (from a Separate, Clean Device). If you typed credentials into a phishing page, do NOT attempt to change passwords from the compromised device. Using a separate, clean device (such as your smartphone on cellular data), immediately log into the legitimate service and update your password.',
      'Minute 5–8: Terminate Active Sessions. In your account security settings (Google, Microsoft, Apple, Banking), choose "Log out of all other sessions" or "Revoke all active devices". This invalidates any session cookies stolen by reverse-proxy phishing kits.',
      'Minute 8–10: Review Account Rules & Recovery Options. Attackers often establish covert persistence by adding their phone number as a backup, creating email forwarding rules to secretly copy your correspondence, or generating OAuth app authorizations. Inspect your email rules and authorized third-party apps.',
      'Follow-Up: Notify relevant parties. If this involved a work machine or corporate account, report it immediately to your organization\'s Security Operations Center (SOC). Swift reporting allows defenders to isolate tokens before lateral movement occurs.'
    ],
    keyTakeaways: [
      'Speed of response in the first 10 minutes drastically limits credential exploitation.',
      'Always revoke all active sessions after changing a compromised password.',
      'Check for hidden persistence mechanisms like unauthorized email forwarding rules.'
    ],
    actionChecklist: [
      'Change compromised credentials immediately from a known uncompromised device.',
      'Revoke active sessions and review multi-factor authentication devices.',
      'Scan the endpoint with updated antivirus/EDR software if files were downloaded.',
      'Monitor financial statements and credit reports for suspicious unauthorized activities.'
    ]
  }
];
