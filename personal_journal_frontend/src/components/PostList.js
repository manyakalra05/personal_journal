import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { calculateReadingTime } from '../utils/pdfExport';

function PostList({ user }) {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicPosts();
  }, []);

  const fetchPublicPosts = async () => {
    try {
      const response = await api.getPosts();
      setPosts(response.data);
      setFilteredPosts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load public posts');
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      setFilteredPosts(posts);
    } else {
      try {
        const response = await api.searchPosts(term);
        setFilteredPosts(response.data);
      } catch (err) {
        console.error('Search failed:', err);
      }
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (loading) {
    return (
      <div className="text-center" style={{marginTop: '80px'}}>
        <div className="spinner"></div>
        <h3 style={{marginTop: '20px'}}>Loading posts...</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-card mb-4">
        <h2 className="mb-4">Public Journal Entries</h2>
        
        <InputGroup className="mb-4">
          <Form.Control
            type="text"
            placeholder="Search public posts..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </InputGroup>

        {error && <Alert variant="danger">{error}</Alert>}

        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <h3>No public posts found</h3>
            <p>Be the first to share your thoughts!</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <Link 
              to={`/post/${post.id}`} 
              key={post.id} 
              style={{textDecoration: 'none', color: 'inherit'}}
            >
              <div className="post-card">
                {post.featured_image && (
                  <div className="post-featured-image mb-3">
                    <img src={post.featured_image} alt={post.title} style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }} />
                  </div>
                )}

                <h3 className="post-title">{post.title}</h3>
                
                <div className="post-meta">
                  <span>✍️ By <strong>{post.full_name || post.username}</strong></span>
                  <span className="ms-3">
                    <Badge bg="info">{post.category_name || 'Uncategorized'}</Badge>
                  </span>
                  {post.notebook_name && (
                    <Badge bg="secondary" className="ms-1">{post.notebook_name}</Badge>
                  )}
                  {post.tags && post.tags.split(',').map((tag, idx) => (
                    <Badge key={idx} bg="light" text="dark" className="ms-1">
                      #{tag.trim()}
                    </Badge>
                  ))}
                </div>

                <div className="post-meta" style={{fontSize: '0.85rem', marginTop: '8px'}}>
                  📅 {new Date(post.created_at).toLocaleDateString()} • 
                  ⏱️ {calculateReadingTime(post.content)} min read •
                  💬 {post.comment_count || 0} {post.comment_count === 1 ? 'comment' : 'comments'}
                </div>
                
                <div className="post-content" style={{marginTop: '16px'}}>
                  {stripHtml(post.content).substring(0, 200)}
                  {stripHtml(post.content).length > 200 && '...'}
                </div>

                <div style={{marginTop: '12px', color: 'var(--accent)', fontWeight: '600'}}>
                  Read more →
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default PostList;