# Azmera developer shortcuts
# On Windows: use `make` via Git Bash / WSL, or run the pnpm/commands directly.

.PHONY: help install build lint dev preview backend-deps compose-up compose-down

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install frontend dependencies
	pnpm --dir frontend install

build: ## Type-check + build the frontend
	pnpm --dir frontend build

lint: ## Lint the frontend
	pnpm --dir frontend lint

dev: ## Run the Vite dev server (frontend)
	pnpm --dir frontend dev

preview: ## Serve the production build on :4173
	pnpm --dir frontend preview

backend-deps: ## Install backend Python dependencies (later)
	pip install -r backend/requirements/dev.txt

compose-up: ## Start local infra (Postgres + Redis)
	docker compose up -d

compose-down: ## Stop local infra
	docker compose down