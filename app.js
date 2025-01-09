document.getElementById('generate-fact').addEventListener('click', function() {
    const topic = document.getElementById('topic-select').value;
    const factDisplay = document.getElementById('fact-display');

    fetch(`/facts/${topic}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                factDisplay.textContent = 'No facts available for this topic.';
            } else {
                const randomFact = data[Math.floor(Math.random() * data.length)];
                factDisplay.textContent = randomFact;
            }
        })
        .catch(error => {
            factDisplay.textContent = 'Error fetching facts: ' + error.message;
        });
}); 