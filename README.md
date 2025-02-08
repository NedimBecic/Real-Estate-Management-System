# Real Estate Management System

A comprehensive real estate management system developed as part of the Web Technologies (Web Tehnologije) course at the Faculty of Electrical Engineering, University of Sarajevo. The system provides a complete solution for managing real estate listings, user interactions, and property analytics.

## Overview

The system enables real estate management through a user-friendly web interface. Users can browse available properties, make inquiries, submit viewing requests, and place offers. The platform supports both regular users and administrators, with administrators having additional capabilities for managing property requests and system content. All interactions are tracked and managed through a robust backend system, providing a complete solution for real estate agencies.

## Features

The user management system provides complete authentication functionality, allowing users to register, log in, and manage their profiles. Users can view their interaction history, including their property inquiries, viewing requests, and offers. The system implements session management with automatic timeout and protection against excessive login attempts.

Property management is at the core of the system. Users can browse through detailed property listings, which include comprehensive information about each property including its specifications, location, and pricing. The system supports different property types including apartments, houses, and commercial spaces. Users can filter properties based on various criteria such as price range and square footage.

The interaction system allows users to engage with properties in multiple ways. They can submit general inquiries, request property viewings for specific dates, and make price offers. The system supports a negotiation process where offers can receive counter-offers. Administrators can manage and respond to all types of requests through a dedicated interface.

The analytics module provides valuable insights through various statistical analyses. Users can view property price distributions through interactive histograms, analyze average property metrics based on different criteria, and identify outlier properties in the market. The system also supports period-based analysis for tracking market trends.

The news system keeps users informed about real estate market developments. It features a complete news article management system with support for featured articles and categorization.

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
