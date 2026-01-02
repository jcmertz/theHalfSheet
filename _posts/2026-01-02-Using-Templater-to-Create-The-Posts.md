---
layout: post
title: Using Templater to Create The Posts
date: 2026-01-02
categories:
---
A quick simple update today, to help create the posts in Obsidian I am using the [Templater](https://github.com/SilentVoid13/Templater) plugin to generate my headmatter and post title, following the format Jekyll wants. Here is the template I am using:

```
<%*
const title = tp.frontmatter.title ?? await tp.system.prompt("Enter title for new post");
const date = tp.date.now("YYYY-MM-DD");

const safeTitle = title
  .replace(/[\/\\?%*:|"<>]/g, "")
  .replace(/\s+/g, "-")
  .trim();

await tp.file.rename(`${date}-${safeTitle}`);

tR += `---\nlayout: post\ntitle: "${title.replace(/"/g, '\\"')}"\ndate: "${date}"\ncategories:\n---\n\n`;
%>
```

This is being used in combination with the [Hot Keys for Templates Plugin](https://github.com/Vinzent03/obsidian-hotkeys-for-templates) that allows the template to be used automatically for every new note created in my \_posts folder.

Looking forward to exploring Tempater more as I look into theming this site, and continue using and optimizing Obsidian for my daily note taking.