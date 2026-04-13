#!/bin/bash
# Exits immediately if a pipeline returns a non-zero status
set -e

# ANSI colour codes for the GoTasks.sys terminal aesthetic
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Colour

echo -e "${GREEN}[SYSTEM]: Initializing GoTasks Full-Stack Environment...${NC}\n"

# Ensures environment variables exist before attempting a build sequence
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${BLUE}[INFO]: Generated .env file from .env.example template.${NC}"
    else
        echo -e "${RED}[FATAL]: .env file missing and no template found. Aborting.${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}[INFO]: Compiling system containers...${NC}"
docker compose build

echo -e "${BLUE}[INFO]: Booting PostgreSQL and Redis clusters...${NC}"
docker compose up -d db redis

echo -e "${BLUE}[INFO]: Awaiting database health verification...${NC}"
# Polls the native Docker healthcheck defined in compose file rather than a blind sleep
until [ "$(docker inspect -f '{{.State.Health.Status}}' $(docker compose ps -q db))" == "healthy" ]; do
    printf '.'
    sleep 2
done
echo -e "\n${GREEN}[SUCCESS]: Database cluster is fully operational.${NC}\n"

echo -e "${BLUE}[INFO]: Applying Django database migrations...${NC}"
docker compose run --rm backend python manage.py migrate

echo -e "${BLUE}[INFO]: Collecting static assets for Nginx delivery...${NC}"
docker compose run --rm backend python manage.py collectstatic --noinput

echo -e "${BLUE}[INFO]: Initializing Root Administrator account (Interactive)...${NC}"
# Uses 'run --rm' to attach an interactive TTY session for secure password entry
docker compose run --rm backend python manage.py createsuperuser || echo -e "${BLUE}[INFO]: Superuser creation bypassed or already exists.${NC}"

echo -e "\n${GREEN}[SYSTEM]: Deployment architecture successfully scaffolded!${NC}"
echo "========================================================"
echo -e "Access the application via the Nginx Gateway:"
echo -e "  > ${GREEN}Main Workspace:${NC}  http://localhost"
echo -e "  > ${GREEN}Admin Terminal:${NC}  http://localhost/admin"
echo "========================================================"
echo -e "Execute '${BLUE}docker compose up${NC}' to boot the full stack."
echo -e "Execute '${BLUE}docker compose down${NC}' to suspend operations."