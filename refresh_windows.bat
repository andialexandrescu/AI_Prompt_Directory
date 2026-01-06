@echo on
set NODE_ENV=development
del db_ai_prompt_dir.sqlite
call npx sequelize db:migrate
call npx sequelize db:seed:all