# Lost and Found Board

## Description
The Lost and Found Board is a simple web application built with Node.js and Express that allows users to add, view, and delete lost and found items. The application follows the MVC architecture and uses a JSON file for data storage.

## Features
- Add new items to the lost and found board
- View a list of all items
- Delete items from the board

## Project Structure
```
lost-and-found-board
├── src
│   ├── app.js
│   ├── controllers
│   │   └── itemsController.js
│   ├── models
│   │   └── itemModel.js
│   ├── routes
│   │   └── itemsRoutes.js
│   ├── views
│   │   ├── layouts
│   │   │   └── main.ejs
│   │   ├── index.ejs
│   │   └── items
│   │       ├── list.ejs
│   │       └── form.ejs
│   └── public
│       ├── css
│       │   └── styles.css
│       └── js
│           └── main.js
├── data
│   └── items.json
├── package.json
├── .gitignore
└── README.md
```

## Installation
1. Clone the repository or download the project files.
2. Navigate to the project directory in the terminal.
3. Run `npm install` to install the required dependencies.

## Usage
1. Start the server with `node src/app.js`.
2. Open a web browser and go to `http://localhost:3000` to access the application.

## License
This project is licensed under the MIT License.