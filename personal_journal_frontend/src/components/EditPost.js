import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import ReactQuill from 'react-quill-new';
import toast from 'react-hot-toast';
import 'react-quill-new/dist/quill.snow.css';
import api from '../services/api';
import ImageUpload from './ImageUpload';

function EditPost({ user }) {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveTimerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
    fetchCategories();
    fetchNotebooks();

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (formData.title && !loading) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000);
    }
  }, [formData, loading]);

  const fetchPost = async () => {
    try {
      const response = await api.getPosts(null, id);
      const post = response.data;

      if (post.user_id != user.id) {
        toast.error('You are not authorized to edit this post');
        navigate('/dashboard');
        return;
      }

      setFormData({
        title: post.title,
        content: post.content,
        category_id: post.category_id || '',
        notebook_id: post.notebook_id || '',
        is_public: post.is_public == 1,
        is_pinned: post.is_pinned == 1,
        is_draft: post.is_draft == 1,
        featured_image: post.featured_image || null,
        tags: post.tags || ''
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load post');
      setLoading(false);
    }
  };

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
    if (!formData.title) return;

    setAutoSaving(true);

    try {
      await api.updatePost({
        id: id,
        user_id: user.id,
        ...formData,
        is_draft: true 
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setTimeout(() => {
        setAutoSaving(false);
      }, 1000);
    }
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

    setSaving(true);

    try {
      await api.updatePost({
        id: id,
        user_id: user.id,
        ...formData,
        is_draft: isDraft
      });
      toast.success(isDraft ? 'Saved as draft!' : 'Post updated!');
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to update post. Please try again.');
      toast.error('Failed to update post');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="editor-container">
        <h3>Loading post...</h3>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Edit Journal Entry</h2>
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
            disabled={saving}
          >
            {saving ? 'Saving...' : '✅ Update Entry'}
          </Button>
          <Button 
            variant="outline-secondary"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
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
  );
}

export default EditPost;