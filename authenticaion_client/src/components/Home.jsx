import { Button } from '@material-tailwind/react';
import  {jwtDecode}  from 'jwt-decode'
import React from 'react'
import { useNavigate } from 'react-router-dom';
import  {Navbar}  from './Navbar';
import AllPeople from './AllPeople';
import FriendRequests from './FriendRequests';


const Home = () => {

  const navigate = useNavigate()
  console.log(localStorage.getItem('token'),'kkkkkkkkkkkkkkkkkkkk');
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token)
  console.log(decoded.id);
 

  
  return (
    <div className='bg-[#558899] min-h-screen'>
      <Navbar/>
      
      <div className=''>
        <h1
          className="text-[90px] md:text-[50px] text-center text-[#6eb527fb] hover:  font-serif ">
          userid : {decoded.id}
        </h1>

        <h1
          className="text-[90px] md:text-[50px] text-center text-[#6eb527fb] hover:  font-serif ">
          username : {decoded.username}
        </h1>
        <AllPeople/>
        <FriendRequests/>
      </div>
    </div>
  )
}

export default Home