import { useState } from 'react'

const Blog = ({ blog, user, updateBlog, removeBlog }) => {
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => setVisible(!visible)

  const removeBlogHandler = (blog) => {
    if(window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      return removeBlog(blog.id, blog)
    }
    else {
      return
    }
  }


  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const paragraphStyle = {
    margin: 0
  }

  return (
    <div className='blogInfo' style={blogStyle}>
      <span style={paragraphStyle}>{blog.title} {blog.author}</span><button onClick={toggleVisibility}>{visible ? 'hide' : 'view'}</button>
      <div className='blogInfoAll' style={showWhenVisible}>
        <p style={paragraphStyle}>{blog.url}</p>
        <p style={paragraphStyle}>likes {blog.likes} <button onClick={() => updateBlog(blog.id, { ...blog, likes: blog.likes + 1 })}>like</button> </p>
        <p style={paragraphStyle}>{blog.user.name} {user.name === blog.user.name ? <button onClick={ () => removeBlogHandler(blog)}>remove</button> : ''}</p>
      </div>
    </div>
  )}

export default Blog