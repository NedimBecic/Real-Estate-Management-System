# Real Estate Management System

A real estate management web application developed for a university course (Web Technologies, ETF Sarajevo).

## Core Functionality

*   **Users:** Register, login, manage profiles, view interaction history (inquiries, viewings, offers).
*   **Properties:** Browse, filter (price, size, type), and view detailed listings (apartments, houses, commercial).
*   **Interactions:** Submit inquiries, request viewings, make/negotiate offers.
*   **Admin:** Manage listings, user requests, and site content.
*   **Analytics:** Visualize price distributions, average metrics, and market trends.
*   **News:** Built-in news section for market updates.

## Next Steps

*   Migrate database to the cloud.
*   Deploy to a hosting service.


## Technical Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js for data visualization

### Backend
- Node.js
- Express.js
- MySQL (using XAMP) with Sequelize ORM
- bcrypt for password hashing

### Database
- Korisnik
- Nekretnina
- Slike
- Upit
- Zahtjev
- Ponuda
- Vijest

## Setup Instructions

1. Install Dependencies
```bash
npm install
```

2. Configure Database
- Create a MySQL database named 'wt24'
- Update database credentials in database.js

3. Initialize Database
```bash
node index.js
```

4. Access Application
- Open `http://localhost:3000` in your browser
- Default admin credentials:
  - Username: admin
  - Password: admin
- Default user credentials:
  - Username: user
  - Password: user

## Project Structure

```
├── public/
│   ├── css/            # Stylesheet files
│   ├── html/           # HTML templates
│   ├── scripts/        # Client-side JavaScript
│   └── Resources/      # Static resources (images)
├── data/               # JSON data files
├── database.js         # Database configuration
├── dataMigration.js    # Data seeding script
└── index.js           # Main server file
```

## License

This project is licensed under the MIT License.
