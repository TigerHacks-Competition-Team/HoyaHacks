<script lang="ts">
    import { supabase } from './supabase'

    async function signInWithGoogle() {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      })
    }
  </script>
  
  <div class="row flex-center flex">
    <div class="col-6 form-widget" aria-live="polite">
      <h1 class="header">Supabase + Svelte</h1>
      
      <button on:click={signInWithGoogle}>Sign in with google</button>
    </div>
  </div>