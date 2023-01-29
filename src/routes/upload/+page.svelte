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
    let selected: any = null;


    $:sortedNotes = notes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

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
        if (responseJson.choices >= 0)
            return responseJson.choices[0].text
        return ""
    }

    onMount(() => {
        supabase.auth.getSession().then(async ({ data }) => {
            session = data.session;
            if (!session) return;
            getNotes();
            

            listeningForStateChange(session.user.id, async (e) => {
                let docIdx = notes.findIndex(ele => ele.id == e.new.id)
                console.log(docIdx)
                if (docIdx < 0) notes.splice(0,0,e.new)
                else notes[docIdx] = e.new
                console.log(e);

                notes = notes
                await generateNotes(e.new)

                
            });
        });

        supabase.auth.onAuthStateChange((_event, _session) => {
            session = _session;
        });
    });

    async function generateNotes(note) {
        console.log("generating notes")
        let docIdx = notes.findIndex(ele => ele.id == note.id)
        console.log(JSON.stringify(note))
        if (note.state == 'Transcription Complete' || (note.notes == null && note.transcription != null)) {
            console.log('doing gthe gpt3');

            await updateNotesState(note.id, 'Generating Notes');
            let summary = await queryPrompt(`Prompt: summarize the following using bullet points with section titles: ${note.transcription}\nAnswer:`);
            let title = await queryPrompt(`Prompt: create a title based on this text: ${note}\nAnswer:`)
            let updatedNote = await updateNote({id: note.id, notes: summary, state: 'Complete', title: title});
            notes[docIdx] = updatedNote;
            console.log('fininshed the gpt3');
            notes = notes
        }
        return
    }

    async function getNotes() {
        if (!session) return null;
        let { data, error } = await supabase
            .from("notes")
            .select()
            .eq("user", session.user.id);

        //console.log(data);
        if (data) {
            notes = data;
            let promises = notes.map((note) => generateNotes(note))
            await Promise.all(promises)
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
                    //'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    video: publicURL,
                })
            }).then(res => res.text());
            await updateNotesState(notesRowID, "Uploading to Transcription Engine")
            await startTranscription(notesRowID, resJSON).catch(err =>
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
        await updateNotesState(notesRowID, "Uploading and Converting Video")

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

        youtubeURL = "";

        await updateNotesState(notesRowID, "Uploading to Transcription Engine")
        await startTranscription(notesRowID, resJSON).catch(err =>
            console.log(err)
        );
        await updateNotesState(notesRowID, "Transcribing")
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
        /*console.log(note);
        // load data into object / page
        modalData.src = note.video_link;
        modalData.embedSrc = "https://www.youtube.com/embed/" + note.id;
        modalData.title = note.title || "Unknown Video";
        modalData.created = note.created_at;
        modalData.data = note.notes || "summstury fheree";
        modalData.transcript = note.transcription || "transcriptifier";

        const modal = document.getElementById("note-modal");
        modal?.classList.add("is-active");*/
        selected = note
        const ytRegex = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/;
        let matches = note.video_link?.match(ytRegex)
        selected.ytId = matches ? matches[1] : null;
        console.log(selected);
    }

    function closeModal(e) {
        const modal = document.getElementById("note-modal");
        if (e.key) {
             if (e.key == "Escape") {
                modal?.classList.remove("is-active");
                selected = null
             }
        } else {
            modal?.classList.remove("is-active");
            selected = null
        }
    }
</script>

{#if selected}
<div class="modal is-active" id="note-modal">
    <div class="modal-background" on:click={closeModal} on:keydown={closeModal}></div>
    <div class="modal-content">
        <div class="card">
            <img src="https://i.ytimg.com/vi/{selected.ytId}/hq720.jpg" alt="" class="thumbnail">
            <!-- <iframe src={selected.embedSrc} frameborder="0" title={selected.title}></iframe> -->

            <h3 class="title is-3">{selected.title}</h3>
            <a class="link" href={selected.video_link}>Source: {selected.video_link}</a>
            <p class="created">Created on {selected.created_at}</p>

            <div class="buttons has-addons is-centered">
                <button
                class="button summary-button is-primary is-selected"
                on:click={e => {
                    const modalField = document.getElementById("modal-field");
                    if (modalField) {
                        modalField.innerText = selected.notes;
                        e.currentTarget.classList.add("is-primary");
                        e.currentTarget.classList.add("is-selected");
                        document.getElementsByClassName("transcript-button")[0].classList.remove("is-primary")
                        document.getElementsByClassName("transcript-button")[0].classList.remove("is-selected")
                    }
                }}>Summary</button>
                <button
                class="button transcript-button"
                on:click={e => {
                    const modalField = document.getElementById("modal-field");
                    if (modalField) {
                        modalField.innerText = selected.transcription;
                        e.currentTarget.classList.add("is-primary");
                        e.currentTarget.classList.add("is-selected");
                        document.getElementsByClassName("summary-button")[0].classList.remove("is-primary")
                        document.getElementsByClassName("summary-button")[0].classList.remove("is-selected")
                    }
                }}>Transcript</button>
            </div>
    
            <p id="modal-field"></p>
        </div>
    </div>
    <button class="modal-close is-large" aria-label="close" on:click={closeModal}></button>
</div>
{/if}
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
        <input class="input pl-4" type="text" id="url-input" placeholder="Paste your YouTube URL" on:paste={uploadYoutubeVideo} bind:value={youtubeURL}>
        <button class="button is-primary" on:click={uploadYoutubeVideo}>
            <span class="icon">
                <i class="fas fa-paper-plane" />
            </span>
            <span>Send URL</span>
        </button>
    </div>
</div>

<div class="is-flex is-flex-direction-column" id="notes">
    {#each sortedNotes as note}
        <Note
            {note}
            modalFunction={loadNoteModal}
        />
    {/each}
</div>


<!-- 
<div id="no-videos">
    <p class="title is-1 no-videos">No Videos?</p>
    <p class="subtitle.is-3 no-videos">Try pasting in a YouTube link above to start.</p>
</div> -->
