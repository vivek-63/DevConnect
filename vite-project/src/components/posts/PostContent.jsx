import React from 'react'

const PostContent = ({ post }) => {
  return (
    <p
    className="
    text-gray-700
    leading-7
    p-3
    "
>
    {post.content}
</p>
  )
}

export default PostContent