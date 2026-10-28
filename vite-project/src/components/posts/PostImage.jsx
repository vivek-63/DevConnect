import React from 'react'

const PostImage = ({ post }) => {
  return (
    <>
    
    {
    post.image && (

        <img
            src={post.image}
            className="
            w-full
            mt-5
            max-h-[500px]
            object-cover
            "
        />

    )
}
</>
  )
}

export default PostImage