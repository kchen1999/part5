import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Blog from './Blog'

test('renders blog title and author by default', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Kevin',
    url: 'www.testBlog.com',
    user: ''
  }

  const currentUser = {
    username: 'artohellas',
    name: 'Arto Hellas' }

  const { container } = render(<Blog blog={blog} user={currentUser}/>)

  const div = container.querySelector('.blogInfo')
  expect(div).toHaveTextContent(
    'Component testing is done with react-testing-library'
  )
  expect(div).toHaveTextContent(
    'Kevin'
  )
})

test('after clicking button URL and number of likes are displayed', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Kevin',
    url: 'www.testBlog.com',
    user: ''
  }

  const currentUser = {
    username: 'artohellas',
    name: 'Arto Hellas' }

  const { container } = render(<Blog blog={blog} user={currentUser}/>)

  const div = container.querySelector('.blogInfoAll')

  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)

  expect(div).not.toHaveStyle('display: none')

  expect(div).toHaveTextContent(
    'www.testBlog.com'
  )
  expect(div).toHaveTextContent(
    'likes'
  )
})

test('clicking like button twice calls event handler twice', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Kevin',
    url: 'www.testBlog.com',
    user: ''
  }

  const currentUser = {
    username: 'artohellas',
    name: 'Arto Hellas' }

  const mockHandler = vi.fn()

  render(<Blog blog={blog} user={currentUser} updateBlog={mockHandler}/>)

  const user = userEvent.setup()
  const button = screen.getByText('like')
  await user.click(button)
  await user.click(button)

  expect(mockHandler.mock.calls).toHaveLength(2)

})

