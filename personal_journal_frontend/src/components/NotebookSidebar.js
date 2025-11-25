import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Modal, Badge } from 'react-bootstrap';
import toast from 'react-hot-toast';
import api from '../services/api';

function NotebookSidebar({ user, onNotebookSelect, selectedNotebook }) {
  const [notebooks, setNotebooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newNotebook, setNewNotebook] = useState({
    name: '',
    description: '',
    color: '#6b4423'
  });

  useEffect(() => {
    fetchNotebooks();
  }, [user.id]);

  const fetchNotebooks = async () => {
    try {
      const response = await api.getNotebooks(user.id);
      setNotebooks(response.data);
    } catch (err) {
      console.error('Failed to load notebooks:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createNotebook({
        user_id: user.id,
        ...newNotebook
      });
      toast.success('Notebook created!');
      setShowModal(false);
      setNewNotebook({ name: '', description: '', color: '#6b4423' });
      fetchNotebooks();
    } catch (err) {
      toast.error('Failed to create notebook');
    }
  };

  const colors = ['#6b4423', '#2d7a4f', '#4a7c9e', '#c44536', '#8d6e4d', '#6f6f6f'];

  return (
    <>
      <Card className="mb-4 notebook-sidebar">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">📚 Notebooks</h5>
            <Button 
              size="sm" 
              variant="primary"
              onClick={() => setShowModal(true)}
            >
              + New
            </Button>
          </div>

          <div className="notebook-list">
            <div 
              className={`notebook-item ${!selectedNotebook ? 'active' : ''}`}
              onClick={() => onNotebookSelect(null)}
            >
              <span>📝 All Posts</span>
            </div>

            {notebooks.map(notebook => (
              <div
                key={notebook.id}
                className={`notebook-item ${selectedNotebook === notebook.id ? 'active' : ''}`}
                onClick={() => onNotebookSelect(notebook.id)}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div 
                      className="notebook-color" 
                      style={{backgroundColor: notebook.color}}
                    ></div>
                    <span>{notebook.name}</span>
                  </div>
                  <Badge bg="secondary">{notebook.post_count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Notebook</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreate}>
            <Form.Group className="mb-3">
              <Form.Label>Notebook Name</Form.Label>
              <Form.Control
                type="text"
                value={newNotebook.name}
                onChange={(e) => setNewNotebook({...newNotebook, name: e.target.value})}
                placeholder="e.g., Travel Memories"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newNotebook.description}
                onChange={(e) => setNewNotebook({...newNotebook, description: e.target.value})}
                placeholder="Brief description..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <div className="color-picker">
                {colors.map(color => (
                  <div
                    key={color}
                    className={`color-option ${newNotebook.color === color ? 'selected' : ''}`}
                    style={{backgroundColor: color}}
                    onClick={() => setNewNotebook({...newNotebook, color})}
                  ></div>
                ))}
              </div>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit">
                Create Notebook
              </Button>
              <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default NotebookSidebar;