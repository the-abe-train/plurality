![Plurality Banner](https://plurality.fun/preview.png)

# Running Plurality Locally

1. Install the [Netlify CLI](https://www.netlify.com/products/dev/) with `npm i -g netlify-cli`
2. Create a .env file and add the following to it:
```
ROOT_DOMAIN=http://localhost:3000
COOKIE_SIGNATURE=cookiesignature
JWT_SIGNATURE=jwtsignature
```
3. Add a database connection to the `.env` file. Plurality will not run without a connection to a Mongo Atlas database. Create your own account and database or reach out to Abe (@theAbeTrain on Twitter) for access to the staging database or sample data.
Use the info from your Atlas database to create the env variables `MONGO_URL` and `DATABASE_NAME`.
4. Install dependencies with `npm i`.
5. Start up the development server with `npm run dev`. 
6. Open up [http://localhost:3000](http://localhost:3000), and you should be ready to go!


# Remix docs
- [Remix Docs](https://remix.run/docs)


# License

Shield: [![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg