<script lang="ts">
    import { onMount } from "svelte";
    import { supabase } from "./supabase";
    import type { AuthSession } from "@supabase/supabase-js";
    import Notes from "./notes.svelte";
    import { goto } from "$app/navigation";
    import "@fontsource/public-sans";
    import "@fortawesome/fontawesome-free/css/all.min.css";
    import "../style/landing.scss";
    import { dataset_dev } from "svelte/internal";
    import Navbar from "./navbar.svelte";

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

    function signInWithGoogle() {
        supabase.auth.signInWithOAuth({
            provider: "google",
        });
    }
</script>

<Navbar {session}/>

<div class="section" id="section-1">
    <div class="columns is-desktop">
        <div class="column">
            <div class="info-text">
                <h1 class="title is-1">
                    Blah Blah <span class="emphasis">Better.</span>
                </h1>
                <h3 class="subtitle is-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </h3>
                <button class="button is-primary">Get Started</button>
                <button class="button">More Info</button>
            </div>
        </div>
        <div class="column has-text-right">
            <img src="art1.svg" alt="" class="art is-first" />
        </div>
    </div>
</div>

<div class="section" id="section-2">
    <div class="slant-bg" />
    <div class="columns is-desktop">
        <div class="column">
            <img src="art2.svg" alt="" class="art is-second" />
        </div>
        <div class="column">
            <div class="info-text">
                <h1 class="title is-1">
                    Something <span class="emphasis">Easier.</span>
                </h1>
                <h3 class="subtitle is-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </h3>
            </div>
        </div>
    </div>
</div>

<section class="section" id="login">
    <div id="login-form">
        <h1 class="title is-1">Get Started</h1>
        <button class="button is-large" on:click={signInWithGoogle}>
            <span class="icon fake-icon is-medium">
                <img src="google.svg" alt="" />
            </span>
            <span>Sign up with Google</span>
        </button>
        <span class="divider">Already a member?</span>
        <button class="button is-large" on:click={signInWithGoogle}>
            <span class="icon fake-icon is-medium">
                <img src="google.svg" alt="" />
            </span>
            <span>Log in</span>
        </button>
    </div>

    <div class="footer" id="footer">
        <div class="content has-text-centered">
            <p>
                ProjectName by
                <a href="https://github.com/TigerHacks-Competition-Team/">
                    PantheraHacks / TigerHacks.
                </a>
                This app was built using <a href="https://svelte.dev">Svelte</a>
                and <a href="https://bulma.io">Bulma.</a> You can view the
                source code
                <a
                    href="https://github.com/TigerHacks-Competition-Team/HoyaHacks"
                    >here.</a
                >
            </p>
        </div>
    </div>
</section>
