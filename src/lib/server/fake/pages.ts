// keyed by the URL's href; og:image and icon paths are relative so the preview resolves them against the page
export const FAKE_PAGES: Record<string, string> = {
	'https://brand.example/': `<!doctype html><html><head>
<title>Maison Example | Home</title>
<meta property="og:title" content="Maison Example">
<meta property="og:description" content="Quiet tailoring &amp; knitwear from a small atelier.">
<meta property="og:image" content="/__test/image/brand.png">
</head><body><h1>Maison Example</h1></body></html>`,
	'https://piece.example/coat': `<!doctype html><html><head>
<title>Wool Coat – Piece Example</title>
<meta property="og:title" content="Wool Coat">
<meta property="og:image" content="/__test/image/coat.png">
</head><body><h1>Wool Coat</h1></body></html>`,
	'https://favicon.example/': `<!doctype html><html><head>
<title>Favicon Example</title>
<link rel="icon" href="/__test/image/favicon.png">
</head><body><p>Shop</p></body></html>`,
	'https://www.tiktok.com/@someone/video/1': `<!doctype html><html><head>
<meta property="og:image" content="/__test/image/brand.png">
</head><body></body></html>`,
	'https://shell.example/': `<!doctype html><html><head>
<title>App</title>
<script type="module" src="/assets/app.js"></script>
</head><body><div id="root"></div></body></html>`,
	'https://www.instagram.com/someone/': `<!doctype html><html><head>
<title>Login • Instagram</title>
</head><body><div id="react-root"></div></body></html>`,
	'https://www.instagram.com/p/Cx1/': `<!doctype html><html><head>
<title>Login • Instagram</title>
</head><body><div id="react-root"></div></body></html>`
};
