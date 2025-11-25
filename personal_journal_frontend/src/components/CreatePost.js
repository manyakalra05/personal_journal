import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import ReactQuill from 'react-quill-new';
import toast from 'react-hot-toast';
import 'react-quill-new/dist/quill.snow.css';
import api from '../services/api';
import WritingPrompt from './WritingPrompt';
import ImageUpload from './ImageUpload';

function CreatePost({ user }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    notebook_id: '',
    is_public: false,
    is_pinned: false,
    is_draft: false,
    featured_image: null,
    tags: ''
  });
  const [categories, setCategories] = useState([]);
  const [notebooks, setNotebooks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveTimerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchNotebooks();
    
    const savedDraft = localStorage.getItem(`draft_${user.id}`);
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setFormData(draft);
      toast.success('Draft restored!');
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [user.id]);

  useEffect(() => {
    if (formData.title || formData.content) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000); 
    }
  }, [formData]);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const fetchNotebooks = async () => {
    try {
      const response = await api.getNotebooks(user.id);
      setNotebooks(response.data);
    } catch (err) {
      console.error('Failed to load notebooks');
    }
  };

  const handleAutoSave = async () => {
    if (!formData.title && !formData.content) return;

    setAutoSaving(true);
    
    localStorage.setItem(`draft_${user.id}`, JSON.stringify(formData));
    setLastSaved(new Date());
    
    setTimeout(() => {
      setAutoSaving(false);
    }, 1000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleContentChange = (value) => {
    setFormData({ ...formData, content: value });
  };

  const handleImageSelect = (imageData) => {
    setFormData({ ...formData, featured_image: imageData });
  };

  const handleUsePrompt = (promptText) => {
    setFormData({
      ...formData,
      title: promptText,
      content: `<p>${promptText}</p><p><br></p>`
    });
    toast.success('Prompt added! Start writing...');
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!isDraft && !formData.content.trim()) {
      setError('Content is required');
      return;
    }

    setLoading(true);

    try {
      await api.createPost({
        ...formData,
        user_id: user.id,
        is_draft: isDraft
      });
      
      localStorage.removeItem(`draft_${user.id}`);
      
      toast.success(isDraft ? 'Saved as draft!' : 'Post published!');
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create post. Please try again.');
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <Row>
      <Col md={8}>
        <div className="editor-container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Write New Journal Entry</h2>
            {autoSaving && (
              <span className="text-muted" style={{fontSize: '0.85rem'}}>
                💾 Auto-saving...
              </span>
            )}
            {lastSaved && !autoSaving && (
              <span className="text-muted" style={{fontSize: '0.85rem'}}>
                ✅ Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter post title"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Notebook (Optional)</Form.Label>
                  <Form.Select
                    name="notebook_id"
                    value={formData.notebook_id}
                    onChange={handleChange}
                  >
                    <option value="">No notebook</option>
                    {notebooks.map(nb => (
                      <option key={nb.id} value={nb.id}>{nb.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <ImageUpload 
                onImageSelect={handleImageSelect}
                currentImage={formData.featured_image}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={modules}
                placeholder="Write your thoughts here..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags (comma separated)</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. motivation, travel, work"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="is_public"
                label="🌐 Make this post public"
                checked={formData.is_public}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                name="is_pinned"
                label="📌 Pin this post"
                checked={formData.is_pinned}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                onClick={(e) => handleSubmit(e, false)}
                disabled={loading}
              >
                {loading ? 'Publishing...' : '✅ Publish Entry'}
              </Button>
              <Button 
                variant="outline-secondary"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
              >
                💾 Save as Draft
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </Col>

      <Col md={4}>
        <WritingPrompt onUsePrompt={handleUsePrompt} />
      </Col>
    </Row>
  );
}

export default CreatePost;