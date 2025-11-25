import axios from 'axios';

const API_BASE_URL = 'http://localhost/personal_journal_backend/api';

const api = {
  register: (userData) => {
    return axios.post(`${API_BASE_URL}/auth/register.php`, userData);
  },
  
  login: (credentials) => {
    return axios.post(`${API_BASE_URL}/auth/login.php`, credentials);
  },
  
  createPost: (postData) => {
    return axios.post(`${API_BASE_URL}/posts/create.php`, postData);
  },
  
  getPosts: (userId = null, postId = null, notebookId = null, draftsOnly = false) => {
    let url = `${API_BASE_URL}/posts/read.php`;
    const params = [];
    if (userId) params.push(`user_id=${userId}`);
    if (postId) params.push(`post_id=${postId}`);
    if (notebookId) params.push(`notebook_id=${notebookId}`);
    if (draftsOnly) params.push(`drafts_only=true`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return axios.get(url);
  },
  
  updatePost: (postData) => {
    return axios.put(`${API_BASE_URL}/posts/update.php`, postData);
  },
  
  deletePost: (postId, userId) => {
    return axios.delete(`${API_BASE_URL}/posts/delete.php`, {
      data: { id: postId, user_id: userId }
    });
  },
  
  searchPosts: (searchTerm, userId = null) => {
    let url = `${API_BASE_URL}/posts/search.php?q=${encodeURIComponent(searchTerm)}`;
    if (userId) url += `&user_id=${userId}`;
    return axios.get(url);
  },
  
  getCategories: () => {
    return axios.get(`${API_BASE_URL}/categories/list.php`);
  },
  
  getNotebooks: (userId) => {
    return axios.get(`${API_BASE_URL}/notebooks/list.php?user_id=${userId}`);
  },
  
  createNotebook: (notebookData) => {
    return axios.post(`${API_BASE_URL}/notebooks/create.php`, notebookData);
  },
  
  getRandomPrompt: () => {
    return axios.get(`${API_BASE_URL}/prompts/random.php`);
  },
  
  createComment: (commentData) => {
    return axios.post(`${API_BASE_URL}/comments/create.php`, commentData);
  },
  
  getStreak: (userId) => {
    return axios.get(`${API_BASE_URL}/streaks/get.php?user_id=${userId}`);
  }
};

export default api;