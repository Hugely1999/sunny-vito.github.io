import React from 'react';
import './App.css';
import OCRUploader from './components/OCRUploader';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>PaddleOCR 文字识别系统</h1>
        <p>基于PaddleOCR的文字识别和文档处理系统</p>
      </header>
      <main className="App-main">
        <OCRUploader />
      </main>
      <footer className="App-footer">
        <p>© {new Date().getFullYear()} PaddleOCR文字识别系统</p>
      </footer>
    </div>
  );
}

export default App; 