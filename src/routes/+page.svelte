<script lang="ts">
	import { onMount } from "svelte";
	import { supabase } from "./supabase";
	import type { AuthSession } from "@supabase/supabase-js";
	import Login from "./login.svelte";
	import Notes from "./notes.svelte";
	import { goto } from "$app/navigation";

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

<div class="container" style="padding: 50px 0 100px 0">
	{#if session}
		<button on:click={() => goto("/account")}>Account</button>
		<button on:click={() => goto("/upload")}>Upload</button>
		<Notes {session} />
	{:else if loaded}
		<Login />
	{/if}
</div>
