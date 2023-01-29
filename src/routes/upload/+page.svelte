<script lang="ts">
	import { onMount } from "svelte";
	import { supabase } from "../supabase";
	import type { AuthSession } from "@supabase/supabase-js";
	import { goto } from "$app/navigation";
    import { startTranscription } from '../../api/transcription';
    import { queryPrompt } from '../../api/gpt';
    console.log(import.meta.env)

	let session: AuthSession | null;
    let youtubeURL: string = ""
	let videoFileInput: HTMLInputElement;

	onMount(() => {
		supabase.auth.getSession().then(({ data }) => {
			session = data.session;
		});

		supabase.auth.onAuthStateChange((_event, _session) => {
			session = _session;
		});
	});

    async function createNotes(notes: string, link: string) {
        const { data } = await supabase
            .from('notes')
            .insert({user: session?.user.id, notes: notes, video_link: link})
            .select('id')

        if (data) return data[0].id

        return
    }

    async function uploadYoutubeVideo() {
        if (!youtubeURL.match(/^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/g)) return

        const notesRowID = await createNotes("bruh", "bruh")

        const resJson = await fetch('https://hkwrlworzfpsgkaxcobm.functions.supabase.co/yt2mp3', {
	async function uploadLocalVideo() {
		videoFileInput = <HTMLInputElement>document.getElementById("custom-file-input");
		if (!videoFileInput.files) return;
		
		let file = videoFileInput.files[0];
	}

    async function uploadYoutubeVideo() {
		const regex = /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/g;
        if (!youtubeURL.match(regex)) return;

		const functionLink = 'https://hkwrlworzfpsgkaxcobm.functions.supabase.co/yt2mp3';

        const resJson = await fetch(functionLink, {
			method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
			body: JSON.stringify({
                url: youtubeURL,
			})
		}).then((res) => res.json())

        await startTranscription(notesRowID, resJson.url).catch(err => console.log(err))
    }
</script>

<div class="container" style="padding: 50px 0 100px 0">
	{#if session}
		<button on:click={() => goto("/")}>Back</button>
        
        <div>
            <input id="custom-file-input" type="file" autocomplete="off" accept="video/*"/>
            <button on:click={uploadLocalVideo}>Upload</button>
        </div>
        <div>
            <input bind:value={youtubeURL} type="text" placeholder="Youtube link..." />
            <button on:click={uploadYoutubeVideo}>Upload</button>
            <p>{import.meta.env}</p>
        </div>
	{/if}
</div>
