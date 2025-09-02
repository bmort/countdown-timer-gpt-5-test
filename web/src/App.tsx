import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { HomeEditor } from './pages/HomeEditor'
import { Player } from './pages/Player'

const router = createBrowserRouter(
  [
    { path: '/', element: <HomeEditor /> },
    { path: '/timer', element: <Player /> },
  ],
  {
    // Ensure routing works under GitHub Pages project base (Vite's BASE_URL)
    basename: import.meta.env.BASE_URL,
  },
)

export default function App() {
  return <RouterProvider router={router} />
}
