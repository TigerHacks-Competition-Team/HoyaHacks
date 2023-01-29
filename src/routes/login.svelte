<script lang="ts">
    import { supabase } from "./supabase";

    async function signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
        });
    }
</script>

<h1>Supabase + Svelte</h1>

<button on:click={signInWithGoogle}>Sign in with google</button>
