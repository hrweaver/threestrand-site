# Cut-over: threestrand.one (or .app) becomes the site

Prepared 2026-10-08. Do this after the trademark application is filed (the site is public
use; the filing date sets priority) and after the domain is bought. One switch, about an
hour, mostly DNS waiting.

## 1. Domain (Harry)
Buy the domain. threestrand.one screened free on 2026-10-08; threestrand.app had just been
registered by someone (Namecheap nameservers), so check whose it is before assuming.

## 2. DNS at the registrar
GitHub Pages, same as anchorph.one today:

    A     @     185.199.108.153
    A     @     185.199.109.153
    A     @     185.199.110.153
    A     @     185.199.111.153
    CNAME www   hrweaver.github.io

## 3. This repo
1. `echo threestrand.one > CNAME` (the bare domain), commit, push.
2. GitHub repo Settings > Pages > Custom domain: the same domain; wait for the DNS check,
   then tick Enforce HTTPS (the certificate takes a few minutes to an hour).
3. `node build-legal.js` whenever ~/anchor-legal changes; privacy/ and terms/ are generated
   and committed here, the same as anchor-site did. index.html already links /privacy/ and
   /terms/ relatively.

## 4. anchor-site: redirect, page for page, for a long time
Branch `cutover-threestrand` in ~/anchor-site holds the redirect pages. Merge and push it
once the new domain serves. Redirected: /, /privacy/, /terms/, /pilot/. NOT redirected:
/dumb-phone/, /kids-privacy/, /kids-account-deletion/ (other products, their own names).

## 5. What does not move
- join.anchorph.one: every printed tag and card carries it, and the apps' universal-link
  entitlements name it. It keeps working under the old domain. A Threestrand join address
  is a later addition in a new build, never a replacement.
- The GitHub links to anchor-legal that both store listings carry. They keep resolving.
- support@anchorph.one until a Threestrand mailbox exists.

## 6. After the switch
- Store listings: update the marketing and support URLs with the next app version.
- Google Search Console: add the new domain, submit the sitemap, and use Change of Address
  from anchorph.one so rankings follow.
- The coffee cards print the new domain from then on (table-card-threestrand.py already
  says threestrand.one in the footer).
