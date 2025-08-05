# PageVitals

A comprehensive web performance analysis tool that uses Google PageSpeed Insights API to analyze website performance metrics.

## Features

- 📊 **Bulk URL Analysis**: Upload Excel files with multiple URLs for batch analysis
- 🚀 **Performance Metrics**: Get detailed Core Web Vitals and performance scores
- 📱 **Mobile & Desktop**: Analyze performance for both mobile and desktop devices
- 📈 **Excel Export**: Download results as Excel files for further analysis
- 🔄 **Real-time Processing**: Track analysis progress with live updates
- 🎯 **PageSpeed Insights Integration**: Powered by Google's official API

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Multer** for file uploads
- **XLSX** for Excel file processing
- **Axios** for API requests
- **CORS** enabled for cross-origin requests

### Frontend
- **React 18** with modern hooks
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Responsive design** for all devices

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google PageSpeed Insights API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YourUsername/PageVitals.git
cd PageVitals
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Configure API keys:
   - Add your Google PageSpeed Insights API keys to `backend/config/settings.js`

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Upload Excel File**: Select an Excel file containing URLs in the first column
2. **Choose Device**: Select Mobile, Desktop, or Both for analysis
3. **Start Analysis**: Click "Analyze URLs" to begin processing
4. **Monitor Progress**: Watch real-time progress updates
5. **Download Results**: Get your analysis results as an Excel file

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/analyze` - Analyze URLs from uploaded Excel file

## Project Structure

```
PageVitals/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request controllers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── uploads/         # File upload directory
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions
│   │   └── assets/      # Assets and styles
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/YourUsername/PageVitals/issues) on GitHub.
