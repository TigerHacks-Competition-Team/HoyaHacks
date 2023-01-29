<script lang="ts">
	import { queryPrompt } from './../../api/gpt.js';
    import { onMount } from "svelte";
    import { supabase, uploadVideoToDB } from "../supabase";
    import type { AuthSession } from "@supabase/supabase-js";
    import { goto } from "$app/navigation";
    import { startTranscription } from "../../api/transcription";
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
                    video: publicURL,
                })
            }).then(res => res.json());
            await startTranscription(await createNote(youtubeURL), resJSON.url).catch(err =>
                console.log(err)
            );
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
		  }).then((res) => res.json())


        await startTranscription(notesRowID, resJSON.url).catch(err =>
            console.log(err)
        );
    }

    function formatDate(date: string) {
        let dateObj = new Date(date);
        return dateObj.toLocaleDateString() + " at " + dateObj.toLocaleTimeString();
    }

    const modalData = {
        src: "",
        srcText: "",
        title: "",
        created: "",
        data: "",
        transcript: "",
    }

    function loadNoteModal(note: Object) {
        console.log(note);
        // load data into object / page
        modalData.src = note.video_link;
        modalData.embedSrc = "https://www.youtube.com/embed/" + note.id;
        modalData.title = note.title || "Unknown Video";
        modalData.created = formatDate(note.created_at);
        modalData.data = note.notes || "summstury fheree";
        modalData.transcript = note.transcription || "transcriptifier";

        const modal = document.getElementById("note-modal");
        modal?.classList.add("is-active");
    }
    function closeModal(e) {
        const modal = document.getElementById("note-modal");
        if (e.key) {
             if (e.key == "Escape") {
                modal?.classList.remove("is-active");
             }
        } else {
            modal?.classList.remove("is-active");
        }
    }
</script>

<div class="modal" id="note-modal">
    <div class="modal-background" on:click={closeModal} on:keydown={closeModal}></div>
    <div class="modal-content">
        <div class="card">
            <iframe src={modalData.embedSrc} frameborder="0" title={modalData.title}></iframe>

            <h3 class="title is-3">{modalData.title}</h3>
            <a class="link" href={modalData.src}>Source: {modalData.src}</a>
            <p class="created">Created on {modalData.created}</p>

            <div class="buttons has-addons is-centered">
                <button
                class="button summary-button is-primary is-selected"
                on:click={() => {
                    const modalField = document.getElementById("modal-field");
                    if (modalField) {
                        modalField.innerText = modalData.data;
                    }
                }}>Summary</button>
                <button
                class="button transcript-button"
                on:click={() => {
                    const modalField = document.getElementById("modal-field");
                    if (modalField) {
                        modalField.innerText = modalData.transcript;
                    }
                }}>Transcript</button>
            </div>
    
            <p id="modal-field">{modalData.data}</p>
        </div>
    </div>
    <button class="modal-close is-large" aria-label="close" on:click={closeModal}></button>
</div>

<div id="video-bar" class="level">
    <div class="level-left mx-2">
        <a class="level-item" href="/">
            <img src="logo.svg" alt=""/>
            <p class="title is-4 ml-3">AutoScribe</p>
        </a>
    </div>
    <div class="level-right mr-2" id="video-inputs">
        <button class="button is-primary">
            <span class="icon">
                <i class="fas fa-upload"></i>
            </span>
            <span>Upload Video</span>
        </button>
        <input class="input pl-4" type="text" placeholder="Paste your YouTube URL">
    </div>
</div>

<div class="is-flex is-flex-direction-column" id="notes">
    {#each notes as note}
        <Note
            {note}
            modalFunction={loadNoteModal}
        />
    {/each}
</div>

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
