# AutoScribe

This is **AutoScribe**, our submission for HoyaHacks 2023.

## Purpose

AutoScribe is a webapp intended to help students process information and review content. To use AutoScribe, users paste YouTube links or upload videos to the site. The backend will extract the audio and create a transcription. Then, it will use GPT-3 to take notes / create a summary of the video. This can all be managed through a user-friendly frontend.

## Technologies

AutoScribe's frontend is coded in [Svelte](https://svelte.dev/) and [SvelteKit](https://svelte.dev/), JavaScript libraries. It also uses [Sass](https://sass-lang.com/), a CSS preprocessor, and [Bulma](https://bulma.io), a CSS/SASS libary.

## Running Locally

To run AutoScribe locally, clone the repository and run install the dependencies with `npm install`, then run the frontend with `npm run dev`. This will start a server on <http://localhost:5173/>

## Other Services

For the backend, AutoScribe uses a Kubernetes cluster (hosted on Google Cloud) to manage downloading of YouTube videos, as well as audio extraction. You can find the code for that in [TigerHacks-Competition-Team/HoyaHacksKub](https://github.com/TigerHacks-Competition-Team/HoyaHacksKub)

AutoScribe also uses Google Cloud for transcribing, specifically Google Cloud's transcription service. The code for that, along with some other stuff, is in [TigerHacks-Competition-Team/HoyaHacksCloud](https://github.com/TigerHacks-Competition-Team/HoyaHacksCloud)
