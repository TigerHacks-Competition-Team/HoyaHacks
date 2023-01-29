<script lang="ts">
    
    export let modalFunction: Function = () => {};
    export let loading = false;
    export let note: Object;

    const ytRegex = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/;
    let matches = note.video_link?.match(ytRegex)
    let ytId = matches ? matches[1] : null;

        let dataShort = note.notes;
    if (dataShort && dataShort.length > 150) {
        dataShort = dataShort.slice(0, 147) + "...";
    }

    let date;
    if (note.created_at) {
        date = new Date(note.created_at)
        note.created_at = date.toLocaleDateString() + " at " + date.toLocaleTimeString();
    }
</script>

<div
    class="note"
    on:click={() => modalFunction(note)}
    on:keydown={e => {if (e.key == "Enter") modalFunction(note)}}
>
    <img src="https://i.ytimg.com/vi/{ytId}/hq720.jpg" alt="" class="thumbnail">
    <div class="note-info is-flex is-flex-direction-column my-4">
        <p class="title is-5">{note.title || "Generating Title..."}</p>
        <a href="{note.video_link}">Source: {note.video_link}</a>
        <p class="created">Created on {date}</p>
        <p class="created">{note.state}</p>
        {#if loading}
            <div class="loading"></div>
        {:else}
            <p class="preview">{dataShort}</p>
            <!-- <p>{transcription}</p> -->
        {/if}
    </div>
</div>