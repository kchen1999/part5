const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async({page, request}) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukai',
        password: 'salainen'
      }
    })
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('log in to application')).toBeVisible()
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()

  })

  describe('Login', () => {
    test('succeeds with correct credentials', async({ page }) => {
      await loginWith(page, 'mluukai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged-in')).toBeVisible()
    })
    test('fails with wrong credentials', async({ page }) => {
      await loginWith(page, 'mluukai', 'wrong')
      const errorDiv = await page.locator('.error')
      await expect(errorDiv).toContainText('Wrong Credentials')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
      await expect(page.getByText('Matti Luukkainen logged-in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukai', 'salainen')
    })
    test('a new blog can be created', async ({ page }) => {
      await createBlog(page,'Test Blog', 'Mr Tester', 'www.testblog.com')
      await expect(page.getByText('Test Blog Mr Tester', { exact: true })).toBeVisible()
    })
  })

  describe('after a user has created a blog', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukai', 'salainen')
      await createBlog(page,'Test Blog', 'Mr Tester', 'www.testblog.com')
    })
    test('a new blog can be edited', async ({ page }) => {
      await page.getByRole('button', { name: 'view'}).click()
      await page.getByRole('button', { name: 'like'}).click()
      await expect(page.getByText('Test Blog Mr Tester received a like')).toBeVisible()
      await expect(page.getByText('likes 1')).toBeVisible()
    })
    test('user who added the blog can delete the blog', async ({ page }) => {
      await page.getByRole('button', { name: 'view'}).click()
      page.on('dialog', dialog => dialog.accept())
      await expect(page.getByRole('button', { name: 'remove'})).toBeVisible()
      await page.getByRole('button', { name: 'remove'}).click()
      const successDiv = await page.locator('.success')
      await expect(successDiv).toContainText('Test Blog Mr Tester removed')
      await expect(successDiv).toHaveCSS('color', 'rgb(0, 128, 0)')
      await expect(page.getByText('Test Blog Mr Tester', { exact: true })).not.toBeVisible()
    })
    test('only user who added the blog sees the delete button', async ({ page, request }) => {
      await page.getByRole('button', { name: 'logout'}).click()
      await request.post('http://localhost:3003/api/users', {
        data: {
          name: 'Arto Hellas',
          username: 'artohellas',
          password: 'salainen'
      }
     })
      await loginWith(page, 'artohellas', 'salainen')
      await expect(page.getByText('Arto Hellas logged-in')).toBeVisible()
      await expect(page.getByText('Test Blog Mr Tester', { exact: true })).toBeVisible()
      await page.getByRole('button', { name: 'view'}).click()
      await expect(page.getByRole('button', { name: 'remove'})).not.toBeVisible()
    })
    test('ensure blogs are arranged in order of number of likes', async ({ page, request }) => {
   
      await createBlog(page,'Test Blog 2', 'Mr Tester 2', 'www.testblog2.com')
      await createBlog(page,'Test Blog 3', 'Mr Tester 3', 'www.testblog3.com')

      const secondBlogElement = await page.getByText('Test Blog 2 Mr Tester 2', { exact: true }).locator('..')
      await secondBlogElement.getByRole('button', { name: 'view'}).click()
      await secondBlogElement.getByRole('button', { name: 'like'}).click()
      await expect(secondBlogElement.getByText('likes 1')).toBeVisible() 
      await secondBlogElement.getByRole('button', { name: 'like'}).click()
      await expect(secondBlogElement.getByText('likes 2')).toBeVisible() 
      await secondBlogElement.getByRole('button', { name: 'like'}).click()
      await expect(secondBlogElement.getByText('likes 3')).toBeVisible() 
      await secondBlogElement.getByRole('button', { name: 'like'}).click()
      await expect(secondBlogElement.getByText('likes 4')).toBeVisible() 
  
      const thirdBlogElement = await page.getByText('Test Blog 3 Mr Tester 3', { exact: true }).locator('..')
      await thirdBlogElement.getByRole('button', { name: 'view'}).click()
      await thirdBlogElement.getByRole('button', { name: 'like'}).click()
      await expect(thirdBlogElement.getByText('likes 1')).toBeVisible() 
      await thirdBlogElement.getByRole('button', { name: 'like'}).click()
      await expect(thirdBlogElement.getByText('likes 2')).toBeVisible() 


      const blogElements = await page.locator('.blogElements > div').all()
      await expect(blogElements[0].getByText('Test Blog 2 Mr Tester 2', { exact: true })).toBeVisible()
      await expect(blogElements[1].getByText('Test Blog 3 Mr Tester 3', { exact: true })).toBeVisible()
      await expect(blogElements[2].getByText('Test Blog Mr Tester', { exact: true })).toBeVisible()

    })
  })

})