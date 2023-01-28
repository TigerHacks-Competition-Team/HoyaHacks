<script lang="ts">
    import { supabase } from "./supabase";
    import type { AuthSession } from "@supabase/supabase-js";

    export let session: AuthSession;
    let notes: ArrayLike<any> = []

    async function getNotes() {
        let { data, error } = await supabase
            .from('notes')
            .select()
            .eq('user', session.user.id)
        
        if (data) {
            notes = data
        }
    }

    getNotes()
</script>

<div>
    {#each notes as note}
        <a href={note.video_link}>{note.video_link}</a>
        <p>{note.notes}</p>
    {/each}
</div>