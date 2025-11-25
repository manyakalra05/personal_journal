import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import toast from 'react-hot-toast';
import api from '../services/api';
import { calculateReadingTime } from '../utils/pdfExport';

function PostDetail({ user }) {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await api.getPosts(null, id);
      setPost(response.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load post');
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmitting(true);

    try {
      await api.createComment({
        post_id: id,
        user_id: user.id,
        content: commentText
      });
      setCommentText('');
      toast.success('Comment added!');
      fetchPost(); 
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center" style={{marginTop: '80px'}}>
        <div className="spinner"></div>
        <h3 style={{marginTop: '20px'}}>Loading post...</h3>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center" style={{marginTop: '80px'}}>
        <h3>Post not found</h3>
        <Link to="/posts">
          <Button variant="primary">Back to Posts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <div className="mb-3">
        <Link to="/posts">← Back to Public Posts</Link>
      </div>

      <Card className="mb-4">
        <Card.Body>
          {post.featured_image && (
            <div className="mb-4">
              <img 
                src={post.featured_image} 
                alt={post.title} 
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }} 
              />
            </div>
          )}

          <h1 className="post-title">{post.title}</h1>

          <div className="post-meta mb-4">
            <span>✍️ By <strong>{post.full_name || post.username}</strong></span>
            <span className="ms-3">📅 {new Date(post.created_at).toLocaleDateString()}</span>
            <span className="ms-3">⏱️ {calculateReadingTime(post.content)} min read</span>
          </div>

          <div className="mb-3">
            {post.category_name && (
              <Badge bg="info" className="me-2">{post.category_name}</Badge>
            )}
            {post.tags && post.tags.split(',').map((tag, idx) => (
              <Badge key={idx} bg="light" text="dark" className="me-2">
                #{tag.trim()}
              </Badge>
            ))}
          </div>

          <div 
            className="post-content" 
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              fontSize: '1.1rem',
              lineHeight: '1.8',
              marginTop: '24px'
            }}
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h3 className="mb-4">💬 Comments ({post.comments?.length || 0})</h3>

          {user ? (
            <Form onSubmit={handleCommentSubmit} className="mb-4">
              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                />
              </Form.Group>
              <Button 
                type="submit" 
                variant="primary" 
                size="sm" 
                className="mt-2"
                disabled={submitting}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </Form>
          ) : (
            <Alert variant="info" className="mb-4">
              <Link to="/login">Login</Link> to leave a comment
            </Alert>
          )}

          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            <div className="comments-list">
              {post.comments.map(comment => (
                <div key={comment.id} className="comment-item mb-3 p-3" style={{
                  background: 'var(--light-gray)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.06)'
                }}>
                  <div className="comment-header mb-2">
                    <strong>{comment.full_name || comment.username}</strong>
                    <span className="text-muted ms-2" style={{fontSize: '0.85rem'}}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="comment-content">
                    {comment.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No comments yet. Be the first to comment!</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default PostDetail;