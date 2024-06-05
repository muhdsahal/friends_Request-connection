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
import axios from 'axios';
import { BASE_URL } from '../constants/constants';

const FriendRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFriendRequests = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${BASE_URL}auth/friendrequests/status/`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                setRequests(response.data);
            } catch (err) {
                setError('Error fetching friend requests');
            } finally {
                setLoading(false);
            }
        };

        fetchFriendRequests();
    }, []);

    const handleFriendRequest = async (requestId, accepted) => {
        try {
            const response = await axios.patch(
                `${BASE_URL}auth/accept_reject_friend_request/${requestId}/`, 
                { accepted :false },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    }
                }
            );
            setRequests(prevRequests => prevRequests.filter(request => request.id !== requestId));
            alert(`Friend request ${accepted ? 'accepted' : 'rejected'} successfully`);
        } catch (error) {
            alert(`Error ${accepted ? 'accepting' : 'rejecting'} friend request`);
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
                <Typography className='text-center font-sans font-bold text-[#100610]'>Friend Requests</Typography>
                {requests.length > 0 ? (
                    <List>
                        {requests.map(request => (
                            <ListItem key={request.id}>
                                <ListItemPrefix>
                                    <Avatar
                                        variant="circular"
                                        alt={request.to_user.username}
                                        src={request.to_user.profile_photo ? request.to_user.profile_photo : 'https://docs.material-tailwind.com/img/face-1.jpg'}
                                    />
                                </ListItemPrefix>
                                <div>
                                    <Typography variant="h6" color="blue-gray">
                                        {request.to_user.username}
                                    </Typography>
                                    <Typography variant="small" color="gray" className="font-normal">
                                        {request.to_user.email}
                                    </Typography>
                                </div>
                                <Button
                                    onClick={() => handleFriendRequest(request.id, {accepted:true})}
                                    className='bg-green-500 text-white ml-4'
                                >
                                    Accept
                                </Button>
                                <Button
                                    onClick={() => handleFriendRequest(request.id, {accepted:false})}
                                    className='bg-red-500 text-white ml-4'
                                >
                                    Reject
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <p>No friend requests found</p>
                )}
            </Card>
        </div>
    );
}

export default FriendRequests;
