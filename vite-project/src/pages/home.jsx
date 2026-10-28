import React from 'react'
import Sidebar from '../components/sidebar'
import Feed from './posts/Feed'
import SuggestedUsers from '../components/SuggestedUsers'

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-6">

          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-[80px]">
              <Sidebar />
            </div>
          </aside>

          {/* CENTER FEED */}
          <main className="min-w-0">
            <Feed />
          </main>

          {/* RIGHT PANEL */}
          <aside className="hidden xl:block">
            <div className="sticky top-[80px]">
              <SuggestedUsers />
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}

export default Home