
import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/init-firebase';
import { ref as dbref, push, update, remove, get, child } from 'firebase/database';
import { toast } from 'react-toastify';
import BlogEditor from '../../components/Blog/BlogEditor';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCalendar,
  FaUser,
  FaTag
} from 'react-icons/fa';

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const db = dbref(database);
      const snapshot = await get(child(db, '/blogs/'));
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const blogsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setBlogs(blogsArray);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = () => {
    setEditingBlog(null);
    setShowEditor(true);
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setShowEditor(true);
  };

  const handleSaveBlog = async (blogData) => {
    try {
      setSaving(true);
      
      if (editingBlog) {
        // Update existing blog
        await update(dbref(database, `/blogs/${editingBlog.id}`), {
          ...blogData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Blog updated successfully!');
      } else {
        // Create new blog
        const blogId = push(dbref(database, '/blogs/')).key;
        await update(dbref(database, `/blogs/${blogId}`), {
          ...blogData,
          id: blogId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        toast.success('Blog created successfully!');
      }
      
      setShowEditor(false);
      setEditingBlog(null);
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await remove(dbref(database, `/blogs/${blogId}`));
        toast.success('Blog deleted successfully!');
        fetchBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error('Failed to delete blog');
      }
    }
  };

  const handleStatusChange = async (blogId, newStatus) => {
    try {
      await update(dbref(database, `/blogs/${blogId}`), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Blog ${newStatus.toLowerCase()} successfully!`);
      fetchBlogs();
    } catch (error) {
      console.error('Error updating blog status:', error);
      toast.error('Failed to update blog status');
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || blog.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || blog.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return '#28a745';
      case 'draft': return '#ffc107';
      case 'archived': return '#6c757d';
      default: return '#007bff';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const categories = ['All', 'Technology', 'Education', 'Research', 'Innovation', 'Industry', 'Career', 'News', 'Events'];
  const statuses = ['All', 'draft', 'published', 'archived'];

  if (loading) {
    return (
      <div className="blog-management-loading">
        <div className="loading-spinner"></div>
        <p>Loading blogs...</p>
      </div>
    );
  }

  return (
    <div className="blog-management">
      <div className="blog-header">
        <div className="header-left">
          <h1>Blog Management</h1>
          <p>Create, edit, and manage blog posts</p>
        </div>
        <button onClick={handleCreateBlog} className="create-blog-btn">
          <FaPlus /> Create New Blog
        </button>
      </div>

      <div className="blog-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="blog-stats">
        <div className="stat-card">
          <h3>{blogs.length}</h3>
          <p>Total Blogs</p>
        </div>
        <div className="stat-card">
          <h3>{blogs.filter(b => b.status?.toLowerCase() === 'published').length}</h3>
          <p>Published</p>
        </div>
        <div className="stat-card">
          <h3>{blogs.filter(b => b.status?.toLowerCase() === 'draft').length}</h3>
          <p>Drafts</p>
        </div>
        <div className="stat-card">
          <h3>{blogs.filter(b => b.status?.toLowerCase() === 'archived').length}</h3>
          <p>Archived</p>
        </div>
      </div>

      <div className="blog-list">
        {filteredBlogs.map(blog => (
          <div key={blog.id} className="blog-card">
            <div className="blog-header">
              <h2>{blog.title}</h2>
              <div className="blog-meta">
                <span className="author"><FaUser /> {blog.author}</span>
                <span className="date"><FaCalendar /> {formatDate(blog.createdAt)}</span>
                <span className="category"><FaTag /> {blog.category || 'Uncategorized'}</span>
              </div>
            </div>
            
            <div className="blog-content">
              <p>{blog.content.substring(0, 200)}...</p>
            </div>
            
            <div className="blog-footer">
              <div className="status-badge" style={{ backgroundColor: getStatusColor(blog.status) }}>
                {blog.status?.charAt(0).toUpperCase() + blog.status?.slice(1).toLowerCase()}
              </div>
              <div className="actions">
                <button onClick={() => handleEditBlog(blog)} className="edit-btn">
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handleDeleteBlog(blog.id)} className="delete-btn">
                  <FaTrash /> Delete
                </button>
                <button onClick={() => handleStatusChange(blog.id, blog.status?.toLowerCase() === 'published' ? 'draft' : 'published')} className="status-btn">
                  {blog.status?.toLowerCase() === 'published' ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showEditor && (
        <BlogEditor
          blog={editingBlog}
          onSave={handleSaveBlog}
          onCancel={() => {
            setShowEditor(false);
            setEditingBlog(null);
          }}
          saving={saving}
        />
      )}
    </div>
  );
};

export default BlogManagement;
