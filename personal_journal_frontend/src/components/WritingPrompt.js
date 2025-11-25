import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import api from '../services/api';

function WritingPrompt({ onUsePrompt }) {
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    setLoading(true);
    try {
      const response = await api.getRandomPrompt();
      setPrompt(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load prompt:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-4 prompt-card">
        <Card.Body>
          <div className="text-center">Loading prompt...</div>
        </Card.Body>
      </Card>
    );
  }

  if (!prompt) return null;

  return (
    <Card className="mb-4 prompt-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="mb-0">💡 Writing Prompt</h5>
          <Button 
            size="sm" 
            variant="link" 
            onClick={fetchPrompt}
            title="Get new prompt"
          >
            🔄
          </Button>
        </div>
        <p className="prompt-text">{prompt.prompt_text}</p>
        <div className="d-flex justify-content-between align-items-center">
          <Badge bg="info">{prompt.category}</Badge>
          {onUsePrompt && (
            <Button 
              size="sm" 
              variant="outline-primary"
              onClick={() => onUsePrompt(prompt.prompt_text)}
            >
              Use This Prompt
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default WritingPrompt;