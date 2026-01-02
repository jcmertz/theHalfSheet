# _plugins/obsidian_image_rewrite.rb
require "open3"

Jekyll::Hooks.register :documents, :pre_render do |doc|
  next unless doc.collection&.label == "posts"
  next unless doc.extname == ".md"

  script = File.join(doc.site.source, "scripts", "obsidian-images.js")
  next unless File.exist?(script)

  stdout, stderr, status = Open3.capture3(
    "node", script, "--stdin",
    chdir: doc.site.source,
    stdin_data: doc.content
  )

  if status.success?
    doc.content = stdout
    Jekyll.logger.info "ObsidianImages:", "rewrote in-memory #{doc.relative_path}"
  else
    Jekyll.logger.error "ObsidianImages:", "rewrite failed for #{doc.relative_path}"
    Jekyll.logger.error(stderr.strip) unless stderr.strip.empty?
  end
end
