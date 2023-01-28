<script lang="ts">
    import { onMount } from 'svelte'
    import { supabase } from '../supabase'
    import type { AuthSession } from '@supabase/supabase-js'
    import Account from './account.svelte'
    import { goto } from '$app/navigation';
  
    let session: AuthSession | null
  
    onMount(() => {
      supabase.auth.getSession().then(({ data }) => {
        session = data.session
      })
  
      supabase.auth.onAuthStateChange((_event, _session) => {
        session = _session
      })
    })
  </script>

<div class="container" style="padding: 50px 0 100px 0">
    {#if session}
    <button on:click={() => goto("/")}>Back</button>
    <Account {session} />
    {/if}
</div>