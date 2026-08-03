# GlowLine

Marketing + quote-request website for GlowLine's photoluminescent medical wire wraps. Static HTML/CSS/JS — no build step, no framework.

## Structure

```
index.html      Home
product.html    Product details, how it works, manufacturing, pricing
team.html       Founders, mission, timeline, market opportunity
contact.html    Contact info + "Request a Quote" form
css/style.css   All styles (brand colors, fonts, layout)
js/main.js      Mobile nav toggle + hero day/night image toggle
images/         Logos, team photos, product photos (see Brand Identity folder for source files)
```

## Before going live

1. **Quote form email** — `contact.html` posts to [FormSubmit.co](https://formsubmit.co), a free form-to-email service that needs no account. Replace `info@glowline.com` in the form's `action` attribute with your real inbox. Submit the form once from the live site and FormSubmit will email that address an activation link — click it to start receiving submissions.
2. **Contact info** — swap the placeholder email, phone, and Instagram handle (search for `info@glowline.com`, `(555) 010-0100`, `GLOWLINEcares` across the HTML files).
3. **Domain** — if you buy a real domain, point it at GitHub Pages (see below) or your host of choice.

## Preview locally

```bash
cd website
python3 -m http.server 4173
```

Then open http://localhost:4173.

## Deploy to GitHub Pages

1. Push this repo to GitHub (already connected to `ianlh0307-max/GlowLine`).
2. In the repo settings → Pages, set the source to the branch/folder containing this site (e.g. `main` / `/website` or `/root` if this folder is the repo root).
3. GitHub will publish at `https://<username>.github.io/<repo>/`.

## Editing content

Everything is plain HTML — open any `.html` file and edit text directly. Shared header/footer markup is duplicated across the four pages (no templating), so repeat any nav/footer change in all four files.
