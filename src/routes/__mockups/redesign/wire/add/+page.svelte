<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import AddHead from '../list/parts/AddHead.svelte';
	import CatalogueStep from '../list/parts/CatalogueStep.svelte';
	import { dataFor } from '../list/parts/data.ts';
	import '../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const results = $derived([
		{ title: 'Kintsugi Summer', by: 'Juno Ashby', year: 2019 },
		{ title: 'Blue Hour Sessions', by: 'Marlene Okafor', year: 2021, exists: true },
		{ title: 'Kintsugi Summer (Deluxe)', by: 'Juno Ashby', year: 2020, cover: false },
		...(fx.worst
			? [
					{ title: '東京の夜に流れる静かな歌 〜 完全版 〜', by: '宮崎 駿・ジョン・ジェイコブ・ジングルハイマー・シュミット', year: 2023 },
					{ title: 'كتاب الحكايات القديمة والأسرار المنسية في مدينة الملح', by: 'عبد الرحمن منيف', year: 1984 }
				]
			: [])
	]);
</script>

<svelte:head><title>Add album, search (wireframe)</title></svelte:head>

<Frame world="music" section="music" plus="inert">
	<AddHead domain="music" list="Albums" word="album" lede="Search the catalogue, or add it by hand." />
	<div class="screen-body" data-settle>
		<CatalogueStep noun="album" query="kintsugi" {results} />
	</div>
</Frame>
