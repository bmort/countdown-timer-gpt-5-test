import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { HomeEditor } from './pages/HomeEditor'
import { Player } from './pages/Player'

const router = createBrowserRouter([
  { path: '/', element: <HomeEditor /> },
  { path: '/timer', element: <Player /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
