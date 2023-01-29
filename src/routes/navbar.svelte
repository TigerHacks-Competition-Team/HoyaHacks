<script lang="ts">
    import type { Session } from "@supabase/supabase-js";
    import { onMount } from "svelte";

    export let session: Session | null = null;

    onMount(async () => {
        const navbar = document.getElementById("navbar");
        if (document.body.scrollTop != 0) {
            navbar?.classList.remove("not-scrolled");
        }
        function checkScroll() {
            if (navbar && document.body.scrollTop == 0) {
                navbar.classList.add("not-scrolled");
            } else if (navbar) {
                navbar.classList.remove("not-scrolled");
            }
        }
        document.body.addEventListener("scroll", checkScroll);
    });
</script>

<nav class="navbar not-scrolled p-2" id="navbar">
    <div class="navbar-brand">
        <a class="navbar-item" href="/">
            <img src="logo.svg" alt="" />
            <p class="title is-4 ml-3">AutoScribe</p>
        </a>
    </div>
    <div class="navbar-menu">
        <div class="navbar-end pr-2">
            {#if !session}
                <a href="#login" class="navbar-item icon-text">
                    <span class="icon">
                        <i class="fas fa-right-to-bracket" />
                    </span>
                    <span>Log In</span>
                </a>
            {:else}
                <a href="/upload" class="navbar-item icon-text">
                    <span class="icon">
                        <i class="fas fa-book-reader" />
                    </span>
                    <span>View Notes</span>
                </a>
                <a href="/upload" class="navbar-item icon-text">
                    <span class="icon">
                        <i class="fas fa-upload" />
                    </span>
                    <span>Upload Videos</span>
                </a>
            {/if}
        </div>
    </div>
</nav>
