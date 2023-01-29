/**
 * Function for starting the transcription service on an audio file
 * @param {String} id row id for the video notes
 * @param {String} url uri of the converted mp3 in cloud storage
 * @returns 
 */
const startTranscription = async (id, url) => 
    fetch(
        `https://speech.googleapis.com/v1p1beta1/speech:longrunningrecognize`,
        {
            body: JSON.stringify({
                config: {
                    language_code: "en-US",
                    enable_automatic_punctuation: true,
                },
                output_config: {
                    gcs_uri: `gs://hoya-hacks-transcriptions/${id}.json`
                },
                audio: {
                    uri: url
                },
            }),
            headers: {
                Authorization: `Bearer ${import.meta.env.GCP_API_KEY}`,
                "Content-Type": "application/json",
            },
            method: "POST",
        },
    )