<script lang="ts">
	// A laptop with a phone overlapping its lower corner, drawn in plain CSS.
	// Both screens are real screenshots passed in by the caller; nothing here
	// is decorative art, and nothing needs JS to show.
	type Shot = { src: string; width: number; height: number; alt: string };
	let { desktop, mobile }: { desktop: Shot; mobile: Shot } = $props();
</script>

<div class="devices">
	<div class="laptop">
		<div class="lid">
			<img
				src={desktop.src}
				width={desktop.width}
				height={desktop.height}
				alt={desktop.alt}
				loading="lazy"
				decoding="async"
			/>
		</div>
		<div class="base" aria-hidden="true"></div>
	</div>
	<div class="phone">
		<img
			src={mobile.src}
			width={mobile.width}
			height={mobile.height}
			alt={mobile.alt}
			loading="lazy"
			decoding="async"
		/>
	</div>
</div>

<style>
	.devices {
		position: relative;
		/* room on the right so the phone can overhang the laptop corner */
		padding-right: 12%;
		padding-bottom: var(--sp-5);
	}
	.laptop {
		filter: drop-shadow(0 24px 40px rgb(0 0 0 / 0.5));
	}
	/* the lid: a thin bezel around the screen */
	.lid {
		padding: var(--sp-2);
		background: var(--surface-2);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-md) var(--radius-md) 0 0;
	}
	.lid img,
	.phone img {
		display: block;
		width: 100%;
		height: auto; /* width/height attrs reserve the space; this keeps the ratio */
		border-radius: var(--radius-sm);
	}
	/* the base: wider than the lid, with a small thumb notch */
	.base {
		position: relative;
		height: var(--sp-3);
		margin: 0 -4%;
		background: linear-gradient(180deg, var(--border-strong), var(--surface-2));
		border-radius: 0 0 var(--radius-lg) var(--radius-lg);
	}
	.base::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 0;
		width: 16%;
		height: var(--sp-1);
		transform: translateX(-50%);
		background: var(--border);
		border-radius: 0 0 var(--radius-sm) var(--radius-sm);
	}
	.phone {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 24%;
		padding: var(--sp-1);
		background: var(--surface-2);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lift);
	}
	.phone img {
		border-radius: var(--radius-md);
	}
</style>
