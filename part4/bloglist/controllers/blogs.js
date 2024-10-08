const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', (request, response) => {
  Blog.findById(request.params.id).then(blog => {
    response.json(blog)
  })
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  if(!body.title || !body.url) {
    return response.status(400).json({ error: 'Title or URL missing' })
  }

  const blog = new Blog({
    url: body.url,
    title: body.title,
    author: body.author,
    user: request.user._id,
    likes: body.likes === undefined ? 0 : body.likes
  })



  const savedBlog = await blog.save()

  request.user.blogs = request.user.blogs.concat(savedBlog._id)
  await request.user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const deletedBlog = await Blog.findById(request.params.id)
  if (deletedBlog === null) {
    return response.status(404).json({ error: 'blog not found' })
  } else if (deletedBlog.user.toString() === request.user._id.toString()) {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  }

})

module.exports = blogsRouter