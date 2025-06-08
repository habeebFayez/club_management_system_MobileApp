# ReactNativeClubMS

## Overview
ReactNativeClubMS is a robust mobile application built with React Native, designed to streamline club and event management. This project, developed as a final-year graduation project, offers a seamless experience for both administrators and users to manage club activities, events, and user interactions efficiently.

## Features
- **User Authentication**: Secure login and registration powered by JWT authentication.
- **Bottom Tab Navigation**: Smooth and animated navigation for an intuitive user experience.
- **Profile Management**: Users can view and edit their profiles with ease.
- **Club & Event Management**: Access detailed club information, upcoming events, and schedules.
- **Admin Dashboard**: Comprehensive oversight of clubs, members, and event statistics.
- **Animated UI Components**: Enjoy smooth transitions and interactions for an enhanced user experience.

## Technologies Used
- **React Native**: Cross-platform mobile development framework.
- **Expo**: Simplified app building and testing environment.
- **React Navigation**: Stack and tab-based navigation for seamless user flow.
- **AsyncStorage**: Persistent user authentication data storage.
- **Axios**: Efficient API communication for user authentication and data fetching.
- **Reanimated**: Smooth UI animations for an enhanced user experience.
- **JWT Authentication**: Secure user sessions and data protection.

## Project Architecture
The project is structured into several key directories:
- **`app/`**: Contains the main application screens and components.
- **`api/`**: Houses API-related code, including Firebase configuration and API calls.
- **`component/`**: Reusable UI components used throughout the application.
- **`contexts/`**: React Context providers for state management.
- **`navigators/`**: Navigation configuration for the app.
- **`services/`**: Business logic and service-related code.
- **`util/`**: Utility functions and helpers.
- **`assets/`**: Static assets like images and fonts.

## Key Components
- **`MainApp.js`**: The entry point of the application, handling authentication and initial setup.
- **`App.js`**: Root component for the application.
- **`PrivateRoute/`**: Manages protected routes and authentication checks.
- **`navigators/`**: Contains stack and tab navigators for seamless navigation.

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/habeebFayez/club_management_system_MobileApp.git
   ```
2. Navigate to the project directory:
   ```sh
   cd club_management_system_MobileApp
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the development server:
   ```sh
   npm start
   ```

## Usage
- **User Authentication**: Log in or register to access the app.
- **Club Management**: View and manage club details and events.
- **Admin Dashboard**: Oversee clubs, members, and event statistics.

## Future Enhancements
- Push Notifications for Events
- Dark Mode Support
- Club Membership Requests
- Offline Data Storage

## Contributions
This project is part of my graduation project. Contributions, issues, and feature requests are welcome!

## License
This project is licensed under the MIT License - see the LICENSE file for details.

