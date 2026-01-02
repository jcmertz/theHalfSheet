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
