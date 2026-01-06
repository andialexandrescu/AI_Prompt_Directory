NODE_ENV=development
rm -rf db_ai_prompt_dir.sqlite # del db_ai_prompt_dir.sqlite
npx sequelize db:migrate
npx sequelize db:seed:all