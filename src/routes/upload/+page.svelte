<script lang="ts">
	import { onMount } from "svelte";
	import { supabase } from "../supabase";
	import type { AuthSession } from "@supabase/supabase-js";
	import { goto } from "$app/navigation";

	let session: AuthSession | null;
    let youtubeURL: string = ""

	onMount(() => {
		supabase.auth.getSession().then(({ data }) => {
			session = data.session;
		});

		supabase.auth.onAuthStateChange((_event, _session) => {
			session = _session;
		});
	});

    async function uploadYoutubeVideo() {
        if (!youtubeURL.match(/^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/g)) return
        
        console.log(youtubeURL)

        const body = JSON.stringify({
                url: youtubeURL,
			})

        console.log(body)

        const res = fetch('https://hkwrlworzfpsgkaxcobm.functions.supabase.co/yt2mp3', {
			method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
			body: body
		}).then(console.log)

        console.log(res)
    }
</script>

<div class="container" style="padding: 50px 0 100px 0">
	{#if session}
		<button on:click={() => goto("/")}>Back</button>
        
        <div>
            <input type="file" />
            <button>Upload</button>
        </div>
        <div>
            <input bind:value={youtubeURL} type="text" placeholder="Youtube link..." />
            <button on:click={uploadYoutubeVideo}>Upload</button>
        </div>
	{/if}
</div>
