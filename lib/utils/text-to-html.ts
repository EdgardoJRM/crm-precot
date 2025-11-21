/**
 * Convert plain text to HTML email format
 * Preserves line breaks and converts them to <br> tags
 * Supports dynamic tags like {{nombre}}, {{email}}, etc.
 */

export function textToHtml(text: string): string {
  if (!text) return '';

  // Escape HTML to prevent XSS (but keep dynamic tags)
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Restore dynamic tags (they should not be escaped)
  html = html
    .replace(/&lt;\/?\{\{/g, '{{')
    .replace(/\}\}\&gt;/g, '}}')
    .replace(/&amp;lt;\/?\{\{/g, '{{')
    .replace(/\}\}&amp;gt;/g, '}}');

  // Convert line breaks to <br> tags
  html = html.replace(/\n/g, '<br>');

  // Wrap in proper HTML structure
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
${html}
</body>
</html>`;
}

/**
 * Convert HTML back to plain text (for editing)
 * Removes HTML tags but preserves content
 */
export function htmlToText(html: string): string {
  if (!html) return '';

  // Remove HTML structure
  let text = html
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<body[^>]*>/gi, '')
    .replace(/<\/body>/gi, '');

  // Convert <br> tags back to line breaks
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Remove other HTML tags but keep content
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');

  return text.trim();
}

