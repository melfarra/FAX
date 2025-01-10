# Fax - Interesting Facts Generator

A modern web application that generates unique and interesting facts across various topics using AI. Built with Node.js, Express, MongoDB, and OpenAI's GPT-3.5.

## Features

- Generate unique facts across multiple categories
- Beautiful, responsive UI with modern design
- Prevents duplicate facts using similarity checking
- MongoDB integration for fact storage
- OpenAI GPT-3.5 powered fact generation

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- AI: OpenAI GPT-3.5
- Styling: Custom CSS with Bootstrap

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fax.git
cd fax
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with:
```
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```

4. Start the server:
```bash
npm start
```

5. Visit `http://localhost:3000` in your browser

## Environment Variables

- `MONGODB_URI`: Your MongoDB connection string
- `OPENAI_API_KEY`: Your OpenAI API key

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/) 
