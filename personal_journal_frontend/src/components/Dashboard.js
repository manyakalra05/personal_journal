import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, InputGroup, Badge, Alert, Row, Col, Tabs, Tab } from 'react-bootstrap';
import toast from 'react-hot-toast';
import api from '../services/api';
import WritingStreak from './WritingStreak';
import NotebookSidebar from './NotebookSidebar';
import { exportPostToPDF, calculateReadingTime } from '../utils/pdfExport';

function Dashboard({ user }) {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [user.id, selectedNotebook]);

  const fetchPosts = async () => {
    try {
      const response = await api.getPosts(user.id, null, selectedNotebook);
      setPosts(response.data);
      filterPosts(response.data, activeTab);
      setLoading(false);
    } catch (err) {
      setError('Failed to load posts');
      setLoading(false);
    }
  };

  const filterPosts = (allPosts, tab) => {
    let filtered = allPosts;
    
    if (tab === 'drafts') {
      filtered = allPosts.filter(p => p.is_draft == 1);
    } else if (tab === 'published') {
      filtered = allPosts.filter(p => p.is_draft == 0);
    }
    
    setFilteredPosts(filtered);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterPosts(posts, tab);
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      filterPosts(posts, activeTab);
    } else {
      try {
        const response = await api.searchPosts(term, user.id);
        filterPosts(response.data, activeTab);
      } catch (err) {
        console.error('Search failed:', err);
      }
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      setDeleteLoading(postId);
      try {
        await api.deletePost(postId, user.id);
        setPosts(posts.filter(p => p.id !== postId));
        filterPosts(posts.filter(p => p.id !== postId), activeTab);
        setDeleteLoading(null);
        toast.success('Post deleted successfully');
      } catch (err) {
        toast.error('Failed to delete post');
        setDeleteLoading(null);
      }
    }
  };

  const handlePinToggle = async (post) => {
    try {
      await api.updatePost({
        id: post.id,
        user_id: user.id,
        title: post.title,
        content: post.content,
        category_id: post.category_id,
        notebook_id: post.notebook_id,
        is_public: post.is_public,
        is_pinned: !post.is_pinned,
        is_draft: post.is_draft,
        featured_image: post.featured_image,
        tags: post.tags
      });
      toast.success(post.is_pinned ? 'Post unpinned' : 'Post pinned');
      fetchPosts();
    } catch (err) {
      toast.error('Failed to toggle pin');
    }
  };

  const handleExportPDF = (post) => {
    exportPostToPDF(post, user.username);
    toast.success('PDF exported!');
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center" style={{marginTop: '80px'}}>
        <div className="spinner"></div>
        <h3 style={{marginTop: '20px', color: 'var(--accent)'}}>Loading your journal...</h3>
      </div>
    );
  }

  const publishedCount = posts.filter(p => p.is_draft == 0).length;
  const draftCount = posts.filter(p => p.is_draft == 1).length;
  const publicCount = posts.filter(p => p.is_public == 1 && p.is_draft == 0).length;

  return (
    <Row>
      <Col md={3}>
        <WritingStreak user={user} />
        <NotebookSidebar 
          user={user} 
          onNotebookSelect={setSelectedNotebook}
          selectedNotebook={selectedNotebook}
        />
      </Col>

      <Col md={9}>
        <div className="dashboard-card" style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
          color: 'white',
          marginBottom: '32px',
          border: 'none'
        }}>
          <h2 style={{color: 'white', marginBottom: '8px'}}>
            Welcome back, {user.full_name || user.username}! ✨
          </h2>
          <p style={{margin: 0, opacity: 0.9}}>
            {posts.length === 0
              ? "Start your journaling journey today!"
              : `You have ${posts.length} ${posts.length === 1 ? 'entry' : 'entries'} in your journal.`
            }
          </p>
        </div>

        <div className="row mb-4">
          <div className="col-md-4">
            <div className="stats-card">
              <h3>{publishedCount}</h3>
              <p>Published</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stats-card">
              <h3>{draftCount}</h3>
              <p>Drafts</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stats-card">
              <h3>{publicCount}</h3>
              <p>Public</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '2px solid rgba(0,0,0,0.06)'
          }}>
            <h2 style={{margin: 0, border: 'none', padding: 0}}>My Journal Entries</h2>
            <Button
              as={Link}
              to="/create"
              variant="primary"
              style={{whiteSpace: 'nowrap'}}
            >
              ✏️ New Entry
            </Button>
          </div>
          
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabChange}
            className="mb-3"
          >
            <Tab eventKey="all" title="All Posts"></Tab>
            <Tab eventKey="published" title="Published"></Tab>
            <Tab eventKey="drafts" title={`Drafts (${draftCount})`}></Tab>
          </Tabs>

          {posts.length > 0 && (
            <div className="mb-4">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="🔍 Search your entries..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </InputGroup>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {filteredPosts.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? (
                <>
                  <h3>No entries found</h3>
                  <p>Try a different search term</p>
                </>
              ) : activeTab === 'drafts' ? (
                <>
                  <h3>📝 No drafts</h3>
                  <p>Start writing and save as draft</p>
                </>
              ) : (
                <>
                  <h3>📝 Your journal is empty</h3>
                  <p>Click "New Entry" above to start writing your first journal entry!</p>
                  <Button
                    as={Link}
                    to="/create"
                    variant="primary"
                    style={{marginTop: '20px'}}
                  >
                    Write Your First Entry
                  </Button>
                </>
              )}
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="post-card">
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

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
                  <h3 className="post-title" style={{margin: 0, flex: 1}}>
                    {post.is_pinned == 1 && '📌 '}
                    {post.is_draft == 1 && '📝 '}
                    {post.title}
                  </h3>
                </div>
                
                <div className="post-meta" style={{marginBottom: '12px'}}>
                  <Badge bg="info">{post.category_name || 'Uncategorized'}</Badge>
                  {post.notebook_name && (
                    <Badge bg="secondary">{post.notebook_name}</Badge>
                  )}
                  <Badge bg={post.is_public == 1 ? 'success' : 'secondary'}>
                    {post.is_public == 1 ? '🌐 Public' : '🔒 Private'}
                  </Badge>
                  {post.is_draft == 1 && (
                    <Badge bg="warning" text="dark">Draft</Badge>
                  )}
                  {post.tags && post.tags.split(',').map((tag, idx) => (
                    <Badge key={idx} bg="light" text="dark">#{tag.trim()}</Badge>
                  ))}
                </div>

                <div className="post-meta" style={{fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '12px'}}>
                  📅 {formatDate(post.created_at)} • ⏱️ {calculateReadingTime(post.content)} min read
                </div>
                
                <div className="post-content" style={{marginTop: '16px'}}>
                  {stripHtml(post.content).substring(0, 180)}
                  {stripHtml(post.content).length > 180 && '...'}
                </div>
                
                <div className="d-flex gap-2 flex-wrap mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate(`/edit/${post.id}`)}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handlePinToggle(post)}
                  >
                    {post.is_pinned == 1 ? '📌 Unpin' : '📍 Pin'}
                  </Button>
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => handleExportPDF(post)}
                  >
                    📄 Export PDF
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    disabled={deleteLoading === post.id}
                  >
                    {deleteLoading === post.id ? 'Deleting...' : '🗑️ Delete'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Col>
    </Row>
  );
}

export default Dashboard;