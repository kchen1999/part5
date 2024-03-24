import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import BlogForm from './components/Blogform'
import blogService from './services/blogs'
import loginService from './services/login'
import Togglable from './components/Togglable'
import LoginForm from './components/Loginform'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [NotificationMessage, setNotificationMessage] = useState(null)
  const [errorState, setErrorState] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(allBlogs => {
      const sortedBlogByLikes = allBlogs.sort((blog1, blog2) => blog2.likes - blog1.likes)
      setBlogs(sortedBlogByLikes)
    })
  }, [blogs])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if(loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const resetNotificationMessage = () => {
    setTimeout(() => {
      setNotificationMessage(null)
    }, 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password
      })
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      setNotificationMessage(null)
    }
    catch (exception) {
      setErrorState(true)
      setNotificationMessage('Wrong Credentials')
      resetNotificationMessage()
    }
  }


  const handleLogout = (event) => {
    event.preventDefault()
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  const addBlog = async (blogObject) => {
    try {
      blogFormRef.current.toggleVisibility()
      const blog = await blogService.create(blogObject)
      setBlogs(blogs.concat(blog))
      setErrorState(false)
      setNotificationMessage(`${blog.title} ${blog.author} added`)
      resetNotificationMessage()
    }
    catch(exception) {
      setErrorState(true)
      setNotificationMessage(exception)
      resetNotificationMessage()
    }
  }

  const updateBlog = async (id, blogObject) => {
    try {
      const updatedBlog = await blogService.update(id, blogObject)
      setBlogs(blogs.map(blog => blog.id === id ? updatedBlog : blog))
      setErrorState(false)
      setNotificationMessage(`${updatedBlog.title} ${updatedBlog.author} received a like`)
      resetNotificationMessage()
    }
    catch(exception) {
      setErrorState(true)
      setNotificationMessage(exception)
      resetNotificationMessage()
    }
  }

  const removeBlog = async (id, blogObject) => {
    try {
      await blogService.remove(id)
      setBlogs(blogs.filter(blog => blog.id !== id ))
      setErrorState(false)
      setNotificationMessage(`${blogObject.title} ${blogObject.author} removed`)
      resetNotificationMessage()
    }
    catch(exception) {
      setErrorState(true)
      setNotificationMessage(exception)
      resetNotificationMessage()
    }
  }

  if (user === null) {
    return (
      <div>
        <h2>log in to application</h2>
        <Notification message={NotificationMessage} errorState={errorState}/>
        <LoginForm
          handleLogin={handleLogin}
          handleUserNameChange={({ target }) => setUsername(target.value)}
          handlePasswordChange={({ target }) => setPassword(target.value)}
          username={username}
          password={password}
        />
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={NotificationMessage} errorState={errorState}/>
      <form onSubmit={handleLogout}>
        <p>{user.name} logged-in</p><button type="submit">logout</button>
      </form>
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={addBlog} />
      </Togglable>
      <div className='blogElements'>
        {blogs.map(blog =>
          <Blog key={blog.id} blog={blog} user={user} updateBlog={updateBlog} removeBlog={removeBlog}/>
        )}
      </div>
    </div>
  )
}

export default App