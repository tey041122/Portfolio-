# Srey ArunRatha — Premium Personal Portfolio Website
### Executive Chairman & Founder Portfolio

A complete, production-grade, responsive HTML5 executive portfolio website designed with an aesthetic of **Luxury Executive Minimalism and Modern Cinematic Personal Branding**, crafted specifically for Chairman & Founder **Srey ArunRatha**.

The website faithfully recreates the single-screen mobile reference composition (designed for 390px–430px viewports first, adapting elegantly to desktop screens) and works immediately by opening `index.html` directly in any web browser without requiring a server or build step.

---

## 1. Directory Structure

```text
personal-portfolio/
│
├── index.html                  # Main semantic HTML5 website (single-screen hero card)
│
├── css/
│   └── style.css               # Complete luxury design system & responsive stylesheet
│
├── js/
│   └── main.js                 # Central editable configuration, interactive modal & vCard generator
│
├── assets/
│   ├── portrait.jpg            # Clean, high-resolution replaceable executive portrait
│   ├── signature.png           # Transparent stacked cursive signature PNG (with text fallback)
│   └── favicon.png             # Luxury gold SAR monogram favicon seal
│
└── README.md                   # Complete documentation & customization guide
```

---

## 2. Replaceable Background Portrait (CRITICAL)

The hero portrait photograph is **completely separate** from the website layout, typography, buttons, decorations, and icons.

### Option A: Direct File Drop (Zero Code Change)
1. Prepare any executive photograph (`.jpg` format).
2. Save or replace it as:
   ```text
   assets/portrait.jpg
   ```
3. Refresh your browser. The new photograph displays automatically without touching HTML, CSS, or JavaScript.

### Option B: Using PNG or WebP / Different Filename
If your new portrait is named differently (e.g., `assets/my-new-portrait.webp`):
Open `js/main.js` and update the central configuration:
```javascript
images: {
  portrait: "assets/my-new-portrait.webp",
  signature: "assets/signature.png"
}
```
Or in `css/style.css` at line 14:
```css
:root {
  --portrait-image: url("../assets/my-new-portrait.webp");
  --portrait-position: center top; /* Adjust face placement if needed */
}
```

### Configurable Face Placement
To adjust the position of the subject's face (e.g. centering lower or higher), simply adjust `--portrait-position` in `css/style.css`:
```css
:root {
  --portrait-position: center 10%; /* Move up/down as needed */
}
```

---

## 3. Central Configuration Guide (`js/main.js`)

All personal details, position titles, taglines, image assets, and social channels are managed in the `portfolioConfig` object at the top of `js/main.js`:

```javascript
const portfolioConfig = {
  name: "Srey ArunRatha",
  position: "CHAIRMAN & FOUNDER",

  tagline:
    "Driving business growth, developing people, and creating lasting impact.",

  images: {
    portrait: "assets/portrait.jpg",
    signature: "assets/signature.png"
  },

  // Optional external link for 'Explore My Journey' (e.g. LinkedIn, Bio, or CV URL).
  // If left empty (""), tapping the button opens the executive profile drawer.
  journeyUrl: "",

  social: {
    telegram: "",                 // Paste: "https://t.me/your_username"
    linkedin: "",                 // Paste: "https://www.linkedin.com/in/your_profile"
    facebook: "",                 // Paste: "https://www.facebook.com/your_page"
    youtube: "",                  // Paste: "https://www.youtube.com/@your_channel"
    email: "office@arunratha.com" // Executive office email
  },

  office: {
    locations: "Phnom Penh • Singapore • Bangkok • London",
    role: "Chairman & Founder"
  }
};
```

---

## 4. Interactive Components

1. **Explore My Journey →**:
   - If `portfolioConfig.journeyUrl` is provided, opens that URL in a new tab.
   - If empty, opens the sleek executive profile overlay drawer.
2. **Get in Touch**:
   - Launches direct email to `portfolioConfig.social.email`, or opens the executive contact drawer.
3. **Hamburger Menu**:
   - Opens the luxury executive overlay drawer with executive bio, direct contact options, vCard download, and social links.
4. **Social Links**:
   - 5 circular gold-outlined icons: Telegram, LinkedIn, Facebook, YouTube, Email.
   - If a URL is empty, displays a courteous executive toast rather than navigating to a broken destination.
5. **vCard (.vcf) Generation**:
   - Includes full executive contact information ready to import directly into Apple Contacts, Google Contacts, or Microsoft Outlook.

---

## 5. Local Testing Instructions

1. Double-click `index.html` in your file explorer to open directly in any modern browser (Chrome, Edge, Safari, Firefox).
2. No Node.js, Webpack, or local server installation is required.
3. To view in mobile mode on desktop, press `F12` to open Developer Tools and toggle the Device Toolbar (`Ctrl + Shift + M`), selecting iPhone 12/13/14 or Galaxy S20.

---

## 6. Sharing on Local Wi-Fi (Same Network)

To view the website on your smartphone, tablet, or another computer connected to the same Wi-Fi:

1. Double-click **`Start-Local-Server.bat`** in the portfolio folder.
2. Share this internal URL with anyone connected to the same Wi-Fi:
   ```text
   http://192.168.100.142:5500
   ```
3. Open that link in the browser on your phone or tablet to view the live website in real time.
4. *Tip:* If devices on the Wi-Fi cannot connect, make sure your Windows Wi-Fi network profile is set to **Private** (Windows Settings → Network & Internet → Wi-Fi → your network name → choose **Private network**).
