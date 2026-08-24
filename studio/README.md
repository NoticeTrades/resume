# Nick's Musings Studio

This private editorial workspace publishes articles to the `production` dataset in Sanity project `vzrug3c0`.

It also manages two connected learning collections:

- **Learning Resource** — books, courses, certifications, papers, videos, podcasts, and other material in the public Learning Library.
- **Learning Note** — lightweight Today I Learned entries that can optionally reference a Learning Resource.

The relationship only needs to be selected on the Learning Note. The website automatically gathers every referencing note on its Resource page.

## Local use

```powershell
cd studio
npm run dev
```

Sign in with the Sanity account that owns the project. Create an Article, complete all required fields, generate its slug, and select **Publish**.

### Publish a Learning Resource

1. Open **Learning Resource** and create a document.
2. Add the title, generate the slug, select its type and status, and provide a short description.
3. Set progress between 0 and 100. Add a rating, cover, thoughts, takeaways, dates, and an external link when useful.
4. Select **Publish**. It will appear at `/library`.

### Publish a Learning Note

1. Open **Learning Note** and create a document.
2. Add the title, generate the slug, write the short body, and choose a category.
3. Optionally select a **Learning from** resource. Leave reading time blank to let the website calculate it.
4. Select **Publish**. It will appear at `/notes` and, when connected, on the related Resource page.

## Hosted Studio

```powershell
cd studio
npm run deploy
```

Sanity will prompt for a unique `*.sanity.studio` hostname during the first deployment.

Hosted Studio: `https://bynickthomas.sanity.studio/`
