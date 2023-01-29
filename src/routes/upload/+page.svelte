<script lang="ts">
    import { onMount } from "svelte";
    import { listeningForStateChange, supabase, updateNote, updateNotesState, uploadVideoToDB } from "../supabase";
    import type { AuthSession } from "@supabase/supabase-js";
    import { goto } from "$app/navigation";
    import { startTranscription } from "../../api/transcription";
    import "@fontsource/public-sans";
    import "@fortawesome/fontawesome-free/css/all.min.css";
    import "../../style/upload.scss";
    import Navbar from "../navbar.svelte";
    import Note from "../note.svelte";
    //import { queryPrompt } from "../../api/gpt"; 
    import { element } from "svelte/internal";

    let session: AuthSession | null;
    let notes: Array<any> = [];
    let youtubeURL: string = "";
    let videoFileInput: HTMLInputElement;

    async function queryPrompt(prompt) {
        const response = await fetch(
            `https://api.openai.com/v1/completions`,
            {
                body: JSON.stringify({
                    model: "text-davinci-003",
                    prompt: prompt,
                    temperature: 0,
                    max_tokens: 60,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                }),
                headers: {
                    Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
            },
        );

        const responseJson = await response.json()
        return responseJson.choices[0].text
    }

    onMount(() => {
        supabase.auth.getSession().then(({ data }) => {
            session = data.session;
            if (!session) return;
            getNotes();

            listeningForStateChange(session.user.id, async (e) => {
                let docIdx = notes.findIndex(ele => ele.id == e.new.id)
                notes[docIdx] = e.new
                console.log(e);

                if (e.new.state == 'Transcription Complete') {
                    console.log('doing gthe gpt3');
                    await updateNotesState(e.new.id, 'Generating Notes');
                    let note = await queryPrompt(`Prompt: summarize the following using bullet points with section titles: ${e.new.transcription}\nAnswer:`);
                    let updatedNote = await updateNote({id: e.new.id, notes: note, state: 'Complete'});
                    notes[docIdx] = updatedNote;
                    console.log('fininshed the gpt3');
                }
                     
            });
        });

        supabase.auth.onAuthStateChange((_event, _session) => {
            session = _session;
        });
    });

    async function getNotes() {
        //console.log("getNotes called", session);
        if (!session) return null;
        let { data, error } = await supabase
            .from("notes")
            .select()
            .eq("user", session.user.id);

        //console.log(data);
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

	async function uploadLocalVideo() {
        const notesRowID = await createNote(youtubeURL);
        await updateNotesState(notesRowID, "Uploading and Converting Video")
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
                    video: publicURL,
                })
            }).then(res => res.text());
            await updateNotesState(notesRowID, "Uploading to Transcription Engine")
            await startTranscription(await createNote(youtubeURL), resJSON).catch(err =>
                console.log(err)
            );
            await updateNotesState(notesRowID, "Transcribing")
        });

	}

    async function uploadYoutubeVideo() {
		const regex = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/g;
        if (!youtubeURL.match(regex)) return;

		const functionLink = 'http://35.232.31.28/yt2mp3';

        const notesRowID = await createNote(youtubeURL);

        const resJSON = await fetch(functionLink, {
			method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
			body: JSON.stringify({
                url: youtubeURL,
			})
		  }).then((res) => res.text())


        await startTranscription(notesRowID, resJSON).catch(err =>
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

<div class="container" style="padding: 50px 0 100px 0">
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
</div>
