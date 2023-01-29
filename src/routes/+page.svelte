<script lang="ts">
    import { onMount } from "svelte";
    import { supabase } from "./supabase";
    import type { AuthSession } from "@supabase/supabase-js";
    import Login from "./login.svelte";
    import Notes from "./notes.svelte";
    import { goto } from "$app/navigation";
    import "@fontsource/public-sans";
    import "../style/landing.scss";

    let session: AuthSession | null;
    let loaded: boolean = false;

    onMount(() => {
        supabase.auth.getSession().then(({ data }) => {
            session = data.session;

            loaded = true;
        });

        supabase.auth.onAuthStateChange((_event, _session) => {
            session = _session;
        });
    });
</script>

<nav class="navbar">
    <div class="navbar-brand">
        <div class="navbar-item">
            <button class="button is-primary" />
        </div>
    </div>
</nav>

{#if session}
    <button on:click={() => goto("/account")}>Account</button>
    <button on:click={() => goto("/upload")}>Upload</button>
    <Notes {session} />
{:else if loaded}
    <Login />
{/if}
