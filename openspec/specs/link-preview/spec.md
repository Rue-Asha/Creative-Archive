# link-preview Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Safe page fetch
Every server-side fetch of a user-supplied URL (preview pages, preview images, cover and photo downloads) SHALL go
through `safeFetch`: only `http:` and `https:`; the host is resolved by the server and refused when any address is
loopback, private, link-local, CGNAT, unspecified, multicast or unique-local (IPv4, IPv6 and IPv4-mapped IPv6) or the
name is `localhost`; the connection uses only the checked address; at most 3 redirects, each re-checked; abort after
5 s; reading stops at the size cap (1 MB for pages, parsed from what arrived; 16 MB for images, where exceeding fails).
Unit tests reach a local `node:http` server bound to `127.0.0.2` by exempting exactly that address (`allowAddresses`).

#### Scenario: Only http and https URLs are fetched
- **WHEN** `safeFetch` gets `ftp://example.com/`, `file:///etc/passwd`, `javascript:alert(1)` and `not a url`
- **THEN** each throws `FetchError` with code `scheme` or `invalid-url` and no connection is made
- **proof:** unit

#### Scenario: Loopback and private addresses are refused
- **WHEN** `safeFetch` gets `http://127.0.0.1/`, `http://localhost/`, `http://[::1]/`, `http://10.0.0.5/`, `http://172.16.0.1/`, `http://192.168.1.10/`, `http://169.254.169.254/`, `http://100.64.0.1/`, `http://0.0.0.0/`, `http://[fd00::1]/`, `http://[fe80::1]/` and `http://[::ffff:127.0.0.1]/`
- **THEN** each throws `FetchError('private-address')` and no connection is made
- **proof:** unit

#### Scenario: Hostname resolving to a private address is refused
- **WHEN** `safeFetch` gets `http://intranet.example/` and the injected lookup answers `10.1.2.3`
- **THEN** it throws `FetchError('private-address')`
- **proof:** unit

#### Scenario: Redirect to a private address is refused
- **WHEN** an allowed test server answers `302 Location: http://127.0.0.1/admin`
- **THEN** `safeFetch` throws `FetchError('private-address')` without requesting the redirect target
- **proof:** unit

#### Scenario: Too many redirects fail
- **WHEN** an allowed test server redirects four times in a row
- **THEN** `safeFetch` throws `FetchError('redirects')`
- **proof:** unit

#### Scenario: Slow page times out after 5 seconds
- **WHEN** an allowed test server sends headers and then stalls
- **THEN** `safeFetch` throws `FetchError('timeout')` after about 5 s
- **proof:** unit

#### Scenario: Oversized page is cut at 1 MB
- **WHEN** an allowed test server streams a 3 MB page with its `og:title` in the first kilobyte and `truncate: true`, `maxBytes: 1 MB`
- **THEN** `safeFetch` returns exactly 1 MB of body and stops reading
- **proof:** unit

#### Scenario: Oversized image fails
- **WHEN** an allowed test server streams 17 MB to an image fetch with `maxBytes: 16 MB`
- **THEN** `safeFetch` throws `FetchError('too-large')`
- **proof:** unit

### Requirement: Open Graph preview
For Brand, Shop/Site, Influencer, Magazine and Piece, pasting a URL SHALL fetch the page and read `og:title`,
`og:image` and `og:description`, falling back to `<title>` for the title and to the page's icon for the image,
resolving relative URLs against the page URL. A found image SHALL be downloaded and converted to WebP at once and
shown in the form; a found title SHALL fill an empty name field; the description fills an empty description field;
the pasted URL fills an empty URL field of the entry (brand, site, piece). When the page is
blocked, a JS-only shell, a login wall or has no image, the form SHALL stay usable with "No preview found" and manual
upload. An invalid URL SHALL show an inline error.

#### Scenario: Open Graph tags fill the preview
- **WHEN** `parsePreview` reads a page with `og:title`, `og:image` and `og:description`
- **THEN** it returns those three values with entities decoded
- **proof:** unit

#### Scenario: Page without Open Graph falls back to title and icon
- **WHEN** `parsePreview` reads a page with only `<title>Shop</title>` and `<link rel="icon" href="/fav.png">` at `https://shop.example/a/b`
- **THEN** it returns title "Shop" and image `https://shop.example/fav.png`
- **proof:** unit

#### Scenario: Relative og:image resolves against the page URL
- **WHEN** `parsePreview` reads `og:image` "../img/x.jpg" on `https://brand.example/a/b/`
- **THEN** the image URL is `https://brand.example/a/img/x.jpg`
- **proof:** unit

#### Scenario: Page with nothing usable has no preview
- **WHEN** `parsePreview` reads `<div id="root"></div>` with no title and no icon
- **THEN** title, description and image are null
- **proof:** unit

#### Scenario: Paste a brand URL and get its preview image
- **WHEN** `https://brand.example/` is pasted on `/add/brand` and the preview loads
- **THEN** the form shows the preview image, the name "Maison Example" and the description, and after Save the detail image `src` is `/images/<id>`
- **proof:** e2e

#### Scenario: Piece URL preview fills name and image
- **WHEN** `https://piece.example/coat` is pasted on `/add/piece`
- **THEN** the name field reads "Wool Coat" and the preview image shows
- **proof:** e2e

#### Scenario: Icon is used when there is no og:image
- **WHEN** `https://favicon.example/` is pasted on `/add/site`
- **THEN** the preview image shows (from the page icon) and no "No preview found" note appears
- **proof:** e2e

#### Scenario: Blocked site keeps the form usable
- **WHEN** `https://blocked.example/` is pasted on `/add/brand`
- **THEN** "No preview found" shows, the URL stays in its field, and a name plus an uploaded image can be saved
- **proof:** e2e

#### Scenario: JS-only shell shows No preview found
- **WHEN** `https://shell.example/` is pasted on `/add/site`
- **THEN** "No preview found" shows and the form stays usable
- **proof:** e2e

#### Scenario: Login wall shows No preview found
- **WHEN** `https://www.instagram.com/someone/` is pasted on `/add/influencer`
- **THEN** "No preview found" shows, the form stays usable and an avatar can be uploaded and saved
- **proof:** e2e

#### Scenario: Existing name is not overwritten by the preview
- **WHEN** the name "My Label" is typed first and then `https://brand.example/` is pasted
- **THEN** the name stays "My Label" and the preview image shows
- **proof:** e2e

#### Scenario: Pasted preview URL fills an empty URL field
- **WHEN** `https://brand.example/` is pasted into the preview field on `/add/brand` while the URL field is empty
- **THEN** the URL field reads `https://brand.example/`
- **proof:** e2e

#### Scenario: A typed URL is not overwritten by the preview URL
- **WHEN** `https://mine.example/` is typed into the URL field on `/add/brand` and then `https://brand.example/` is pasted into the preview field
- **THEN** the URL field still reads `https://mine.example/`
- **proof:** e2e

#### Scenario: Invalid URL shows an inline error
- **WHEN** `brand dot com` is pasted on `/add/brand`
- **THEN** "Enter a valid http or https URL" shows at the URL field and no preview request is made
- **proof:** e2e

#### Scenario: Private address URL is refused in the form
- **WHEN** `http://127.0.0.1/` is pasted on `/add/site`
- **THEN** "No preview found" shows and the form stays usable
- **proof:** e2e

#### Scenario: Previewing a real site
- **WHEN** Rue runs `npm run dev` and pastes a real brand URL and an Instagram profile URL
- **THEN** the brand shows a preview image or "No preview found", and Instagram shows "No preview found" with upload still possible
- **proof:** manual (needs real sites over the network, which tests never reach; Gate 2)

### Requirement: Influencer handle prefill
Pasting a profile URL into the URL field of a type with a handles field (influencer, magazine) SHALL fill the matching
handle field: Instagram, TikTok and YouTube profile URLs fill that platform's handle, any other http(s) URL fills only
the website field, and post or video URLs (Instagram posts/reels, TikTok videos, YouTube videos and shorts) SHALL fill
nothing. A handle field that already holds a value SHALL NOT be overwritten. The URL preview runs as usual alongside.

#### Scenario: Profile URLs map to handles
- **WHEN** `handlesFromUrl` gets `https://www.instagram.com/someone/`, `https://instagram.com/someone`, `https://www.tiktok.com/@someone`, `https://m.youtube.com/@someone` and `https://www.youtube.com/c/someone`
- **THEN** it returns `{ instagram: 'someone' }`, `{ instagram: 'someone' }`, `{ tiktok: 'someone' }`, `{ youtube: 'someone' }` and `{ youtube: 'someone' }`
- **proof:** unit

#### Scenario: Unknown platform fills only the website
- **WHEN** `handlesFromUrl` gets `https://someone.blog/about`
- **THEN** it returns `{ website: 'https://someone.blog/about' }`
- **proof:** unit

#### Scenario: Post and video URLs give no prefill
- **WHEN** `handlesFromUrl` gets `https://www.instagram.com/p/Cx1/`, `https://www.instagram.com/reel/Cx2/`, `https://www.tiktok.com/@someone/video/123`, `https://www.youtube.com/watch?v=abc`, `https://www.youtube.com/shorts/abc` and `https://youtu.be/abc`
- **THEN** each returns null
- **proof:** unit

#### Scenario: Pasting an Instagram profile fills the handle
- **WHEN** `https://www.instagram.com/someone/` is pasted on `/add/influencer`
- **THEN** the Instagram handle field reads "someone", the other handle fields stay empty, and "No preview found" shows
- **proof:** e2e

#### Scenario: Pasting another site fills the website field
- **WHEN** `https://brand.example/` is pasted on `/add/influencer`
- **THEN** the Website field reads `https://brand.example/` and the Instagram, TikTok and YouTube fields stay empty
- **proof:** e2e

#### Scenario: A typed handle is not overwritten
- **WHEN** "mine" is typed into the Instagram handle field and then `https://www.instagram.com/someone/` is pasted
- **THEN** the Instagram handle field still reads "mine"
- **proof:** e2e

#### Scenario: Pasting a post URL fills no handle
- **WHEN** `https://www.instagram.com/p/Cx1/` is pasted on `/add/influencer`
- **THEN** every handle field, the website included, stays empty
- **proof:** e2e

#### Scenario: Pasting a profile on a magazine fills the handle
- **WHEN** `https://www.instagram.com/someone/` is pasted on `/add/magazine`
- **THEN** the Instagram handle field reads "someone", the TikTok, YouTube and Website fields stay empty, and "No preview found" shows
- **proof:** e2e

#### Scenario: Pasting a magazine's site fills name, image and website
- **WHEN** `https://brand.example/` is pasted on `/add/magazine`
- **THEN** the name field reads "Maison Example", the preview image shows, and the Website field reads `https://brand.example/` with the other handle fields empty
- **proof:** e2e

