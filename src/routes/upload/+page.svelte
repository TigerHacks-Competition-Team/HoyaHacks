<script lang="ts">
    import { onMount } from "svelte";
    import { supabase } from "../supabase";
    import type { AuthSession } from "@supabase/supabase-js";
    import { goto } from "$app/navigation";
    import { startTranscription } from "../../api/transcription";
    import { queryPrompt } from "../../api/gpt";
    import "@fontsource/public-sans";
    import "@fortawesome/fontawesome-free/css/all.min.css";
    import "../../style/upload.scss";
    import Navbar from "../navbar.svelte";
    import Note from "../note.svelte";

    let session: AuthSession | null;
    let notes: ArrayLike<any> = [];
    let youtubeURL: string = "";
    let videoFileInput: HTMLInputElement;

    onMount(() => {
        supabase.auth.getSession().then(({ data }) => {
            session = data.session;
            getNotes();
        });

        supabase.auth.onAuthStateChange((_event, _session) => {
            session = _session;
        });
    });

    async function getNotes() {
        console.log("getNotes called", session);
        if (!session) return null;
        let { data, error } = await supabase
            .from("notes")
            .select()
            .eq("user", session.user.id);

        console.log(data);
        if (data) {
            notes = data;
        }
    }

    async function createNote(link: string) {
        const { data } = await supabase
            .from("notes")
            .insert({ user: session?.user.id, video_link: link })
            .select("id");

        if (data) return data[0].id;

        return;
    }

    async function uploadYoutubeVideo(url: string) {
        if (
            !url.match(/^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/g)
        )
            return;

        const notesRowID = await createNote(url);

        const resJson = await fetch(
            "https://hkwrlworzfpsgkaxcobm.functions.supabase.co/yt2mp3",
            {
                method: "POST",
	async function uploadLocalVideo() {
		videoFileInput = <HTMLInputElement>document.getElementById("custom-file-input");
		if (!videoFileInput.files) return;
		
		let file = videoFileInput.files[0];
        
        await uploadVideoToDB(file).then(async (data) => {
            let publicURL = data.data.publicUrl;

            const functionLink = "http://35.232.31.28/video2mp3";

            const resJSON = await fetch(functionLink, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    url: url,
                }),
            }
        ).then(res => res.json());
                    video: publicURL
                })
            }).then((res) => res.json)
        })
	}

    async function uploadYoutubeVideo() {
		  const regex = /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/g;
      if (!youtubeURL.match(regex)) return;

		  const functionLink = 'http://35.232.31.28/yt2mp3';


      const notesRowID = await createNotes("bruh", "bruh");

      const resJson = await fetch(functionLink, {
			  method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
			  body: JSON.stringify({
                url: youtubeURL,
			  })
		  }).then((res) => res.json())


        await startTranscription(notesRowID, resJson.url).catch(err =>
            console.log(err)
        );
    }
</script>

<Navbar {session} />

{#each notes as note}
    <Note
        name="Temp Note Name"
        link={note.video_link}
        data={note.notes}
        created={note.created_at}
        transcription={note.transcription}
    />
{/each}

<!-- <div class="container" style="padding: 50px 0 100px 0">
    {#if session}
        <button on:click={() => goto("/")}>Back</button>

        <div>
            <input id="custom-file-input" type="file" autocomplete="off" accept="video/*"/>
            <button on:click={uploadLocalVideo}>Upload</button>
        </div>
        <div>
            <input
                bind:value={youtubeURL}
                type="text"
                placeholder="Youtube link..."
            />
            <button on:click={uploadYoutubeVideo}>Upload</button>
            <p>{import.meta.env}</p>
        </div>
    {/if}
</div> -->
