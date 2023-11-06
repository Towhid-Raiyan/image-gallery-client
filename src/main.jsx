import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Gallery from './components/Gallery.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Gallery></Gallery>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode className='max-w-7xl mx-auto'>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
