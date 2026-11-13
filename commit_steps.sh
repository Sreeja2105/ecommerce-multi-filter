# Run these from inside the ecommerce-multi-filter folder (Git Bash or PowerShell)
git init
git branch -M main
git add .gitignore README.md
git commit -m "chore: project setup with README and gitignore"
git add backend/package.json backend/src/server.js backend/src/app.js backend/src/utils
git commit -m "feat(backend): express server skeleton with error handling"
git add backend/src/data
git commit -m "feat(backend): add seeded master product inventory dataset"
git add backend/src/services
git commit -m "feat(backend): combinatorial intersect filter with null handling + sort pipeline"
git add backend/src/validators backend/src/controllers backend/src/routes
git commit -m "feat(backend): products API with query validation and meta endpoint"
git add backend/tests
git commit -m "test(backend): unit tests for filter, sort and validator"
git add frontend/index.html frontend/css
git commit -m "feat(frontend): layout with sticky sidebar and product grid styles"
git add frontend/js
git commit -m "feat(frontend): instant filtering, dual price slider, sort dropdown, empty state"
git add -A
git commit -m "chore: final cleanup"
