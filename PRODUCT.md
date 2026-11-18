# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally (confirmed by Dara, 2026-11-16):

- Business partners and investors. They open the link on a phone, often straight after meeting him, judge his credibility, then save his contact or message him.
- Public, press and social followers. They want to know who he is and follow his official channels.

## Product Purpose

The personal portfolio of Srey ArunRatha, Chairman & Founder. It works as a digital business card and as a public profile. Success: a first-time visitor knows who he is and what he leads within seconds, and can save his contact or reach him in one tap.

## Positioning

A personal record of one founder who chairs five ventures: Magic Iron, LBC, Vireakchun Civil, Vireakchun Police and Brand Growth. The page is signed by him: his own handwritten signature is the identity mark.

## Operating Context

This is the landing page of his Digital NFC card: a person taps the physical card with a phone and this page opens (confirmed by Dara, 2026-11-16). It is also shared as a link on Telegram and Facebook. It must work perfectly on a phone screen first. Static site: plain HTML, CSS and JavaScript, no build step, opens from `index.html`. Hosted from a Git repository.

## Capabilities and Constraints

- Handwritten signature animation that writes itself, with tap to replay. Must stay.
- Two screens only (decided by Dara, 2026-11-16): the card, then the contact page.
- Contact is the focus: phone, Telegram, Facebook, email, one tap each. The Save contact vCard download was removed at Dara's request.
- Phone number: not supplied yet; the phone key stays hidden until `phone` is set in `portfolioConfig`.
- Official channels: Telegram and Facebook have links. LinkedIn and YouTube have no link yet. Email is `office@arunratha.com`.
- Content is edited through `portfolioConfig` at the top of `js/main.js`.
- Undecided: biography, dates, milestones, and a description of each venture. None has been supplied.

## Brand Commitments

- Name: Srey ArunRatha. Title: Chairman & Founder.
- Personal statement, verbatim: "Your speech makes people trust you in a while but your character makes people trust you forever."
- Signature artwork: `assets/signature.png` (white ink, transparent ground).
- Look Dara asked for (2026-11-16): dark ground, gold that shines, 3D. Cinematic and premium. An earlier engraved-certificate direction in ink-green was built and replaced the same day.

## Evidence on Hand

- `assets/portrait.jpg`: studio portrait, 576 x 1024, lower half fades to dark navy.
- `assets/signature.png`, `assets/signature_final.png`, `assets/signature_motion.mp4`.
- `assets/company-01.jpg` to `company-04.jpg`: generic stock office and skyline photos. They do not show his companies and must not be captioned as if they do.
- Not on hand, never to be invented: biography, founding dates, company descriptions, figures, awards, testimonials, press.

## Product Principles

1. Character before claims: the page shows the man and his word, and states only confirmed facts.
2. One tap to reach him: saving the contact and messaging him are never more than one action away.
3. Phone first: the page is judged on a phone, in the first five seconds.
4. His hand is the mark: the signature is the identity, not decoration.
