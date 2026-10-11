import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Register from './pages/Register'
import Admin from './pages/Admin'
import Team from './pages/Team'

export default function App() {
  return <BrowserRouter><Layout><Routes><Route path="/" element={<Navigate to="/team" replace/>}/><Route path="/register" element={<Register/>}/><Route path="/admin" element={<Admin/>}/><Route path="/team" element={<Team/>}/><Route path="*" element={<Navigate to="/team" replace/>}/></Routes></Layout></BrowserRouter>
}
