# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
# Green-Campus

## Environment Setup

This project requires environment variables to be set up for proper functionality. Follow these steps to configure your environment:

### 1. Create Environment Files

#### Frontend Environment File
Create a `.env.local` file in the root directory of the project with the following content:

``

#### Backend Environment File (Optional)
If you want to customize server settings, create a `.env` file in the `server/` directory:

```
# Server Configuration
PORT=4000
JWT_SECRET=your-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

### 2. Environment Variables

The following environment variables are used in this project:

#### Frontend (React App)
- `REACT_APP_GOOGLE_MAPS_API_KEY`: Your Google Maps API key for map functionality

#### Backend (Server)
- `PORT`: Server port (defaults to 4000)
- `JWT_SECRET`: Secret key for JWT token signing (defaults to 'changeme')
- `ADMIN_USERNAME`: Admin username (defaults to 'admin')
- `ADMIN_PASSWORD`: Admin password (defaults to 'admin')

### 3. Security Note

The `.env.local` file is already included in `.gitignore` to prevent sensitive information from being committed to version control. Never commit API keys or other sensitive information to your repository.

## Available Scripts
