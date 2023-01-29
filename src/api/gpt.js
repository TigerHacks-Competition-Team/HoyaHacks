const queryPrompt = async (prompt) => {
    const response = await fetch(
        `https://api.openai.com/v1/completions`,
        {
            body: JSON.stringify({
                model: "text-davinci-003",
                prompt: prompt,
                temperature: 0,
                max_tokens: 60,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            }),
            headers: {
            Authorization: `Bearer ${import.meta.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
            },
            method: "POST",
        },
    );

    const responseJson = await response.json()
    return responseJson.choices[0].text
}