<script lang="ts">
    import { supabase } from "./supabase";

    async function getNotes() {
        let { data, error } = await supabase
            .from('notes')
            .select()

        console.log(data)
    }

    getNotes()
</script>

<div>
    
</div>