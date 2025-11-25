import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

function AppNavbar({ user, onLogout, darkMode, toggleDarkMode }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          📔 PersonalJournal
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {user ? (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/create">New Post</Nav.Link>
                <Nav.Link as={Link} to="/posts">Public Posts</Nav.Link>
                <Navbar.Text className="mx-3">
                  Hello, <strong>{user.username}</strong>
                </Navbar.Text>
                <Button 
                  variant="link" 
                  onClick={toggleDarkMode}
                  className="dark-mode-toggle"
                  title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {darkMode ? '☀️' : '🌙'}
                </Button>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
                <Nav.Link as={Link} to="/posts">Public Posts</Nav.Link>
                <Button 
                  variant="link" 
                  onClick={toggleDarkMode}
                  className="dark-mode-toggle"
                  title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {darkMode ? '☀️' : '🌙'}
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;