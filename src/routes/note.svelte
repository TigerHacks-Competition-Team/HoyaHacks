<script lang="ts">
    export let name: string | null = null;
    export let link: string | null = null;
    export let data: string | null = null;
    export let created: string | null = null;
    export let transcription: string | null = null;
</script>

<div class="note">
    <p class="title is-5">{name}</p>
    <a href="{link}">{link}</a>
    <p>Created on {created}</p>
    <p>{data}</p>
    <p>{transcription}</p>
</div>