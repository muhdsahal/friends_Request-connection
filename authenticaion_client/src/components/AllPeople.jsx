import React, { useEffect, useState } from 'react';
import {
    List,
    ListItem,
    ListItemPrefix,
    Avatar,
    Card,
    Typography,
    Button,
} from "@material-tailwind/react";
import _ from 'lodash';
import axios from 'axios';
import { BASE_URL } from '../constants/constants';

const AllPeople = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [query, setQuery] = useState('');
    const [friendRequestStatus, setFriendRequestStatus] = useState({});
    const [friendRequestTimestamps, setFriendRequestTimestamps] = useState([]);

    useEffect(() => {
        const fetchAllUsers = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${BASE_URL}auth/all_users/`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                setUsers(response.data.results);
                console.log(response.data.results);
            } catch (err) {
                setError('Error fetching users');
            } finally {
                setLoading(false);
            }
        };

        fetchAllUsers();
    }, []);

    const fetchUsers = async (searchQuery, page) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BASE_URL}auth/all_users/`, {
                params: { page: page, search: searchQuery },
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                }
            });
            setUsers(response.data.results);
            setTotalPages(Math.ceil(response.data.count / 10));
        } catch (error) {
            setError("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetchUsers = _.debounce((searchQuery, page) => {
        fetchUsers(searchQuery, page);
    }, 300);

    useEffect(() => {
        fetchUsers(query, page);
    }, [page]);

    useEffect(() => {
        if (query) {
            debouncedFetchUsers(query, page);
        } else {
            setUsers([]);
        }
        return () => {
            debouncedFetchUsers.cancel();
        };
    }, [query]);

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const sendFriendRequest = async (toUserId) => {
        const now = new Date().getTime();
        const oneMinuteAgo = now - 60000;

        // Filter timestamps to only include those within the last minute
        const recentRequests = friendRequestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);

        if (recentRequests.length >= 3) {
            alert('You can only send 3 friend requests per minute. Please try again later.');
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}auth/send_friend_request/`, 
            { to_user: toUserId }, 
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                }
            });

            // Update the friend request status for the user
            setFriendRequestStatus(prevStatus => ({ ...prevStatus, [toUserId]: 'sent' }));
            setFriendRequestTimestamps([...recentRequests, now]); // Update timestamps with the new request
            alert('Friend request sent successfully');
        } catch (error) {
            if (error.response && error.response.data.detail) {
                alert(error.response.data.detail);
            } else {
                alert('Error sending friend request');
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className='flex justify-start m-5'>
            <Card className="w-96">
                <Typography className='text-center font-sans font-bold text-[#100610]'>ALL PEOPLE</Typography>

                <input
                    className='w-full h-10 bg-[#3e547a] text-white'
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search users..."
                />
                {loading && <p>Loading...</p>}
                <List>
                    {users.length > 0 ? (
                        users.map(user => (
                            <ListItem key={user.id}>
                                <ListItemPrefix>
                                    <Avatar
                                        variant="circular"
                                        alt={user.username}
                                        src={user.profile_photo ? user.profile_photo : 'https://docs.material-tailwind.com/img/face-1.jpg'}
                                    />
                                </ListItemPrefix>
                                <div>
                                    <Typography variant="h6" color="blue-gray">
                                        {user.username}
                                    </Typography>
                                    <Typography variant="small" color="gray" className="font-normal">
                                        {user.email}
                                    </Typography>
                                </div>
                                <Button 
                                    onClick={() => sendFriendRequest(user.id)}
                                    disabled={friendRequestStatus[user.id] === 'sent'}
                                    className='bg-blue-500 text-white ml-4'
                                >
                                    {friendRequestStatus[user.id] === 'sent' ? 'Request Sent' : 'Add Friend'}
                                </Button>
                            </ListItem>
                        ))
                    ) : (
                        <p>No users found</p>
                    )}
                </List>
                <div className='flex justify-center'>
                    <Button className='W-10 bg-[#ec1818fc] text-white m-3' onClick={handlePreviousPage} disabled={page === 1}>Previous</Button>
                    <Button className='W-10 bg-[#1897ecfc] text-white m-3' onClick={handleNextPage} disabled={page === totalPages}>Next</Button>
                </div>
            </Card>
        </div>
    );
}

export default AllPeople;
