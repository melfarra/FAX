document.getElementById('generate-fact').addEventListener('click', async function() {
    const topic = document.getElementById('topic-select').value;
    const factDisplay = document.getElementById('fact-display');

    try {
        const generateResponse = await fetch(`/generate-fact/${topic}`);
        if (!generateResponse.ok) {
            throw new Error('Failed to generate fact');
        }
        const generatedData = await generateResponse.json();
        factDisplay.textContent = generatedData.fact;
    } catch (error) {
        factDisplay.textContent = 'Error: ' + error.message;
    }
}); 