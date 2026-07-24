import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Post from '@/pages/Post'
import Tags from '@/pages/Tags'
import Tag from '@/pages/Tag'
import Module from '@/pages/Module'
import About from '@/pages/About'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<Post />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/tag/:tag" element={<Tag />} />
          <Route path="/module/:id" element={<Module />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
