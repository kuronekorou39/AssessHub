# Docker Setup for AssessHub

This directory contains Docker configuration files for running the AssessHub application locally.

## Files

- `Dockerfile.server`: Docker configuration for the Flask backend
- `Dockerfile.client`: Docker configuration for the React frontend
- `../docker-compose.yml`: Docker Compose configuration for orchestrating all services

## Running Locally

To run the application locally using Docker Compose:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Services

The Docker Compose setup includes the following services:

1. **postgres**: PostgreSQL database
   - Port: 5432
   - Credentials: postgres/postgres
   - Database: assesshub

2. **server**: Flask backend
   - Port: 5000
   - API endpoint: http://localhost:5000

3. **client**: React frontend
   - Port: 3000
   - Web interface: http://localhost:3000

## Initial Setup

When running the application for the first time, you need to initialize the database:

```bash
# Access the server container
docker-compose exec server bash

# Run the database initialization script
python init_db.py

# Exit the container
exit
```

## Building Electron App

For development, the React app is served by a web server in a container. For production, you can build the Electron app:

```bash
# Navigate to the client directory
cd client

# Install dependencies
pnpm install

# Build the Electron app
pnpm build

# Package the Electron app
pnpm package
```

## AWS Deployment Considerations

The Docker setup is designed with future AWS deployment in mind:

- The Flask backend can be deployed to AWS ECS or Elastic Beanstalk
- The PostgreSQL database can be migrated to Amazon RDS
- Authentication can be integrated with Amazon Cognito
- API endpoints can be exposed through Amazon API Gateway
