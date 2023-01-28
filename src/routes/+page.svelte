<script lang="ts">
    import { onMount } from 'svelte'
    import { supabase } from './supabase'
    import type { AuthSession } from '@supabase/supabase-js'
    import Login from './login.svelte'
    import Notes from './notes.svelte'
  
    let session: AuthSession
  
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
    {#if !session}
    <Login />
    {:else}
    <Notes {session}/>
    {/if}
  </div>