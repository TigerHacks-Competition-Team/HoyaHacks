<script lang="ts">
    import { onMount } from "svelte";
    import type { AuthSession } from "@supabase/supabase-js";
    import { supabase } from "./supabase";
  
    export let session: AuthSession;
  
    let loading = false
    let username: string | null = null
  
    onMount(() => {
      addUsername()
      getProfile()
    })
  
    const getProfile = async () => {
      try {
        loading = true
        const { user } = session
  
        const { data, error, status } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single()
  
        if (error && status !== 406) throw error
  
        if (data) {
          username = data.username
        }
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message)
        }
      } finally {
        loading = false
      }
    }

    async function addUsername() {
      await supabase
        .from('users')
        .insert([{'id': session.user.id, 'username': session.user.email?.split("@")[0]}])
    }
  
    const updateProfile = async () => {
      try {
        loading = true
        const { user } = session
  
        const updates = {
          id: user.id,
          username: username,
        }
  
        let { error } = await supabase.from('users').upsert(updates)
  
        if (error) {
          throw error
        }
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message)
        }
      } finally {
        loading = false
      }
    }
  </script>
  
  <form on:submit|preventDefault={updateProfile} class="form-widget">
    <div>Email: {session.user.email}</div>
    <div>
      <label for="username">Username</label>
      <input id="username" type="text" bind:value={username} />
    </div>
    <div>
      <button type="submit" class="button primary block" disabled={loading}>
        {loading ? 'Saving ...' : 'Update profile'}
      </button>
    </div>
    <button type="button" class="button block" on:click={() => supabase.auth.signOut()}>
      Sign Out
    </button>
  </form>