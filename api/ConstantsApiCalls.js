import axios from './axios';

const USER_DATA_CALL_API = '/auth/getUser';
const CLUB_USER_DATA_CALL_API = "/club/getClub";

const GET_ALL_USERS_URL = '/admin/getUsers'
const GET_ALL_CATEGORIES_URL = '/category/getAllCategoreis'
const GET_ALL_CLUBS_URL = '/club/getAllClubs';
const EDIT_CLUB_ADMIN_URL = '/admin/editClub'
const EDIT_CLUB_MANAGER_URL = '/club/editClub'
const CLUBS_CATEGORIES_CALL_API = "/club/getAllClubsCategory"
const GET_ALL_CLUB_EVENTS_CALL_API = "/event/eventsByClub/"
const CREATE_EVENT_URL = '/event/createEvent'
const DELETE_EVENT_URL = `/event/deleteevent/`;
const EVENT_CALL_API = '/event/getallevents';
const EDIT_EVENT_MANAGER_URL = '/event/edit-full-event'
const GET_ALL_EVENT_SPONSORS_SPEAKERS_CALL_API = '/event/getallevent-speakers-sponsors/';
const GET_ALL_EVENTS_CATEGORIES_CALL_API = '/event/getalleventscategories';
const CREAT_CLUB_BY_ADMIN_URL = '/admin/createClub'
const CREAT_CLUB_BY_STUDENT_URL = '/club/createClub'
const CLEAR_NOTIFICATION_TOKEN_URL = '/notification/clear-token'

//Actions APIs ****************************************************************
const DELETE_CLUB_URL = '/admin/deleteClub/';
const ACTIVATE_CLUB_URL = '/admin/activateClub/';
const REJECT_CLUB_URL = '/admin/rejectClub';
const DEACTIVATE_CLUB_URL = '/admin/deactivateClub';
const ACTIVATE_EVENT_URL = '/admin/activateEvent/';
const REJECT_EVENT_URL = '/admin/rejectEvent';
const DEACTIVATE_EVENT_URL = '/admin/deactivateEvent';

//Notifications APIs ****************************************************************
const GET_ALL_ADMIN_NOTIFICATIONS = 'admin/getAdminNotifications/';
const GET_ALL_CLUB_NOTIFICATIONS = 'club/getClubNotifications/';
const READ_CLUB_NOTIFICATION = 'club/read-notification/';
const READ_ADMIN_NOTIFICATION = 'admin/read-notification-user/';
const READ_EVENT_NOTIFICATION = 'event/read-notification/';

export async function getUserData(storedJwt, handleLogout) {
    if (!storedJwt) return null;

    try {
        const response = await axios.get(USER_DATA_CALL_API, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${storedJwt}`,
            },
        });

        if (response.status === 200) {
            return response.data; // Return user data if successful
        } else if (response.status === 401) {
            console.error("Authorization expired, logging out...");
            handleLogout();
        } else {
            console.error("Error fetching user data:", response.status);
            handleLogout();
        }
    } catch (error) {
        console.error("Error fetching user data:", error.message);
        handleLogout();
    }

    return null;
}
export async function getClubData(storedJwt) {
    if (!storedJwt) return null;

    try {
        const response = await axios.get(CLUB_USER_DATA_CALL_API, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${storedJwt}`,
            },
        });

        if (response.status === 200) {
            return response.data; // Return club data if successful
        } else if (response.status === 404) {
            console.warn("No club data found for the user.");
            return null; // Return null if the user has no club
        } else if (response.status === 401) {
            console.error("Authorization expired, logging out...");
        } else {
            console.error("Error fetching club data:", response.status);
        }
    } catch (error) {
        console.error("Error fetching club data:", error.message);
    }

    return null;
}
export async function getAllUsers(storedJwt, user, openSuccessMassage, openAlertMassage) {

    if (storedJwt && user && user.authority.authorityName === 'ROLE_ADMIN') {
        try {
            const response = await axios.get(GET_ALL_USERS_URL, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`,
                },
            });
            if (response.status === 200) {
                return response.data;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else {
                openAlertMassage(
                    'Something Went Wrong. We are sorry, please try reloading the page.'
                );
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
        }
    }
    return null;
}

export async function getAllCategories(storedJwt, user, openSuccessMassage, openAlertMassage) {
    if (storedJwt) {
        try {
            const response = await axios.get(GET_ALL_CATEGORIES_URL, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`,
                },
            });
            if (response.status === 200) {
                return response.data;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 404) {
                return response.data;
            } else {
                openAlertMassage(
                    'Something Went Wrong. We are sorry, please try reloading the page.'
                );
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
        }
    }
    return null;
}

export async function getAllEvents(storedJwt, openSuccessMassage, openAlertMassage) {
    if (storedJwt) {
        try {
            const response = await axios.get(EVENT_CALL_API, {
                headers: {
                    Authorization: `Bearer ${storedJwt}`
                }
            });

            if (response.status === 200) {
                return (response.data);
            } else if (error.response) {
                switch (error.response.status) {
                    case 401:
                        openAlertMassage('Session expired, please login again');
                        break;
                    case 403:
                        openAlertMassage('Unauthorized access');
                        break;
                    case 404:
                        openAlertMassage('Endpoint not found');
                        break;
                    default:
                        openAlertMassage('Failed to load events');
                }
            } else {
                openAlertMassage('Network error - check your connection');
            }
        } catch (error) {
            console.error('Fetch error:', error);

        }
        return null;
    }
}

export async function getAllClubs(storedJwt, openSuccessMassage, openAlertMassage) {
    if (storedJwt) {
        try {
            const response = await axios.get(GET_ALL_CLUBS_URL, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`,
                },
            });
            if (response.status === 200) {
                return response.data;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else {
                openAlertMassage(
                    'Something Went Wrong. We are sorry, please try reloading the page.'
                );
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
        }
    }
    return null;
}

//******************************************CLUB****************************************************************************
export async function editClubManager(
    storedJwt, user, openSuccessMassage, openAlertMassage, clubManager, clubToEdit, clubCategories) {

    if (storedJwt && user
        && user.userID === clubManager.userID) {
        try {
            const response = await axios.put(EDIT_CLUB_MANAGER_URL,
                JSON.stringify(
                    {
                        userID: clubManager.userID,
                        club: {
                            clubID: clubToEdit.clubID,
                            clubName: clubToEdit.clubName,
                            clubDescription: clubToEdit.clubDescription,
                            clubCoverPicURL: clubToEdit.clubCoverPicURL,
                            contactEmail: clubToEdit.contactEmail,
                            contactNumber: clubToEdit.contactNumber,
                            clubProfilePicURL: clubToEdit.clubProfilePicURL,
                        },
                        category: clubCategories,

                    }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`,
                    },
                    withCredentials: true,
                });

            if (response.status === 200) {
                openSuccessMassage('Club was Updated successfully.');
                console.log('response',response.data);
                return true;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 409) {
                openAlertMassage('Club name is already in use! \n Please try Different name ');
            } else if (response.status === 502) {
                openAlertMassage('user already has a Club !!');
            } else {
                openAlertMassage(
                    'Something Went Wrong. We are sorry, please try reloading the page.'
                );
            }

        } catch (error) {
            console.error(error?.message || 'Unknown error');
            if (error.status === 409) {
                openAlertMassage('Club name is already in use! \n Please try Different name ');
            } else if (response.status === 502) {
                openAlertMassage('user already has a Club !!');
            }

        }
    }
    return false;
}

export async function CreatClubByAdmin(
    storedJwt, user, openSuccessMassage, openAlertMassage, clubManager, clubToBeCreated, clubCategories) {

    if (storedJwt && user && user.authority.authorityName === 'ROLE_ADMIN') {
        try {
            const response = await axios.post(CREAT_CLUB_BY_ADMIN_URL,
                JSON.stringify(
                    {
                        userID: clubManager.userID,
                        club: clubToBeCreated,
                        category: clubCategories,
                    }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`,
                    },
                    withCredentials: true,
                });

            if (response.status === 200) {
                return true;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 409) {
                openAlertMassage('Club name is already in use! \n Please try Different name ');
            } else if (response.status === 502) {
                openAlertMassage('user already has a Club !!');
            } else {
                openAlertMassage(
                    'Something Went Wrong. We are sorry, please try reloading the page.'
                );
            }

        } catch (error) {
            console.error(error?.message || 'Unknown error');
            if (error.status === 409) {
                openAlertMassage('Club name is already in use! \n Please try Different name ');
            } else if (error.status === 502) {
                openAlertMassage('user already has a Club !!');
            }

        }
    }
    return false;
}

export async function CreatClubByStudent(
    storedJwt, user, openSuccessMassage, openAlertMassage, clubToBeCreated, clubCategories) {

    if (storedJwt && user && user.authority.authorityName === 'ROLE_STUDENT') {
        try {
            const response = await axios.post(CREAT_CLUB_BY_STUDENT_URL,
                JSON.stringify(
                    {
                        club: clubToBeCreated,
                        category: clubCategories,
                    }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`,
                    },
                    withCredentials: true,
                });

            if (response.status === 200) {
                return true;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 409) {
                openAlertMassage('Club name is already in use! \n Please try Different name ');
            } else if (response.status === 502) {
                openAlertMassage('You already has a Club !!');
            } else {
                openAlertMassage(
                    'Something Went Wrong. We are sorry, please try reloading the App.'
                );
            }

        } catch (error) {
            console.error(error?.message || 'Unknown error');
            if (error.status === 409) {
                openAlertMassage('Club name is already in use! \n Please try Different name ');
            } else if (error.status === 502) {
                openAlertMassage('You already has a Club !!');
            }

        }
    }
    return false;
}

export async function getAllClubsCategories(storedJwt, user, openSuccessMassage, openAlertMassage) {
    if (storedJwt) {
        try {
            const response = await axios.get(CLUBS_CATEGORIES_CALL_API, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`,
                },
            });
            if (response.status === 200) {
                return response.data;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 404) {
                return response.data;
            } else {
                openAlertMassage(
                    'Something Went Wrong. We are sorry, please try reloading the page.'
                );
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
        }


    }
    return null;
}

export async function getAllClubEventsById(storedJwt, user, openSuccessMassage, openAlertMassage, club) {
    if (storedJwt) {
        try {
            const response = await axios.get(`${GET_ALL_CLUB_EVENTS_CALL_API}${club.clubID}`, {
                headers: {
                    Authorization: `Bearer ${storedJwt}`,
                },
            });
            if (response.status === 200) {
                return response.data;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 404) {
                return response.data;
            } else {
                openAlertMassage(
                    'Something Went Wrong. We are sorry, please try reloading the page.'
                );
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
        }


    }
    return null;
}

//******************************************EVENT****************************************************************************
export async function CreateEventByManager(
    storedJwt, user, openSuccessMassage, openAlertMassage, clubManager, event, eventSponsors, eventSpeakers, eventCategories) {

    if (storedJwt && user && user.authority.authorityName === 'ROLE_MANAGER'
        && user.userID === clubManager.userID) {
        try {
            const response = await axios.post(CREATE_EVENT_URL,
                JSON.stringify(
                    {
                        event: event,
                        category: eventCategories,
                        speakers: eventSpeakers,
                        sponsors: eventSponsors

                    }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`,
                    },
                    withCredentials: true,
                });

            if (response.status === 200) {
                // openSuccessMassage('Event was Sent successfully.');
                return true;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 409) {
                openAlertMassage('Event name is already in use! \n Please try Different name ');
            } else {
                openAlertMassage(
                    'Something Went Wrong. We are sorry, please try to submit again!!.'
                );
            }

        } catch (error) {
            console.error(error?.message || 'Unknown error');
        }
    }
    return false;
}

export async function editEventByManager(
    storedJwt, user, openSuccessMassage, openAlertMassage, clubManager, event, eventSponsors, eventSpeakers, eventCategories) {

    if (storedJwt && user && user.authority.authorityName === 'ROLE_MANAGER'
        && user.userID === clubManager.userID) {
        try {

            const response = await axios.post(EDIT_EVENT_MANAGER_URL,
                JSON.stringify(
                    {
                        event: event,
                        category: eventCategories,
                        speakers: eventSpeakers,
                        sponsors: eventSponsors

                    }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`,
                    },
                    withCredentials: true,
                });

            if (response.status === 200) {
                return true;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 409) {
                openAlertMassage('Event name is already in use! \n Please try Different name ');
            } else {
                openAlertMassage(
                    'Something Went Wrong. We are sorry, please try to submit again!!.'
                );
            }

        } catch (error) {
            console.error(error?.message || 'Unknown error');
            openAlertMassage(
                'Something Went Wrong. We are sorry, please try again!!.'
            );
        }
    }
    return false;
}

export async function getAllEventsSpeakersAndSponsors(storedJwt, openSuccessMassage, openAlertMassage, event) {
    if (storedJwt) {
        try {
            const response = await axios.get(`${GET_ALL_EVENT_SPONSORS_SPEAKERS_CALL_API}${event.eventID}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`
                }
            });

            if (response.status === 200) {
                return (response.data);
            } else if (error.response) {
                switch (error.response.status) {
                    case 401:
                        openAlertMassage('Session expired, please login again');
                        break;
                    case 403:
                        openAlertMassage('Unauthorized access');
                        break;
                    case 404:
                        openAlertMassage('Endpoint not found');
                        break;
                    default:
                        openAlertMassage('Failed to load events');
                }
            } else {
                openAlertMassage('Network error - check your connection');
            }
        } catch (error) {
            console.error('request error:', error);
            openAlertMassage('Network error - check your connection');

        }
        return null;
    }
}

export async function getAllEventCategoriesById(storedJwt, openSuccessMassage, openAlertMassage) {
    if (storedJwt) {
        try {
            const response = await axios.get(GET_ALL_EVENTS_CATEGORIES_CALL_API, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`,
                },
            });
            if (response.status === 200) {
                return response.data;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 404) {
                return response.data;
            } else {
                openAlertMassage(
                    'Something Went Wrong. We are sorry, please try reloading the page.'
                );
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
        }


    }
    return null;
}

//******************************************ADMIN CONTROLS****************************************************************************
//****************************************** CLUB Management Functions ****************************************************************************
export async function deleteClub(storedJwt, user, openSuccessMessage, openAlertMessage, clubToDelete) {
    if (storedJwt && user && user.authority.authorityName === 'ROLE_ADMIN') {
        try {
            const response = await axios.delete(`${DELETE_CLUB_URL}${clubToDelete.clubID}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`,
                },
            });

            if (response.status === 200) {
                openSuccessMessage('Club deleted successfully');
                return true;
            } else if (response.status === 401) {
                openAlertMessage('You cant Delete This club!');
            } else {
                openAlertMessage('Server Error!');
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
            if (!error?.response) {
                openAlertMessage('No Server Response');
            } else {
                openAlertMessage('Something went wrong!');
            }
        }
    }
    return false;
}

export async function activateClub(storedJwt, user, openSuccessMessage, openAlertMessage, clubToActivate) {
    if (storedJwt && user && user.authority.authorityName === 'ROLE_ADMIN') {
        try {
            const response = await axios.put(`${ACTIVATE_CLUB_URL}${clubToActivate.clubID}`, null, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`,
                },
            });

            if (response.status === 200) {
                openSuccessMessage('Club activated successfully');
                return true;
            } else if (response.status === 401) {
                openAlertMessage('You cant Activate Club!');
            } else {
                openAlertMessage('Server Error!');
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
            if (!error?.response) {
                openAlertMessage('No Server Response');
            } else {
                openAlertMessage('Something went wrong!');
            }
        }
    }
    return false;
}

export async function rejectClub(storedJwt, user, openSuccessMessage, openAlertMessage, clubToReject, notificationMessage) {
    if (storedJwt && user && user.authority.authorityName === 'ROLE_ADMIN') {
        try {
            const response = await axios.put(REJECT_CLUB_URL,
                {
                    notification: {notificationMessage},
                    clubID: clubToReject.clubID,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`,
                    },
                }
            );

            if (response.status === 200) {
                openSuccessMessage('Club rejected successfully');
                return true;
            } else if (response.status === 401) {
                openAlertMessage('You cant Reject Club!');
            } else {
                openAlertMessage('Server Error!');
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
            if (!error?.response) {
                openAlertMessage('No Server Response');
            } else {
                openAlertMessage('Something went wrong!');
            }
        }
    }
    return false;
}

export async function deactivateClub(storedJwt, user, openSuccessMessage, openAlertMessage, clubToDeactivate, notificationMessage) {
    if (storedJwt && user && user.authority.authorityName === 'ROLE_ADMIN') {
        try {
            const response = await axios.put(DEACTIVATE_CLUB_URL,
                {
                    notification: {notificationMessage},
                    clubID: clubToDeactivate.clubID,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`,
                    },
                }
            );

            if (response.status === 200) {
                openSuccessMessage('Club deactivated successfully');
                return true;
            } else if (response.status === 401) {
                openAlertMessage('You cant Ban this Club!');
            } else {
                openAlertMessage('Server Error!');
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
            if (!error?.response) {
                openAlertMessage('No Server Response');
            } else {
                openAlertMessage('Something went wrong!');
            }
        }
    }
    return false;
}

export async function editClubAdmin(
    storedJwt, user, openSuccessMassage, openAlertMassage, clubManager, clubToEdit, clubCategories) {

    if (storedJwt && user && user.authority.authorityName === 'ROLE_ADMIN') {
        try {
            const response = await axios.put(EDIT_CLUB_ADMIN_URL,
                JSON.stringify(
                    {
                        userID: clubManager.userID,
                        club: {
                            clubID: clubToEdit.clubID,
                            clubName: clubToEdit.clubName,
                            clubDescription: clubToEdit.clubDescription,
                            clubCoverPicURL: clubToEdit.clubCoverPicURL,
                            contactEmail: clubToEdit.contactEmail,
                            contactNumber: clubToEdit.contactNumber,
                            clubProfilePicURL: clubToEdit.clubProfilePicURL,
                        },
                        category: clubCategories,

                    }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`,
                    },
                    withCredentials: true,
                });

            if (response.status === 200) {

                return true;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 409) {
                openAlertMassage('Club name is already in use! \n Please try Different name ');
            } else if (response.status === 502) {
                openAlertMassage('user already has a Club !!');
            } else {
                openAlertMassage(
                    'Something Went Wrong. We are sorry, please try reloading the page.'
                );
            }

        } catch (error) {
            console.error(error?.message || 'Unknown error');
        }
    }
    return false;
}

//****************************************** Event Management Functions ****************************************************************************
export async function rejectEvent(storedJwt, user, openSuccessMessage, openAlertMessage, eventToReject, notificationMessage) {
    if (storedJwt && user && user.authority.authorityName === 'ROLE_ADMIN') {
        try {
            const response = await axios.put(REJECT_EVENT_URL,
                {
                    notification: {notificationMessage},
                    eventID: eventToReject.eventID,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`,
                    },
                }
            );

            if (response.status === 200) {
                openSuccessMessage('Event rejected successfully');
                return true;
            } else if (response.status === 401) {
                openAlertMessage('You cant Reject Event!');
            } else {
                openAlertMessage('Server Error!');
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
            if (!error?.response) {
                openAlertMessage('No Server Response');
            } else {
                openAlertMessage('Something went wrong!');
            }
        }
    }
    return false;
}

export async function activateEvent(storedJwt, user, openSuccessMessage, openAlertMessage, eventToActivate) {
    if (storedJwt && user && user.authority.authorityName === 'ROLE_ADMIN') {
        try {
            const response = await axios.put(`${ACTIVATE_EVENT_URL}${eventToActivate.eventID}`, null, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`,
                },
            });

            if (response.status === 200) {
                openSuccessMessage('Event activated successfully');
                return true;
            } else if (response.status === 401) {
                openAlertMessage('You cant Activate Event!');
            } else {
                openAlertMessage('Server Error!');
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
            if (!error?.response) {
                openAlertMessage('No Server Response');
            } else {
                openAlertMessage('Something went wrong!');
            }
        }
    }
    return false;
}

export async function deactivateEvent(storedJwt, user, openSuccessMessage, openAlertMessage, eventToDeactivate, notificationMessage) {
    if (storedJwt && user && user.authority.authorityName === 'ROLE_ADMIN') {
        try {
            const response = await axios.put(DEACTIVATE_EVENT_URL,
                {
                    notification: {notificationMessage},
                    eventID: eventToDeactivate.eventID,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`,
                    },
                }
            );

            if (response.status === 200) {
                openSuccessMessage('Event deactivated successfully');
                return true;
            } else if (response.status === 401) {
                openAlertMessage('You cant Delete Event!');
            } else {
                openAlertMessage('Server Error!');
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
            if (!error?.response) {
                openAlertMessage('No Server Response');
            } else {
                openAlertMessage('Something went wrong!');
            }
        }
    }
    return false;
}

export async function deleteEventById(storedJwt, user, openSuccessMassage, openAlertMassage, event) {
    if (storedJwt && user &&
        user.authority.authorityName === 'ROLE_ADMIN' ||
        (user.authority.authorityName === 'ROLE_MANAGER' && user.userID === event.club.clubManager.userID)) {
        try {
            const response = await axios.delete(`${DELETE_EVENT_URL}${event.eventID}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`,
                },
            });
            if (response.status === 200) {
                return true;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else {
                openAlertMassage(
                    'Something Went Wrong. We are sorry, please try to submit again!!.'
                );
            }

        } catch (error) {
            console.error(error?.message || 'Unknown error');
            openAlertMassage(
                'Something Went Wrong. We are sorry, please try Later.'
            );
        }
    }
    return false;
}

//***************************************************Notifications********************************************************************
export async function getAllAdminNotifications(userId, user, storedJwt, openAlertMassage) {
    if (userId && storedJwt) {
        try {
            const response = await axios.get(`${GET_ALL_ADMIN_NOTIFICATIONS}${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`
                }
            });

            if (response.status === 200) {
                return response.data;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 404) {
                return null;
            } else {
                openAlertMassage('Something went wrong while fetching admin notifications.');
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
        }
    }
    return null;
}

export async function getAllClubNotifications(userId, user, storedJwt, openAlertMassage) {
    if (userId && storedJwt && user?.authority?.authorityID === 3) {
        try {
            const response = await axios.get(`${GET_ALL_CLUB_NOTIFICATIONS}${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`
                }
            });

            if (response.status === 200) {
                return response.data;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 404) {
                return null;
            } else {
                openAlertMassage('Something went wrong while fetching club notifications.');
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
        }
    }
    return null;
}

export async function markAdminNotificationAsRead(notificationId, storedJwt, openAlertMassage) {
    if (notificationId && storedJwt) {
        try {
            const response = await axios.put(
                `${READ_ADMIN_NOTIFICATION}${notificationId}`,
                null,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`,
                    },
                }
            );

            if (response.status === 200) {
                return true;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 404) {
                return null;
            } else {
                openAlertMassage('Something went wrong while marking notification as read.');
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
        }
    }
    return false;
}

export async function markClubNotificationAsRead(notificationId, storedJwt, openAlertMassage) {
    if (notificationId && storedJwt) {
        try {
            const response = await axios.put(`${READ_CLUB_NOTIFICATION}${notificationId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`
                }
            });

            if (response.status === 200) {
                return true;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 404) {
                return null;
            } else {
                openAlertMassage('Something went wrong while marking notification as read.');
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
        }
    }
    return false;
}

export async function markEventNotificationAsRead(notificationId, storedJwt, openAlertMassage) {
    if (notificationId && storedJwt) {
        try {
            const response = await axios.put(`${READ_EVENT_NOTIFICATION}${notificationId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`
                }
            });

            if (response.status === 200) {
                return true;
            } else if (response.status === 401) {
                openAlertMassage('Authorization Expired');
            } else if (response.status === 404) {
                return null;
            } else {
                openAlertMassage('Something went wrong while marking notification as read.');
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
        }
    }
    return false;
}

export async function clearNotificationToken(storedJwt, user) {
    if (storedJwt && user) {
        try {
            const response = await axios.put(CLEAR_NOTIFICATION_TOKEN_URL,
                null,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`,
                    },
                }
            );

            if (response.status === 200) {
                return true;
            } else {
                console.error('Server Error!');
            }
        } catch (error) {
            console.error(error?.message || 'Unknown error');
            if (!error?.response) {
                console.error('No Server Response');
            } else {
                console.error('Something went wrong!');
            }
        }
    }
    return false;
}

