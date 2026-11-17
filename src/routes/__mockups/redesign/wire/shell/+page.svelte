<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import type { Section } from '../../fixtures.ts';
	import { link, sectionLink, sections } from './data.ts';
	import Head from './Head.svelte';
	import Icon from './Icon.svelte';
	import PhoneBar from './PhoneBar.svelte';
	import PlusSheet from './PlusSheet.svelte';
	import Posture from './Posture.svelte';
	import Specimen from './Specimen.svelte';

	const worst = $derived(page.url.searchParams.get('data') === 'worst');
	const current: { label: string; section: Section }[] = [
		{ label: 'Home', section: 'home' },
		{ label: 'Music', section: 'music' },
		{ label: 'Animanga', section: 'animanga' },
		{ label: 'Books', section: 'books' },
		{ label: 'Fashion', section: 'fashion' }
	];
	const top: { label: string; section: Section | 'settings' }[] = [
		{ label: 'Home is current', section: 'home' },
		{ label: 'Fashion is current (its lists, entries and add pages too)', section: 'fashion' },
		{ label: 'Collections is current', section: 'collections' },
		{ label: 'Settings is current, no section marked', section: 'settings' }
	];
</script>

<svelte:head><title>Shell · wireframe</title></svelte:head>

<Frame world="home" section="home">
	<div class="fw-page">
		<Head kicker={['Wireframe', 'Shell']} lede="The desktop top bar, the phone bar and the posture switch between them. Resize the window to see the live frame switch." >
			{#snippet title()}Navigation{/snippet}
		</Head>

		<div class="fw-states">
			<h2>Phone bar</h2>
			<Specimen label="320 px: five pills and the round + (R2)" note="Left: names under the icons do not fit, 'Animanga' is cut. Right: the icon-only fallback, names kept as accessible names. Targets stay 44 px or more.">
				<div class="row">
					<div class="device" style="--w: 320px"><PhoneBar current="home" {worst} fit="labels" name="Phone bar example" inline /></div>
					<div class="device" style="--w: 320px"><PhoneBar current="home" {worst} fit="icons" name="Phone bar example" inline /></div>
				</div>
			</Specimen>
			<Specimen label="375 and 390 px: icon above name" note="The current section is the charcoal pill; Collections and Settings mark Home.">
				<div class="row">
					<div class="device" style="--w: 375px"><PhoneBar current="home" {worst} name="Phone bar example" inline /></div>
					<div class="device" style="--w: 390px"><PhoneBar current="animanga" {worst} name="Phone bar example" inline /></div>
				</div>
			</Specimen>
			<Specimen label="Current section" note="One charcoal pill; names never rely on colour alone (the pill also carries aria-current).">
				<div class="row">
					{#each current as c (c.section)}
						<div class="device" style="--w: 375px"><PhoneBar current={c.section} {worst} name="Phone bar example" inline /></div>
					{/each}
					<div class="device" style="--w: 375px"><PhoneBar current="collections" {worst} name="Phone bar example" inline /></div>
				</div>
			</Specimen>
			<Specimen label="Hidden while a field has focus" note="Left: the bar is hidden and inert while Title is focused, the soft keyboard gets the room. Right: it comes back on blur.">
				<div class="row">
					<div class="device typing" style="--w: 375px">
						<label class="fw-field"><span>Title</span><input type="text" class="focused" value="The Salt Clock" aria-label="Title (focused)" /></label>
						<PhoneBar current="home" {worst} hidden name="Phone bar example" inline />
						<div class="keys" aria-hidden="true">Keyboard</div>
					</div>
					<div class="device typing" style="--w: 375px">
						<label class="fw-field"><span>Title</span><input type="text" value="The Salt Clock" aria-label="Title (blurred)" /></label>
						<PhoneBar current="home" {worst} name="Phone bar example" inline />
					</div>
				</div>
			</Specimen>
			<Specimen label="The + on a form is inert" note="On Add and Edit pages the + stays in place, dimmed, aria-disabled, and opens nothing.">
				<div class="row">
					<div class="device" style="--w: 375px"><PhoneBar current="fashion" {worst} plus="inert" name="Phone bar example" inline /></div>
				</div>
			</Specimen>

			<h2>The + type sheet</h2>
			<Specimen label="On Home, Collections and Settings: every type, grouped by domain" note="Each type opens its add page. Closes on Escape, an outside tap and Back; focus returns to the +.">
				<div class="sheets"><PlusSheet scope="all" inline /></div>
			</Specimen>
			<Specimen label="Inside Fashion: its five types" note="Brand or shop is one item. The sheet is titled for the domain; the other domains show only their own types (Music: Album, Artist, Song; Animanga: Anime, Manga; Books: Book).">
				<div class="sheets"><PlusSheet scope="fashion" inline /></div>
			</Specimen>
			<Specimen label="On Wardrobe: Piece starts as Owned" note="Same Fashion sheet; the Piece item opens the add form with status Owned.">
				<div class="sheets"><PlusSheet scope="fashion" list="wardrobe" inline /></div>
			</Specimen>
			<Specimen label="Inside Music, one more example" note="A domain with three types; the group heading is dropped because the title already names it.">
				<div class="sheets"><PlusSheet scope="music" inline /></div>
			</Specimen>

			<h2>Desktop top bar</h2>
			<Specimen label="1024 px and up: brand, six sections, Settings" note="A glass capsule with the charcoal pill on the current section; Settings is a round icon button, charcoal when current.">
				<div class="tops">
					{#each top as t (t.label)}
						<div class="scroller">
							<div class="topbar">
								<span class="brand"><span class="brand-mark" aria-hidden="true">C</span><span class="brand-name">Creative Archive</span></span>
								<nav class="app-nav" aria-label={t.label}>
									<ul>
										{#each sections as s (s.id)}<li><a href={sectionLink(s, worst)} aria-current={s.id === t.section ? 'page' : undefined}>{s.label}</a></li>{/each}
									</ul>
								</nav>
								<span class="fw-icon" aria-current={t.section === 'settings' ? 'page' : undefined}><Icon name="settings" size={20} /></span>
							</div>
							<p class="fw-note">{t.label}</p>
						</div>
					{/each}
				</div>
			</Specimen>

			<h2>Posture switch</h2>
			<Specimen label="Where the top bar gives way to the phone bar" note="A: switch at 1024 px (today's value). B: switch at 768 px. Between 768 and 1099 px the fingerprint puts the nav on its own row. Live: add ?posture=768 to the address to try B.">
				<div class="matrix">
					<div class="choice">
						<h3>A: switch at 1024 px</h3>
						<Posture width={768} switchAt={1024} /><Posture width={1024} switchAt={1024} /><Posture width={1280} switchAt={1024} />
						<p class="fw-note">Tablets in portrait (768 to 1023) get the phone bar with its thumb reach; 1024 uses the tablet top bar.</p>
					</div>
					<div class="choice">
						<h3>B: switch at 768 px</h3>
						<Posture width={768} switchAt={768} /><Posture width={1024} switchAt={768} /><Posture width={1280} switchAt={768} />
						<p class="fw-note">Portrait tablets get the top bar with the nav on its own row; only phones get the bottom bar. One breakpoint fewer than today.</p>
					</div>
				</div>
				<p class="fw-note"><a class="fw-chip" href={link('wire/shell', worst, 'posture=768')}>Preview B live</a> <a class="fw-chip" href={link('wire/shell', worst)}>Back to A</a></p>
			</Specimen>
		</div>
	</div>
</Frame>

<style>
	.sheets { max-inline-size: 32rem; }
	.row { display: flex; flex-wrap: wrap; gap: var(--space-5); overflow-x: auto; padding-block-end: var(--space-2); }
	.device { flex: none; inline-size: var(--w); padding: var(--space-3); border-radius: var(--radius-panel); background: var(--surface-sunken); box-shadow: var(--ring-hairline); }
	.typing { display: grid; gap: var(--space-3); align-content: start; min-block-size: 14rem; }
	.fw-field { display: grid; gap: var(--space-1); font-size: var(--type-label-size); font-weight: var(--type-label-weight); }
	.fw-field input { min-block-size: max(var(--control-height), var(--target)); padding-inline: var(--space-4); border: 0; border-radius: var(--radius-control); background: var(--surface-raised); box-shadow: var(--ring-control); font-family: var(--font-ui); font-size: var(--type-body-size); }
	.fw-field input.focused { box-shadow: var(--focus-halo); }
	.keys { display: grid; place-items: center; min-block-size: 6rem; margin-block-start: auto; border-radius: var(--radius-panel); background: var(--surface-plate-2); color: var(--ink-secondary); font-size: var(--type-caption-size); }
	.tops { display: grid; gap: var(--space-4); }
	.scroller { overflow-x: auto; display: grid; gap: var(--space-1); padding-block-end: var(--space-2); }
	.topbar { display: flex; align-items: center; justify-content: space-between; gap: var(--space-5); min-inline-size: 62rem; padding: var(--space-3) var(--space-5); border-radius: var(--radius-panel); background: var(--surface-frame-strong); box-shadow: var(--ring-hairline); }
	.topbar :global(.app-nav) { justify-self: auto; }
	.matrix { display: grid; gap: var(--space-6); }
	.choice { display: grid; gap: var(--space-3); align-content: start; }
	.choice h3 { font-size: var(--type-title-size); font-weight: var(--type-title-weight); }
	@media (max-width: 480px) {
		.device { zoom: 0.84; }
	}
	@media (min-width: 768px) {
		.matrix { grid-template-columns: 1fr 1fr; }
	}
</style>
